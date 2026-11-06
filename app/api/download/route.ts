import { readFile } from "node:fs/promises";
import path from "node:path";
import Stripe from "stripe";

const GAME_PRICE_CENTS = 1500;
const GAME_FILE_NAME = "Aim Trainer.exe";

export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("session_id");
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!sessionId || !secretKey) {
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

    const game = await readFile(path.join(process.cwd(), "private", GAME_FILE_NAME));
    return new Response(new Uint8Array(game), {
      headers: {
        "Content-Disposition": `attachment; filename="${GAME_FILE_NAME}"`,
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
