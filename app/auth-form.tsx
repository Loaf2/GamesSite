"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function SignInForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
    if (result?.error) {
      setError("The email or password is incorrect.");
      setIsSubmitting(false);
      return;
    }
    const callbackUrl =
      new URLSearchParams(window.location.search).get("callbackUrl") ?? "/";
    router.push(callbackUrl);
  }

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to continue to checkout.">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <AuthFields />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button className="auth-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <OAuthButtons />
      <p className="mt-6 text-center text-sm text-zinc-400">
        New here?{" "}
        <Link className="text-cyan-300 hover:text-cyan-200" href="/signup">
          Create an account
        </Link>
      </p>
    </AuthCard>
  );
}

export function SignUpForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    });
    const data: { error?: string } = await response.json();
    if (!response.ok) {
      setError(data.error ?? "The account could not be created.");
      setIsSubmitting(false);
      return;
    }
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
    if (result?.error) {
      setError("Your account was created, but sign-in failed.");
      setIsSubmitting(false);
      return;
    }
    const callbackUrl =
      new URLSearchParams(window.location.search).get("callbackUrl") ?? "/";
    router.push(callbackUrl);
  }

  return (
    <AuthCard title="Create your account" subtitle="Sign up before buying the game.">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="auth-label">
          Name
          <input className="auth-input" name="name" required />
        </label>
        <AuthFields />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button className="auth-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>
      <OAuthButtons />
      <p className="mt-6 text-center text-sm text-zinc-400">
        Already have an account?{" "}
        <Link className="text-cyan-300 hover:text-cyan-200" href="/signin">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}

function AuthFields() {
  return (
    <>
      <label className="auth-label">
        Email
        <input className="auth-input" name="email" required type="email" />
      </label>
      <label className="auth-label">
        Password
        <input
          className="auth-input"
          minLength={8}
          name="password"
          required
          type="password"
        />
      </label>
    </>
  );
}

function OAuthButtons() {
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2">
      <button
        className="auth-social-button"
        onClick={() => signIn("google", { callbackUrl: "/" })}
        type="button"
      >
        Continue with Google
      </button>
      <button
        className="auth-social-button"
        onClick={() => signIn("github", { callbackUrl: "/" })}
        type="button"
      >
        Continue with GitHub
      </button>
    </div>
  );
}

function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 py-24 text-zinc-100">
      <section className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl sm:p-8">
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="mt-2 text-zinc-400">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </section>
    </main>
  );
}
