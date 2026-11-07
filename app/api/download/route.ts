import { get } from "@vercel/blob";
import Stripe from "stripe";
import { auth } from "@/auth";

const GAME_PRICE_CENTS = 1500;
const GAME_FILES = {
  android: {
    blobPath: "games/aim-trainer-android.apk",
    fileName: "AimTrainer.apk",
    contentType: "application/vnd.android.package-archive",
  },
  linux: {
    blobPath: "games/aim-trainer-linux.zip",
    fileName: "AimTrainer-linux-x86_64.zip",
    contentType: "application/zip",
  },
  macos: {
    blobPath: "games/aim-trainer-macos.zip",
    fileName: "AimTrainer-macos-x86_64.zip",
    contentType: "application/zip",
  },
  windows: {
    blobPath: "games/aim-trainer-windows.exe",
    fileName: "Aim Trainer.exe",
    contentType: "application/octet-stream",
  },
} as const;

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Sign in before downloading." }, { status: 401 });
  }

  const searchParams = new URL(request.url).searchParams;
  const sessionId = searchParams.get("session_id");
  const platform = searchParams.get("platform") ?? "windows";
  const gameFile =
    platform in GAME_FILES
      ? GAME_FILES[platform as keyof typeof GAME_FILES]
      : undefined;
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!sessionId || !secretKey || !gameFile) {
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

    const game = await get(gameFile.blobPath, { access: "private" });
    if (!game || game.statusCode !== 200) {
      return Response.json(
        { error: "The download could not be prepared. Please try again." },
        { status: 404 },
      );
    }

    return new Response(game.stream, {
      headers: {
        "Content-Disposition": `attachment; filename="${gameFile.fileName}"`,
        "Content-Type": gameFile.contentType,
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
