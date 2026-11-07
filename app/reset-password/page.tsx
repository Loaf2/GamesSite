import { ResetPasswordForm } from "../auth-form";

export const instant = false;

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return <ResetPasswordForm token="" />;
  }

  return <ResetPasswordForm token={token} />;
}
