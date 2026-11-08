export function isOwnerEmail(email?: string | null) {
  const owners = (process.env.OWNER_EMAILS ?? "")
	.split(",")
	.map((value) => value.trim().toLowerCase())
	.filter(Boolean);
  return !!email && owners.includes(email.trim().toLowerCase());
}
