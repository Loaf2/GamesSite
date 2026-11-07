import { neon } from "@neondatabase/serverless";

export type UserRecord = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
};

export function getDatabase() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }
  return neon(connectionString);
}

export async function ensureUsersTable() {
  const sql = getDatabase();
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT,
      name TEXT,
      image TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      checkout_session_id TEXT NOT NULL UNIQUE,
      activation_key TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS game_activations (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      activation_key TEXT NOT NULL UNIQUE,
      activated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export async function activateGameAccount(input: {
  email: string;
  activationKey: string;
}) {
  await ensureUsersTable();
  const sql = getDatabase();
  const rows = await sql`
    SELECT u.id
    FROM users u
    INNER JOIN players p ON p.user_id = u.id
    WHERE LOWER(u.email) = LOWER(${input.email})
      AND p.activation_key = ${input.activationKey}
    LIMIT 1
  `;

  if (!rows[0]) return false;

  await sql`
    INSERT INTO game_activations (user_id, activation_key)
    VALUES (${rows[0].id as string}, ${input.activationKey})
    ON CONFLICT (user_id) DO NOTHING
  `;
  return true;
}

export async function getOrCreatePlayerActivationKey(input: {
  checkoutSessionId: string;
  userId: string;
  activationKey: string;
}) {
  await ensureUsersTable();
  const sql = getDatabase();
  const inserted = await sql`
    INSERT INTO players (id, user_id, checkout_session_id, activation_key)
    VALUES (${crypto.randomUUID()}, ${input.userId}, ${input.checkoutSessionId}, ${input.activationKey})
    ON CONFLICT (checkout_session_id) DO NOTHING
    RETURNING activation_key
  `;

  if (inserted[0]) {
    return inserted[0].activation_key as string;
  }

  const existing = await sql`
    SELECT activation_key
    FROM players
    WHERE checkout_session_id = ${input.checkoutSessionId}
      AND user_id = ${input.userId}
    LIMIT 1
  `;
  return existing[0]?.activation_key as string | undefined;
}

export async function findUserByEmail(email: string) {
  await ensureUsersTable();
  const sql = getDatabase();
  const rows = await sql`
    SELECT id, email, name, image, password_hash
    FROM users
    WHERE email = ${email}
    LIMIT 1
  `;
  return rows[0] as
    | (UserRecord & { password_hash: string | null })
    | undefined;
}

export async function upsertOAuthUser(user: {
  email: string;
  name?: string | null;
  image?: string | null;
}) {
  await ensureUsersTable();
  const sql = getDatabase();
  const id = crypto.randomUUID();
  const rows = await sql`
    INSERT INTO users (id, email, name, image)
    VALUES (${id}, ${user.email}, ${user.name ?? null}, ${user.image ?? null})
    ON CONFLICT (email)
    DO UPDATE SET
      name = COALESCE(EXCLUDED.name, users.name),
      image = COALESCE(EXCLUDED.image, users.image)
    RETURNING id, email, name, image
  `;
  return rows[0] as UserRecord;
}

export async function createPasswordUser(input: {
  email: string;
  passwordHash: string;
  name: string;
}) {
  await ensureUsersTable();
  const sql = getDatabase();
  const id = crypto.randomUUID();
  const rows = await sql`
    INSERT INTO users (id, email, password_hash, name)
    VALUES (${id}, ${input.email}, ${input.passwordHash}, ${input.name})
    RETURNING id, email, name, image
  `;
  return rows[0] as UserRecord;
}

export async function createPasswordResetToken(input: {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}) {
  const sql = getDatabase();
  await sql`
    DELETE FROM password_reset_tokens
    WHERE user_id = ${input.userId}
  `;
  await sql`
    INSERT INTO password_reset_tokens (token_hash, user_id, expires_at)
    VALUES (${input.tokenHash}, ${input.userId}, ${input.expiresAt.toISOString()})
  `;
}

export async function resetPasswordWithToken(input: {
  tokenHash: string;
  passwordHash: string;
}) {
  await ensureUsersTable();
  const sql = getDatabase();
  const rows = await sql`
    UPDATE users
    SET password_hash = ${input.passwordHash}
    WHERE id = (
      SELECT user_id
      FROM password_reset_tokens
      WHERE token_hash = ${input.tokenHash}
        AND expires_at > NOW()
    )
    RETURNING id
  `;
  await sql`
    DELETE FROM password_reset_tokens
    WHERE token_hash = ${input.tokenHash}
  `;
  return rows.length > 0;
}
