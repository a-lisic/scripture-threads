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

- Build static export with `pnpm build`.
- Deploy Firebase Hosting with `pnpm firebase:deploy:hosting`.
- Verify the Firebase Hosting URL loads the app shell.
- Verify Google sign-in on hosted URL.
- Verify Firestore study memory after hosted sign-in.

## Known Not Built Yet

- Live Bible text lookup is deferred until YouVersion setup is complete.
- Live AI generation is deferred until a server-side host and `OPENAI_API_KEY` are configured.
- Direct provider exports are staged in the UI but not connected.
- Account deletion/export path is required before public release.
