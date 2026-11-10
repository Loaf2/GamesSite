This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Stripe checkout

Create a `.env.local` file with your Stripe secret key before starting the app:

```env
STRIPE_SECRET_KEY=sk_test_...
```

Waydens Aim Trainer is sold
executable, Linux and macOS archives, and Android APK are stored in a private
Vercel Blob store (`games/` paths) and are only served after the download route
verifies that the Checkout Session is paid. To upload or replace a build, run
`vercel blob put "<file>" --access private --pathname "games/<name>" --allow-overwrite true`
with the project's `BLOB_READ_WRITE_TOKEN`; the download route needs the same
token in its environment.
Use Stripe test mode and test card `4242 4242 4242 4242` while developing.
After a paid checkout, the site generates and stores a unique activation key
on the player's record in the Neon `players` table and displays it on the
checkout page. The game must implement its own key validation to enforce
activation.

## Authentication

Copy `.env.example` to `.env.local` and fill in the Neon, Auth.js, Google, and
GitHub values. Create a Neon Postgres database and use its connection string
as `DATABASE_URL`. Set OAuth callback URLs to
`https://your-domain.com/api/auth/callback/google` and
`https://your-domain.com/api/auth/callback/github` (and the equivalent local
`http://localhost:3000` URLs).

Password reset emails use Resend. Add `RESEND_API_KEY` and a verified
`RESEND_FROM_EMAIL` address to `.env.local` before using the forgot-password
flow.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
