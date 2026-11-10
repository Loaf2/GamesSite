import { createHash, randomBytes } from "node:crypto";
import {
  createPasswordResetToken,
  findUserByEmail,
} from "@/lib/db";

const RESET_TOKEN_LIFETIME_MS = 60 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: unknown };
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email.includes("@")) {
      return Response.json(
        { error: "Enter a valid email address." },
        { status: 400 },
      );
    }

    const user = await findUserByEmail(email);
    if (user?.password_hash) {
      const token = randomBytes(32).toString("hex");
      await createPasswordResetToken({
        userId: user.id,
        tokenHash: createHash("sha256").update(token).digest("hex"),
        expiresAt: new Date(Date.now() + RESET_TOKEN_LIFETIME_MS),
      });
      await sendResetEmail({
        email: user.email,
        resetUrl: `${new URL(request.url).origin}/reset-password?token=${token}`,
      });
    }

    return Response.json({
      message: "If an account exists for that email, a reset link is on its way.",
    });
  } catch (error) {
    console.error("Could not send password reset email", error);
    return Response.json(
      { error: "The reset email could not be sent. Please try again." },
      { status: 500 },
    );
  }
}

async function sendResetEmail(input: { email: string; resetUrl: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    throw new Error("RESEND_API_KEY and RESEND_FROM_EMAIL are required.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.email],
      subject: "Reset your Waydens Aim Trainer password",
      text: `Reset your password using this link (valid for one hour): ${input.resetUrl}`,
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend returned ${response.status}.`);
  }
}
