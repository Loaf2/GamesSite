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
        <div className="-mt-2 text-right">
          <Link
            className="text-sm text-cyan-300 hover:text-cyan-200"
            href="/forgot-password"
          >
            Forgot password?
          </Link>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button className="auth-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <OAuthButtons />
      <p className="mt-6 text-center text-sm text-zinc-400">
        New here?{" "}
        <Link className="cursor-pointer text-cyan-300 hover:text-cyan-200" href="/signup">
          Create an account
        </Link>
      </p>
    </AuthCard>
  );
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data: { message?: string; error?: string } =
        await response.json();
      if (!response.ok) {
        setError(data.error ?? "The reset email could not be sent.");
        return;
      }
      setMessage(data.message ?? "Check your email for a reset link.");
    } catch {
      setError("The reset email could not be sent. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter your email and we’ll send you a secure reset link."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="auth-label">
          Email
          <input
            className="auth-input"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        {message && <p className="text-sm text-emerald-400">{message}</p>}
        <button className="auth-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Sending..." : "Send reset link"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-zinc-400">
        Remembered your password?{" "}
        <Link className="text-cyan-300 hover:text-cyan-200" href="/signin">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password !== confirmation) {
      setError("The passwords do not match.");
      return;
    }
    if (!token) {
      setError("This reset link is invalid or missing.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data: { error?: string } = await response.json();
      if (!response.ok) {
        setError(data.error ?? "The password could not be reset.");
        return;
      }
      router.push("/signin?reset=success");
    } catch {
      setError("The password could not be reset. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Choose a new password"
      subtitle="Use at least 8 characters for your new password."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="auth-label">
          New password
          <input
            className="auth-input"
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>
        <label className="auth-label">
          Confirm new password
          <input
            className="auth-input"
            minLength={8}
            onChange={(event) => setConfirmation(event.target.value)}
            required
            type="password"
            value={confirmation}
          />
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button className="auth-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Updating..." : "Update password"}
        </button>
      </form>
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
        <Link className="cursor-pointer text-cyan-300 hover:text-cyan-200" href="/signin">
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-6 py-24 text-zinc-100">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 h-112 w-md rounded-full bg-blue-500/10 blur-3xl" />
      <section className="relative w-full max-w-md rounded-3xl border border-zinc-800/80 bg-zinc-900/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <Link
          className="mb-8 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-cyan-300 transition-colors hover:text-cyan-200"
          href="/"
        >
          <span aria-hidden="true">←</span> Back to Waydens Aim Trainer
        </Link>
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">
            Waydens Aim Trainer
          </p>
          <h1 className="mt-3 text-3xl font-semibold">{title}</h1>
        </div>
        <p className="mt-2 text-zinc-400">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </section>
    </main>
  );
}
