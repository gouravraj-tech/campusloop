# CampusLoop Project Overview

CampusLoop is a Next.js + TypeScript campus marketplace for students to buy and sell items, save listings, and message sellers. The app is designed around a mobile-friendly marketplace flow and a mock local data store for rapid local development without requiring a live Firebase configuration.

## Core features

- Browse marketplace listings by category and condition
- Create, edit, and delete listings
- Save favorite items for a later revisit
- View seller details and contact via inquiry messaging
- Keep auth, listing ownership, and protected routes server-aware
- Use a local JSON data layer that mirrors the expected app data model

## Default stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS
- React Hook Form + Zod
- Firebase client/admin SDK integration
- SWR for client-side fetching

## Data model shape

The app is structured around users, listings, saved listings, and conversations. Listings include title, description, category, condition, pickup location, price, and seller metadata.

## Local development note

The project keeps auth and data access behind API routes and checks environment variables before initializing Firebase. A local mock store is used to keep the app functional when credentials are not configured.

## Deployment note

When using Firebase Admin, ensure the private key preserves real newline characters. In practice, the value must be passed through a `.env.local` value that includes actual `\n` sequences after evaluation, not escaped text in the source file.
