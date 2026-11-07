"use client";

import { useEffect, useState } from "react";

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
  const [activationKey, setActivationKey] = useState("");
  const [activationError, setActivationError] = useState("");

  useEffect(() => {
    if (!sessionId || !isAuthenticated) return;

    const paidSessionId = sessionId;
    const controller = new AbortController();

    async function loadActivationKey() {
      try {
        const response = await fetch(
          `/api/activation-key?session_id=${encodeURIComponent(paidSessionId)}`,
          { cache: "no-store", signal: controller.signal },
        );
        const data: { activationKey?: string; error?: string } =
          await response.json();

        if (!response.ok || !data.activationKey) {
          throw new Error(data.error ?? "The activation key could not be loaded.");
        }

        setActivationKey(data.activationKey);
      } catch (keyError) {
        if (controller.signal.aborted) return;
        setActivationError(
          keyError instanceof Error
            ? keyError.message
            : "The activation key could not be loaded.",
        );
      }
    }

    void loadActivationKey();
    return () => controller.abort();
  }, [isAuthenticated, sessionId]);

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
            href={`/api/download?session_id=${encodeURIComponent(sessionId)}&platform=windows`}
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
        {sessionId && isAuthenticated ? (
          <a
            href={`/api/download?session_id=${encodeURIComponent(sessionId)}&platform=macos`}
            className="block cursor-pointer rounded-xl border border-cyan-400/60 px-4 py-3 text-center text-sm font-semibold text-cyan-300 transition-colors hover:border-cyan-300 hover:text-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
          >
            macOS
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-xl border border-zinc-700 bg-zinc-800/60 px-4 py-3 text-sm font-medium text-zinc-500"
          >
            macOS · Available after purchase
          </button>
        )}
        {sessionId && isAuthenticated ? (
          <a
            href={`/api/download?session_id=${encodeURIComponent(sessionId)}&platform=linux`}
            className="block cursor-pointer rounded-xl border border-cyan-400/60 px-4 py-3 text-center text-sm font-semibold text-cyan-300 transition-colors hover:border-cyan-300 hover:text-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
          >
            Linux
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-xl border border-zinc-700 bg-zinc-800/60 px-4 py-3 text-sm font-medium text-zinc-500"
          >
            Linux · Available after purchase
          </button>
        )}
      </div>

      {sessionId && isAuthenticated && (
        <>
          <p className="mt-4 text-sm text-emerald-400">
            Payment confirmed. Your Windows, macOS, and Linux downloads are ready.
          </p>
          {!activationKey && !activationError && (
            <p className="mt-4 text-sm text-zinc-400">
              Preparing your activation key...
            </p>
          )}
          {activationKey && (
            <div className="mt-5 rounded-xl border border-zinc-700 bg-zinc-950 p-4">
              <p className="text-sm font-medium text-zinc-300">
                Your product activation key
              </p>
              <code className="mt-2 block break-all text-lg font-semibold tracking-wider text-cyan-300">
                {activationKey}
              </code>
              <p className="mt-2 text-xs text-zinc-500">
                Keep this key safe; it is linked to your purchase.
              </p>
            </div>
          )}
          {activationError && (
            <p role="alert" className="mt-4 text-sm text-red-400">
              {activationError}
            </p>
          )}
        </>
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
