# CampusLoop

CampusLoop is a Next.js + TypeScript campus marketplace for students to buy, sell, save, and message about items across campus.

## Features

- Browse listings by category and condition
- Create, edit, and manage listings
- Save items for later
- View listing details and seller info
- Send inquiries and maintain message threads
- Protected routes for authenticated flows

## Tech stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS
- React Hook Form + Zod
- Firebase client/admin SDK
- SWR

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template:

```bash
cp .env.example .env.local
```

3. Fill in the Firebase and Google Books values in `.env.local`. Enable the Email/Password sign-in provider in Firebase Authentication.

4. Run the dev server:

```bash
npm run dev
```

5. Open http://localhost:3000 in the browser.

## Environment variables

The app expects the following configuration values:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `GOOGLE_BOOKS_API_KEY`

For Firebase Admin, the private key must contain real newline characters after environment expansion.
Firebase email/password sign-in is enabled when the public Firebase client values and Firebase Admin service-account values are configured. In this mode, API requests use Firebase ID tokens verified by the server. Without Firebase configuration, the app stays in local demo mode; its email-based sign-in does not verify passwords and must not be used in production.

## Project docs

- [docs/PROJECT_OVERVIEW.md](./docs/PROJECT_OVERVIEW.md)
- [docs/AI-USAGE.md](./docs/AI-USAGE.md)

## Notes

When Firebase Admin credentials are configured, marketplace profiles, listings, saved listings, conversations, and messages use Firestore. Without them, the app uses the local JSON file for development. Existing JSON data is not automatically copied to Firestore; migrate any data you need before switching a deployed environment.
