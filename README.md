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

## Authentication setup

Copy `.env.example` to `.env.local` and provide MongoDB, Auth.js, and Google OAuth values. For local Google sign-in, add this authorized redirect URI in Google Cloud:

```text
http://localhost:3000/api/auth/callback/google
```

Email/password registration stores users in the configured MongoDB database. Google sign-in accepts verified Google accounts and links them to an existing account with the same email.

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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
