# OfficeHoursTrack

OfficeHoursTrack is a public marketing site and web app for tracking office hours, grouping them by client, closing billing cycles, and calculating payout.

## Getting started

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and fill in the values.
3. Run `npm run dev` and open [http://localhost:3000](http://localhost:3000).

## Authentication setup

Copy `.env.example` to `.env.local` and provide MongoDB, Auth.js, and Google OAuth values. For local Google sign-in, add this authorized redirect URI in Google Cloud:

```text
http://localhost:3000/api/auth/callback/google
```

Email/password registration stores users in the configured MongoDB database. Google sign-in accepts verified Google accounts and links them to an existing account with the same email.

## OfficeHoursTrack workspaces

Users start with an empty OfficeHoursTrack workspace area. From **Dashboard → Team workspace**, a user can create a workspace and invite teammates by email. Invitations expire after seven days and can only be accepted by a signed-in account using the invited email address. Configure `RESEND_API_KEY` and `RESEND_FROM` to enable invitation delivery.

New accounts must verify their email before registration completes. The signup page sends a six-digit code through Resend; codes expire after 15 minutes. In Resend, create an API key and verify the domain used by `RESEND_FROM`. For local testing, Resend's `onboarding@resend.dev` sender can only deliver to the email address associated with your Resend account.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Production deployment

This application requires a Node.js-compatible Next.js host. It is not a static export because authentication, MongoDB, and the newsletter API use server route handlers.

1. Copy `.env.example` into your hosting provider's environment-variable settings.
2. Set `MONGODB_URI` and `MONGODB_DB` for the production database.
3. Generate a new random `AUTH_SECRET` and set `AUTH_URL` to the public HTTPS origin.
4. Set `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`, then add `https://your-domain.example/api/auth/callback/google` as an authorized Google OAuth redirect URI.
5. Set `GEMINI_API_KEY` if newsletter resource discovery is enabled.
6. Build and run the application:

```bash
npm ci
npm run lint
npm run build
npm run start
```

For Vercel, import this repository, add the same environment variables for the relevant deployment environments, and use the default Next.js build settings. For another Node.js host, use `npm run build` as the build command and `npm run start` as the start command.

Never commit `.env.local` or copy local development credentials into production. Rotate any credentials that have been exposed outside the hosting provider.

## Security notes

- Sign-in can require an authenticator code (two-step verification). Secrets are encrypted with `AUTH_SECRET`; rotating it invalidates existing two-step secrets.
- Rate limits are stored in MongoDB collection `rateLimits`. Its TTL index removes expired counters automatically.
- Verification codes lock after five wrong guesses. Reset links and invitations are single-use and expire.
- Security headers are set in `next.config.ts`.
