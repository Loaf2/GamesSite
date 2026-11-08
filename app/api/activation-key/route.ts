import { createHash, randomBytes } from "node:crypto";
import Stripe from "stripe";
import { auth } from "@/auth";
import { getOrCreatePlayerActivationKey } from "@/lib/db";
import { isOwnerEmail } from "@/app/lib/owner";

const GAME_PRICE_CENTS = 1500;

function generateActivationKey() {
  const groups = randomBytes(16)
    .toString("hex")
    .toUpperCase()
    .match(/.{4}/g);
  if (!groups) {
    throw new Error("Could not generate an activation key.");
  }
  return `AIM-${groups.join("-")}`;
}

function ownerActivationKey(userId: string) {
  const digest = createHash("sha256")
    .update(`owner:${userId}:${process.env.AUTH_SECRET ?? ""}`)
    .digest("hex")
    .toUpperCase();
  const groups = digest.slice(0, 16).match(/.{4}/g) ?? [];
  return `AIM-${groups.join("-")}`;
}

export async function GET(request: Request) {
  const authSession = await auth();
  const userId = authSession?.user?.id;
  if (!userId) {
    return Response.json({ error: "Sign in to view your activation key." }, { status: 401 });
  }

  if (isOwnerEmail(authSession?.user?.email)) {
    return Response.json(
      { activationKey: ownerActivationKey(userId) },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  }

  const checkoutSessionId = new URL(request.url).searchParams.get("session_id");
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!checkoutSessionId || !secretKey) {
    return Response.json({ error: "A paid checkout is required." }, { status: 403 });
  }

  try {
    const stripe = new Stripe(secretKey);
    const checkoutSession = await stripe.checkout.sessions.retrieve(checkoutSessionId);
    const isValidPurchase =
      checkoutSession.payment_status === "paid" &&
      checkoutSession.metadata?.product === "aim-trainer" &&
      checkoutSession.metadata?.user_id === userId &&
      checkoutSession.amount_subtotal === GAME_PRICE_CENTS &&
      checkoutSession.currency === "eur";

    if (!isValidPurchase) {
      return Response.json({ error: "A paid checkout is required." }, { status: 403 });
    }

    const activationKey = await getOrCreatePlayerActivationKey({
      checkoutSessionId,
      userId,
      activationKey: generateActivationKey(),
    });

    if (!activationKey) {
      return Response.json({ error: "This purchase does not belong to your account." }, { status: 403 });
    }

    return Response.json(
      { activationKey },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("Could not verify purchase or retrieve activation key", error);
    return Response.json(
      { error: "The activation key could not be prepared. Please try again." },
      { status: 502 },
    );
  }
}
