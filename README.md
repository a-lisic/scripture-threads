# Scripture Threads

Scripture Threads is a Next.js Bible study workspace for generating, editing, remembering, and exporting structured study notes. The current build supports Google Auth with Firebase, Firestore-backed study memory, editable notes, markdown/rich/plain copy, markdown download, PDF print export, entity/link previews, claim-ledger/source metadata, and staged destination options.

## Local Setup

Create `.env.local` from `.env.example` and fill in the Firebase web app config.
For the hosted Firebase build, use the Firebase auth domain for `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`:

```text
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=gnco-scripturethreads.firebaseapp.com
```

```bash
pnpm install
pnpm dev
```

Local preview:

```text
http://localhost:3000
```

## Firebase

Project alias:

```text
default -> gnco-scripturethreads
```

Configured pieces:

- Firebase web app: `Scripture Threads`
- Firebase Auth: Google provider enabled
- Firestore database: `(default)`
- Firestore rules/indexes: deployed from this repo
- Firebase Hosting site: `gnco-scripturethreads`
- Primary app URL for auth testing: `https://gnco-scripturethreads.firebaseapp.com`
- Firebase Auth authorized domains: `gnco-scripturethreads.firebaseapp.com`, `gnco-scripturethreads.web.app`, `localhost`
- GitHub repo: `https://github.com/a-lisic/scripture-threads`

Deploy Firestore rules and indexes:

```bash
pnpm firebase:deploy:firestore
```

Build and deploy the static web app:

```bash
pnpm build
pnpm firebase:deploy:hosting
```

## Verification

Passing locally:

```bash
pnpm typecheck
pnpm build
```

Known follow-up:

- Google sign-in and Firestore memory are verified on the Firebase Hosting URL in normal Chrome. The embedded in-app browser may still be unreliable for Google OAuth.
- `YOUVERSION_API_KEY` and `OPENAI_API_KEY` are intentionally blank until those services are connected.
- Live Bible/API/AI generation will need a server-side host later. The current Spark-plan build is static and client-only.

## Backend Strategy

The current Firebase Spark setup should stay responsible for Auth, Firestore, and static Hosting. Live Bible/API/AI generation should run behind a server-side boundary so private keys are never exposed through `NEXT_PUBLIC_` variables.

Recommended next backend path:

- Keep this static Firebase Hosting deployment as the web app shell.
- Add a small server-side generation service on Vercel, Cloudflare Workers, or Firebase Functions if/when Blaze is acceptable.
- Route all private AI/source calls through that service.
- Keep YouVersion deferred until the app key, translation availability, and allowed usage are confirmed.

## Current Limits

- No live Bible API yet.
- No AI generation yet.
- Only `2 Chronicles 19` has a full fixture. Other passages generate a structural scaffold.
- Direct exports to Google Drive, Notion, GoodNotes, Apple Notes, and Obsidian sync are planned but not connected.
