import PurchaseButton from "./purchase-button";

const PRICE = "€15.00";

export const instant = false;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 py-12 text-zinc-100">
      <section className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl sm:p-10">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">
          Aim Trainer
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          Sharpen your aim.
        </h1>
        <p className="mt-4 leading-7 text-zinc-400">
          Buy the desktop Aim Trainer once, then download your copy securely
          after Stripe confirms payment.
        </p>

        <div className="my-8 flex items-center justify-between border-y border-zinc-800 py-5">
          <span className="text-zinc-300">Full game</span>
          <span className="text-2xl font-semibold">{PRICE}</span>
        </div>

        <PurchaseButton sessionId={sessionId} price={PRICE} />
      </section>
    </main>
  );
}
