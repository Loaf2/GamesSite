import Stripe from "stripe";

const GAME_PRICE_CENTS = 1500;

export async function POST(request: Request) {
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
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      managed_payments: { enabled: false },
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: "Aim Trainer" },
            unit_amount: GAME_PRICE_CENTS,
          },
          quantity: 1,
        },
      ],
      metadata: { product: "aim-trainer" },
      success_url: `${origin}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: origin,
    });

    if (!session.url) {
      return Response.json(
        { error: "Stripe did not return a checkout URL." },
        { status: 502 },
      );
    }

    return Response.json({ url: session.url });
  } catch (error) {
    console.error("Could not create Stripe Checkout Session", error);
    return Response.json(
      { error: "Checkout could not be started. Please try again." },
      { status: 502 },
    );
  }
}
