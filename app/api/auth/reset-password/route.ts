import { createHash } from "node:crypto";
import { hash } from "bcryptjs";
import { resetPasswordWithToken } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      token?: unknown;
      password?: unknown;
    };
    const token = typeof body.token === "string" ? body.token : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!token || password.length < 8) {
      return Response.json(
        { error: "Provide a valid reset link and a password of at least 8 characters." },
        { status: 400 },
      );
    }

    const didReset = await resetPasswordWithToken({
      tokenHash: createHash("sha256").update(token).digest("hex"),
      passwordHash: await hash(password, 12),
    });
    if (!didReset) {
      return Response.json(
        { error: "This reset link is invalid or has expired." },
        { status: 400 },
      );
    }

    return Response.json({ reset: true });
  } catch (error) {
    console.error("Could not reset password", error);
    return Response.json(
      { error: "The password could not be reset. Please try again." },
      { status: 500 },
    );
  }
}
