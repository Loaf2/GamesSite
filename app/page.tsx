import PurchaseButton from "./purchase-button";
import SiteHeader from "./site-header";
import VideoOverlay from "./video-overlay";
import { auth } from "@/auth";

const PRICE = "€15.00";

export const instant = false;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const [{ session_id: sessionId }, session] = await Promise.all([
    searchParams,
    auth(),
  ]);

  return (
    <>
      <SiteHeader />
      <main className="relative z-10 text-zinc-100">
        <section
          className="relative flex min-h-[100svh] items-end overflow-hidden px-6 pb-16 pt-28 sm:items-center sm:pb-12"
          id="preview"
        >
          <VideoOverlay />
          <div className="relative z-10 mx-auto w-full max-w-6xl">
            <div className="max-w-xl">
              <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-cyan-300">
                Aim Trainer
              </p>
              <h1 className="text-5xl font-semibold tracking-tight sm:text-7xl">
                Sharpen your aim.
              </h1>
              <p className="mt-5 max-w-lg leading-7 text-zinc-200">
                Watch the preview, then sign in to securely buy and download
                the desktop Aim Trainer.
              </p>
              <a
                className="mt-8 inline-block rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-zinc-950 transition-colors hover:bg-cyan-300"
                href="#checkout"
              >
                Continue to checkout
              </a>
            </div>
          </div>
        </section>
        <section
          className="flex min-h-[70svh] items-center justify-center bg-zinc-950 px-6 py-20"
          id="checkout"
        >
          <div className="w-full max-w-lg rounded-3xl border border-zinc-800/80 bg-zinc-900 p-6 shadow-2xl sm:p-10">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">
              Checkout
            </p>
            <h2 className="text-4xl font-semibold tracking-tight">
              Own the full game.
            </h2>
            <p className="mt-4 leading-7 text-zinc-400">
              Buy the desktop Aim Trainer once, then download your copy
              securely after Stripe confirms payment.
            </p>
            <div className="my-8 flex items-center justify-between border-y border-zinc-800 py-5">
              <span className="text-zinc-300">Full game</span>
              <span className="text-2xl font-semibold">{PRICE}</span>
            </div>
            <PurchaseButton
              isAuthenticated={Boolean(session?.user)}
              sessionId={sessionId}
              price={PRICE}
            />
          </div>
        </section>
      </main>
    </>
  );
}
