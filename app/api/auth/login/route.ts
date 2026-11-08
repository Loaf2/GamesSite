import { compare } from "bcryptjs";
import { findUserByEmail } from "@/lib/db";
import { createGameSessionToken } from "@/lib/game-token";

export async function POST(request: Request) {
  try {
	const body = (await request.json()) as {
	  email?: unknown;
	  password?: unknown;
	};
	const email =
	  typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
	const password = typeof body.password === "string" ? body.password : "";

	if (!email || !password) {
	  return Response.json({ error: "Enter your email and password." }, { status: 400 });
	}

	const user = await findUserByEmail(email);
	if (!user?.password_hash || !(await compare(password, user.password_hash))) {
	  return Response.json({ error: "Invalid email or password." }, { status: 401 });
	}

	return Response.json(
	  { sessionToken: createGameSessionToken(user.id) },
	  { headers: { "Cache-Control": "no-store" } },
	);
  } catch (error) {
	console.error("Could not sign in", error);
	return Response.json({ error: "Sign in failed." }, { status: 500 });
  }
}
