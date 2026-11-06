import { promises as fs } from "fs";
import path from "path";
import JSZip from "jszip";
import Stripe from "stripe";
import { auth } from "@/auth";

const GAME_DIR = path.join(process.cwd(), "public", "Game");
const GAME_PRICE_CENTS = 1500;

async function hasPaidGameSession(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("session_id");
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!sessionId || !secretKey) return false;

  const stripe = new Stripe(secretKey);
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return (
    session.payment_status === "paid" &&
    session.metadata?.product === "aim-trainer" &&
    session.amount_total === GAME_PRICE_CENTS &&
    session.currency === "eur"
  );
}

async function addDirectory(zip: JSZip, dir: string, prefix: string) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    const zipPath = `${prefix}/${entry.name}`;
    if (entry.isDirectory()) {
      await addDirectory(zip, fullPath, zipPath);
    } else {
      zip.file(zipPath, await fs.readFile(fullPath));
    }
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new Response("Sign in before downloading.", { status: 401 });
    }

    if (!(await hasPaidGameSession(request))) {
      return new Response("A paid checkout is required.", { status: 403 });
    }

    const zip = new JSZip();
    await addDirectory(zip, GAME_DIR, "Game");
    const body = await zip.generateAsync({ type: "uint8array" });
    return new Response(body as BodyInit, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="Game.zip"',
      },
    });
  } catch {
    return new Response("Game not found", { status: 404 });
  }
}
