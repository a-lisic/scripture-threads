# Scripture Threads

Scripture Threads is a Next.js Bible study workspace for generating, editing, remembering, and exporting structured study notes. The current build supports Google Auth with Firebase, Firestore-backed study memory, editable notes, markdown/rich/plain copy, markdown download, PDF print export, entity/link previews, and staged destination options.

## Local Setup

Create `.env.local` from `.env.example` and fill in the Firebase web app config.

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

- Google sign-in reaches the Google account chooser in the in-app browser, but that embedded browser can be unreliable on localhost. Re-test in a normal browser and again on the Firebase Hosting URL.
- `YOUVERSION_API_KEY` and `OPENAI_API_KEY` are intentionally blank until those services are connected.
- Live Bible/API/AI generation will need a server-side host later. The current Spark-plan build is static and client-only.

## Current Limits

- No live Bible API yet.
- No AI generation yet.
- Only `2 Chronicles 19` has a full fixture. Other passages generate a structural scaffold.
- Direct exports to Google Drive, Notion, GoodNotes, Apple Notes, and Obsidian sync are planned but not connected.
