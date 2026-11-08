import { createHmac, timingSafeEqual } from "crypto";

const TOKEN_LIFETIME_SECONDS = 60 * 60 * 24 * 30;

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
	throw new Error("AUTH_SECRET is not configured.");
  }
  return secret;
}

function sign(data: string) {
  return createHmac("sha256", getSecret()).update(data).digest("base64url");
}

export function createGameSessionToken(userId: string) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
	JSON.stringify({ sub: userId, exp: Math.floor(Date.now() / 1000) + TOKEN_LIFETIME_SECONDS }),
  ).toString("base64url");
  const data = `${header}.${payload}`;
  return `${data}.${sign(data)}`;
}

export function verifyGameSessionToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [header, payload, signature] = parts;
  const expected = Buffer.from(sign(`${header}.${payload}`));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;

  try {
	const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
	  sub?: unknown;
	  exp?: unknown;
	};
	if (typeof claims.sub !== "string" || typeof claims.exp !== "number") return null;
	if (claims.exp * 1000 <= Date.now()) return null;
	return claims.sub;
  } catch {
	return null;
  }
}
