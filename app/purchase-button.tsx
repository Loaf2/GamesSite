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
      {sessionId && isAuthenticated ? (
        <a
          href={`/api/download?session_id=${encodeURIComponent(sessionId)}`}
          className="block rounded-xl bg-cyan-400 px-6 py-3 text-center font-semibold text-zinc-950 transition-colors hover:bg-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
        >
          Download Aim Trainer
        </a>
      ) : isAuthenticated ? (
        <button
          type="button"
          onClick={handlePurchase}
          disabled={isStartingCheckout}
          className="w-full rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-zinc-950 transition-colors hover:bg-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 disabled:cursor-wait disabled:opacity-60"
        >
          {isStartingCheckout ? "Opening secure checkout..." : `Buy for ${price}`}
        </button>
      ) : (
        <a
          href="/signin?callbackUrl=%2F%23checkout"
          className="block rounded-xl bg-cyan-400 px-6 py-3 text-center font-semibold text-zinc-950 transition-colors hover:bg-cyan-300"
        >
          Sign in to buy
        </a>
      )}

      {sessionId && isAuthenticated && (
        <p className="mt-4 text-sm text-emerald-400">
          Payment confirmed. Your download is ready.
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
