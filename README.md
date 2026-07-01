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
- `OPENAI_API_KEY` is intentionally blank until the AI provider strategy is chosen.
- `YOUVERSION_APP_KEY` is server-only. The REST adapter and smoke test are built, but the hosted Spark-plan build still needs a server-side route before browser/mobile users can call it live.
- Live AI generation will use the guided Connect AI flow. Users can choose OpenAI or Anthropic, open the official key page, paste the key back into Scripture Threads, and then the backend will verify and store it encrypted.

## Backend Strategy

The current Firebase Spark setup should stay responsible for Auth, Firestore, and static Hosting. Live Bible/API/AI generation should run behind a server-side boundary so private keys are never exposed through `NEXT_PUBLIC_` variables.

Recommended next backend path:

- Keep this static Firebase Hosting deployment as the web app shell.
- Add a small server-side generation service on Vercel, Cloudflare Workers, or Firebase Functions if/when Blaze is acceptable.
- Route all private AI/source calls through that service.
- Use the YouVersion REST adapter behind a server-side route. Do not expose the app key through browser code or `NEXT_PUBLIC_` variables.
- Current key verification showed BSB/NASB/NIV-family access, but not CSB or NLT under this app key/license set.

## Current Limits

- YouVersion REST adapter exists, but the static hosted app does not call it live yet.
- The Connect AI UI exists, but final verification/encrypted key storage still needs a server-side route.
- Only `2 Chronicles 19` has a full fixture. Other passages generate a structural scaffold.
- Direct exports to Google Drive, Notion, GoodNotes, Apple Notes, and Obsidian sync are planned but not connected.
