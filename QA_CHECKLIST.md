# Scripture Threads - QA Checklist

## Critical

- Google sign-in works after Firebase config is added.
  - Local in-app browser status: reaches Google account chooser, then returns signed out on localhost. Re-test in normal browser and hosted domain.
- Unauthenticated/local prototype mode does not expose cloud data.
- Firestore rules prevent one user from reading another user's studies.
  - Current status: Firestore rules deployed to `msr-ecosystem`.
- Generate creates a memory entry.
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

- Project: `msr-ecosystem`
- Web app: `Scripture Threads`
- Google Auth provider: enabled
- Firestore database: `(default)` in `nam5`
- Rules/indexes deploy command: `pnpm firebase:deploy:firestore`
