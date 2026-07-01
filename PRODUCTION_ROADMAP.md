# Scripture Threads - Production Roadmap

## Decisions Confirmed

- Multi-user app.
- Google login through Firebase Auth.
- Next.js web app.
- Web only is acceptable if mobile optimized.
- Firebase is the first auth/data platform.
- YouVersion Platform is the preferred Bible API candidate.
- Exports/connectors should not assume Obsidian is the only destination.

## Current Implementation Layer

The project now has a Next.js app shell with:

- Hosted Firebase Google Auth verified on `gnco-scripturethreads.firebaseapp.com`.
- Local prototype mode when Firebase env vars are missing.
- Per-user Study Memory abstraction.
- Firestore security rules for private user-owned data.
- Generation-ready study data with source records and claim ledger fields.
- Mobile-responsive workspace.
- Export destination registry for Markdown, PDF, Obsidian, iCloud, Google Drive, Notion, GoodNotes, Apple Notes, Google Docs, and Word/DOCX.

## Firebase Project Setup Needed

These steps require Firebase console/project configuration:

1. Create or select a Firebase project.
2. Create a Web App inside Firebase.
3. Enable Authentication.
4. Enable Google sign-in provider.
5. Add authorized domains:
   - localhost
   - deployed production domain
   - deployed preview domain if using Vercel
6. Create a Firestore database.
7. Deploy `firestore.rules`.
8. Optionally enable Firebase Storage for generated PDFs, uploaded source documents, or export bundles.
9. Add the Firebase web config values to `.env.local`.

## Firestore Shape

```text
users/{uid}
  profile and settings

users/{uid}/studies/{studyId}
  passage
  translation
  mode
  status
  createdAt
  updatedAt
  structured study object
  edited markdown

users/{uid}/exports/{exportId}
  destination
  format
  status
  provider metadata

users/{uid}/entities/{entityId}
  user-specific notes and aliases

bibleEntities/{entityId}
  future global read-only entity reference layer
```

## Export/Connector Strategy

### Available Now

- Markdown download.
- Rich text copy.
- Plain text copy.
- Browser PDF print/save.

### Best First Workflow

- Obsidian: markdown export, then later Obsidian URI/plugin/local companion.
- iCloud Drive: download/share sheet, especially on iPhone/iPad.
- GoodNotes: PDF export/share sheet.
- Apple Notes: rich text copy/share sheet.

### Requires OAuth Or Provider Work

- Google Drive: OAuth, folder picker, create markdown/PDF/Google Doc.
- Google Docs: Drive OAuth plus document creation.
- Notion: OAuth, workspace/database selection, page creation.

## YouVersion API Next Step

REST is the current integration path because Scripture Threads needs custom study/source shaping rather than a prebuilt Bible reader UI. The app should use a server route for all YouVersion calls so the app key is never exposed in browser code.

Server-only env var:

```text
YOUVERSION_APP_KEY=
```

Smoke test:

```bash
pnpm youversion:smoke
```

Current verification: the app key can fetch English Bible metadata and 2 Chronicles 19 through the passage endpoint. CSB and NLT are not currently included in the English Bible list for this key, so the adapter falls back to the best available study-friendly translation.

## AI Generation Next Step

Generation should happen through a server-side boundary, not the browser. A consumer ChatGPT, Claude, or Codex login cannot safely power the hosted app in the background. The current Spark-plan Firebase Hosting build is static, so use one of these paths:

1. Keep Firebase Spark for Auth/Firestore/Hosting and add a small generation service on Vercel or Cloudflare Workers.
2. Upgrade Firebase to Blaze later and use Firebase Functions/App Hosting for same-platform server routes.
3. Offer bring-your-own provider API keys for users who want their own OpenAI or Anthropic billing.
4. Offer a manual AI mode that copies a structured prompt/source bundle into ChatGPT or Claude and lets the user paste the result back.

Store:

- prompt version
- selected passage
- source bundle metadata
- model response
- generated structured study
- edited markdown

The app should keep the existing claim discipline:

- Scripture first.
- Commentary secondary.
- Major claims cite evidence.
- Vault/life connections are labeled as connections, not meaning.

## Deployment Milestones

1. Next.js app builds locally.
2. Firebase Auth signs in with Google locally.
3. Firestore Study Memory syncs across devices.
4. Hosted deployment works on mobile and desktop.
5. Server-side generation service accepts passage/mode/translation and returns structured study JSON.
6. AI generation with source bundles.
7. YouVersion Bible text integration after API setup resumes.
8. Export connector expansion.
9. Full QA and refactor pass.
