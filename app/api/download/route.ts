import { readFile } from "node:fs/promises";
import path from "node:path";
import Stripe from "stripe";
import { auth } from "@/auth";

const GAME_PRICE_CENTS = 1500;
const GAME_FILES = {
  linux: "AimTrainer-linux-x86_64.zip",
  macos: "AimTrainer-macos-x86_64.zip",
  windows: "Aim Trainer.exe",
} as const;

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Sign in before downloading." }, { status: 401 });
  }

  const searchParams = new URL(request.url).searchParams;
  const sessionId = searchParams.get("session_id");
  const platform = searchParams.get("platform") ?? "windows";
  const gameFileName =
    platform in GAME_FILES
      ? GAME_FILES[platform as keyof typeof GAME_FILES]
      : undefined;
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!sessionId || !secretKey || !gameFileName) {
    return Response.json({ error: "A paid checkout is required." }, { status: 403 });
  }

  try {
    const stripe = new Stripe(secretKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const isValidPurchase =
      session.payment_status === "paid" &&
      session.metadata?.product === "aim-trainer" &&
      session.amount_total === GAME_PRICE_CENTS &&
      session.currency === "eur";

    if (!isValidPurchase) {
      return Response.json({ error: "A paid checkout is required." }, { status: 403 });
    }

    const game = await readFile(path.join(process.cwd(), "private", gameFileName));
    return new Response(new Uint8Array(game), {
      headers: {
        "Content-Disposition": `attachment; filename="${gameFileName}"`,
        "Content-Type": "application/octet-stream",
        "Content-Length": String(game.byteLength),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Could not verify Stripe purchase or serve game", error);
    return Response.json(
      { error: "The download could not be prepared. Please try again." },
      { status: 502 },
    );
  }
}
