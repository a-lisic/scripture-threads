# Scripture Threads

Scripture Threads is a Next.js Bible study workspace for generating, editing, remembering, and exporting structured study notes. The current build supports Google Auth with Firebase, Firestore-backed study memory, guided AI provider connection, encrypted server-side AI key storage on Vercel, editable notes, markdown/rich/plain copy, markdown download, PDF print export, entity/link previews, claim-ledger/source metadata, and staged destination options.

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
- Super admin emails: `alexlisic@gmail.com`, `bethlisic@gmail.com`
- Admin panel: user/study overview, platform settings, feature flags, source posture, and activity log
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

## Vercel

Vercel is now the production host for the full Next.js app because AI connection and generation require API routes.

Required Vercel environment variables:

```text
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=gnco-scripturethreads.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=gnco-scripturethreads
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_PROJECT_ID=gnco-scripturethreads
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
APP_ENCRYPTION_KEY=
YOUVERSION_APP_KEY=
AI_OPENAI_MODEL=gpt-4.1-mini
AI_ANTHROPIC_MODEL=claude-3-5-haiku-latest
```

Generate an encryption key:

```bash
openssl rand -base64 32
```

Deploy the web app and API routes:

```bash
pnpm build
pnpm deploy:vercel
```

Custom domain status:

- Vercel project domain: `https://scripture-threads.vercel.app`
- `threads.goodnewsco.church` is attached to the Vercel project, but DNS must point `threads.goodnewsco.church` to Vercel before it serves the dynamic app.
- Vercel recommended DNS record: `A threads.goodnewsco.church 76.76.21.21`

## Verification

Passing locally:

```bash
pnpm typecheck
pnpm build
```

Known follow-up:

- Google sign-in and Firestore memory are verified on Firebase Hosting in normal Chrome. Re-test on the Vercel URL after the first production deploy and add the Vercel/custom domains to Firebase Auth authorized domains.
- `YOUVERSION_APP_KEY` is server-only. The REST adapter and smoke test are built; the next step is routing live Bible text through Vercel API routes.
- Live AI generation now has Vercel API routes for connect/status/disconnect/generate. Production use requires Vercel env vars for Firebase Admin and encryption.

## Backend Strategy

Firebase stays responsible for Auth and Firestore. Vercel hosts the Next.js app and server routes so private keys are never exposed through `NEXT_PUBLIC_` variables.

Recommended next backend path:

- Keep Firebase Auth and Firestore as the identity/data layer.
- Use Vercel for the Next.js app and API routes.
- Route all private AI/source calls through that service.
- Use the YouVersion REST adapter behind a server-side route. Do not expose the app key through browser code or `NEXT_PUBLIC_` variables.
- Current key verification showed BSB/NASB/NIV-family access, but not CSB or NLT under this app key/license set.

## Current Limits

- YouVersion REST adapter exists, but the static hosted app does not call it live yet.
- Connect AI routes exist for verification, encrypted storage, status, disconnect, and live generation.
- Only `2 Chronicles 19` has a full fixture. Other passages generate a structural scaffold.
- Direct exports to Google Drive, Notion, GoodNotes, Apple Notes, and Obsidian sync are planned but not connected.
