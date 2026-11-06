"use client";

import { useState } from "react";

export default function PurchaseButton({
  isAuthenticated,
  sessionId,
  price,
}: {
  isAuthenticated: boolean;
  sessionId?: string;
  price: string;
}) {
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);
  const [error, setError] = useState("");

  async function handlePurchase() {
    setError("");
    setIsStartingCheckout(true);

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
      });
      const data: { url?: string; error?: string } = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Checkout could not be started.");
      }

      window.location.assign(data.url);
    } catch (purchaseError) {
      setError(
        purchaseError instanceof Error
          ? purchaseError.message
          : "Checkout could not be started.",
      );
      setIsStartingCheckout(false);
    }
  }

  return (
    <>
      <p className="mb-3 text-sm font-medium text-zinc-400">Choose your platform</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {sessionId && isAuthenticated ? (
          <a
            href={`/api/download?session_id=${encodeURIComponent(sessionId)}`}
            className="block cursor-pointer rounded-xl bg-cyan-400 px-4 py-3 text-center text-sm font-semibold text-zinc-950 transition-colors hover:bg-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
          >
            Windows
          </a>
        ) : isAuthenticated ? (
          <button
            type="button"
            onClick={handlePurchase}
            disabled={isStartingCheckout}
            className="w-full cursor-pointer rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 disabled:cursor-wait disabled:opacity-60"
          >
            {isStartingCheckout ? "Opening..." : `Buy for ${price}`}
          </button>
        ) : (
          <a
            href="/signin?callbackUrl=%2F%23checkout"
            className="block cursor-pointer rounded-xl bg-cyan-400 px-4 py-3 text-center text-sm font-semibold text-zinc-950 transition-colors hover:bg-cyan-300"
          >
            Sign in to buy
          </a>
        )}
        <button
          type="button"
          disabled
          className="cursor-not-allowed rounded-xl border border-zinc-700 bg-zinc-800/60 px-4 py-3 text-sm font-medium text-zinc-500"
        >
          macOS · Coming soon
        </button>
        <button
          type="button"
          disabled
          className="cursor-not-allowed rounded-xl border border-zinc-700 bg-zinc-800/60 px-4 py-3 text-sm font-medium text-zinc-500"
        >
          Linux · Coming soon
        </button>
      </div>

      {sessionId && isAuthenticated && (
        <p className="mt-4 text-sm text-emerald-400">
          Payment confirmed. Your Windows download is ready.
        </p>
      )}
      {error && (
        <p role="alert" className="mt-4 text-sm text-red-400">
          {error}
        </p>
      )}
      <p className="mt-6 text-center text-xs text-zinc-500">
        Payments are securely processed by Stripe.
      </p>
    </>
  );
}
