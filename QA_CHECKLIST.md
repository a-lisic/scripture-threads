# Scripture Threads - QA Checklist

## Critical

- Google sign-in works after Firebase config is added.
  - Hosted Chrome status: verified on `https://gnco-scripturethreads.firebaseapp.com`.
  - In-app browser can still be unreliable for Google OAuth handoff; use normal Chrome/Safari for auth QA.
- Unauthenticated/local prototype mode does not expose cloud data.
- Firestore rules prevent one user from reading another user's studies.
  - Current status: Firestore rules deployed to `gnco-scripturethreads`.
- Generate creates a memory entry.
  - Hosted Chrome status: verified.
- Editing the note auto-saves the active memory entry.
- Restoring a memory entry does not overwrite unsaved edits.
- Markdown export preserves YAML, wikilinks, tables, headings, and Source Notes.
- Rich text copy and plain text copy work on desktop browsers.
- PDF print only prints the editable note.
- Mobile Generate scrolls to the workspace.

## Screens

- Study
- Edit Note
- Entities
- Memory
- Destinations
- AI connection
- Auth/account panel
- Copy menu
- Export menu

## Mobile Viewports

- 320 x 568
- 375 x 667
- 390 x 844
  - Current status: checked static preview for page overflow and copy/export menu behavior.
- 430 x 932
- tablet portrait
- tablet landscape

## Export Destinations

- Markdown .md download
- PDF print/save
- Rich text copy
- Plain text copy
- Obsidian manual import
- iCloud/Files share workflow
- GoodNotes PDF workflow
- Future Google Drive OAuth
- Future Notion OAuth
- Future Google Docs creation

## Security

- No server keys use `NEXT_PUBLIC_`.
- YouVersion and AI keys are server-only.
- AI provider keys are encrypted before Firestore storage.
- AI connection docs are not readable through client Firestore rules; access goes through server routes.
- Rendered/generated HTML is controlled or sanitized before display.
- Contenteditable paste behavior is tested for unexpected HTML.
- Account deletion/export path is added before public release.

## Firebase Setup

- Project: `gnco-scripturethreads`
- Web app: `Scripture Threads`
- Google Auth provider: enabled
- Firestore database: `(default)`
- Firebase Hosting site: `gnco-scripturethreads`
- GitHub repo: `https://github.com/a-lisic/scripture-threads`
- Rules/indexes deploy command: `pnpm firebase:deploy:firestore`

## Hosting Launch

- Build with `pnpm build`.
- Deploy Next.js to Vercel with `pnpm deploy:vercel`.
- Add the Vercel/custom domains to Firebase Auth authorized domains.
- Verify the Vercel URL loads the app shell.
- Verify Google sign-in on hosted URL.
- Verify Firestore study memory after hosted sign-in.
- Verify AI connect/status/disconnect with OpenAI and Anthropic test keys.
- Verify live generation returns structured study JSON and saves memory.

## Known Not Built Yet

- YouVersion REST adapter is built and smoke-tested, but live browser/mobile lookup still needs a server route.
- Connect AI server routes are built; production verification needs Vercel env vars and provider test keys.
- Direct provider exports are staged in the UI but not connected.
- Account deletion/export path is required before public release.
