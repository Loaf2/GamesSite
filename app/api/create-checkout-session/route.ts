import Stripe from "stripe";
import { auth } from "@/auth";

const GAME_PRICE_CENTS = 1500;

export async function POST(request: Request) {
  const authSession = await auth();
  if (!authSession?.user) {
    return Response.json({ error: "Sign in before checkout." }, { status: 401 });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return Response.json(
      { error: "Stripe is not configured on the server." },
      { status: 500 },
    );
  }

  try {
    const stripe = new Stripe(secretKey);
    const origin = new URL(request.url).origin;
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      managed_payments: { enabled: true },
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Aim Trainer",
              tax_code: "txcd_10201000",
            },
            unit_amount: GAME_PRICE_CENTS,
          },
          quantity: 1,
        },
      ],
      metadata: {
        product: "aim-trainer",
        user_id: authSession.user.id,
      },
      success_url: `${origin}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: origin,
    });

    if (!checkoutSession.url) {
      return Response.json(
        { error: "Stripe did not return a checkout URL." },
        { status: 502 },
      );
    }

    return Response.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Could not create Stripe Checkout Session", error);
    return Response.json(
      { error: "Checkout could not be started. Please try again." },
      { status: 502 },
    );
  }
}
