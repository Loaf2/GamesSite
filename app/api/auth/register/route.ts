import { hash } from "bcryptjs";
import { createPasswordUser } from "@/lib/db";
import { createGameSessionToken } from "@/lib/game-token";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: unknown;
      password?: unknown;
      name?: unknown;
    };
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";

    if (!name || !email.includes("@") || password.length < 8) {
      return Response.json(
        { error: "Enter a name, a valid email, and a password of at least 8 characters." },
        { status: 400 },
      );
    }

    const user = await createPasswordUser({
      email,
      name,
      passwordHash: await hash(password, 12),
    });
    return Response.json({ created: true, sessionToken: createGameSessionToken(user.id) });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("duplicate key value")
    ) {
      return Response.json(
        { error: "An account with that email already exists." },
        { status: 409 },
      );
    }
    console.error("Could not register user", error);
    return Response.json(
      { error: "The account could not be created." },
      { status: 500 },
    );
  }
}
