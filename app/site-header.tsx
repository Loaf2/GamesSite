"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function SiteHeader() {
  const { data: session, status } = useSession();

  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-zinc-950/75 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="font-semibold tracking-tight text-white"
        >
          Aim Trainer
        </Link>
        <div className="flex items-center gap-3 text-sm text-zinc-300 sm:gap-6">
          <a className="hidden transition-colors hover:text-white sm:inline" href="#preview">
            Preview
          </a>
          <a className="transition-colors hover:text-white" href="#checkout">
            Checkout
          </a>
          {status === "loading" ? (
            <span className="text-zinc-500">...</span>
          ) : session?.user ? (
            <>
              <span className="hidden max-w-32 truncate text-zinc-400 sm:inline">
                {session.user.name ?? session.user.email}
              </span>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-lg border border-zinc-700 px-3 py-2 transition-colors hover:border-zinc-500 hover:text-white"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/signin"
              className="rounded-lg border border-cyan-400 px-3 py-2 text-cyan-300 transition-colors hover:bg-cyan-400 hover:text-zinc-950"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
