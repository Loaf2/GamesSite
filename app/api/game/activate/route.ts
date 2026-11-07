import { activateGameAccount } from "@/lib/db";

const ACTIVATION_KEY_PATTERN = /^AIM-(?:[A-Z0-9]{4}-){7}[A-Z0-9]{4}$/;

export async function POST(request: Request) {
  try {
	const body = (await request.json()) as {
	  email?: unknown;
	  activationKey?: unknown;
	};
	const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
	const activationKey =
	  typeof body.activationKey === "string" ? body.activationKey.trim().toUpperCase() : "";

	if (!email.includes("@") || !ACTIVATION_KEY_PATTERN.test(activationKey)) {
	  return Response.json({ error: "Enter a valid account email and activation key." }, { status: 400 });
	}

	const activated = await activateGameAccount({ email, activationKey });
	if (!activated) {
	  return Response.json({ error: "The activation key does not belong to this account." }, { status: 403 });
	}

	return Response.json({ activated: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
	console.error("Could not activate game account", error);
	return Response.json({ error: "The game account could not be activated." }, { status: 500 });
  }
}