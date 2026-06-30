# Scripture Threads - Memory Structure

## Purpose

Study Memory protects generated and edited notes from being lost before the user chooses to export them.

This is not the same as the Obsidian vault. It is a temporary working memory inside the app, meant to make experimentation safer.

## Current Prototype Behavior

- Every generated study is saved as a draft in browser localStorage.
- Study Memory lives in its own workspace tab.
- The newest saved study appears at the top of the Memory tab.
- Editing the note auto-saves the current draft.
- Clicking a saved draft restores:
  - passage
  - translation
  - mode
  - study preview
  - editable note
  - metadata
  - entities
- The app restores the latest saved study after refresh.

## What Each Memory Entry Stores

```yaml
id: unique app id
passage: "2 Chronicles 19"
translation: "CSB"
mode: "Guided Deep Study"
book: "2 Chronicles"
createdAt: ISO timestamp
updatedAt: ISO timestamp
study: structured generated study object
markdown: current edited markdown export
```

## Working Memory vs Vault Memory

### Study Memory

Use for:

- temporary drafts
- alternate generations
- notes still being edited
- recovering a study after refresh
- comparing outputs before deciding what to keep

Storage:

- browser localStorage
- local to this browser/device
- limited to recent entries

### Obsidian Vault

Use for:

- notes the user intentionally wants to keep
- long-term study archive
- linked people/place/book/topic/event pages
- teaching prep notes
- personal reflections worth revisiting

Storage:

- exported markdown
- later, optional direct vault write after user chooses a destination

## Future Improvements

- Add a manual pin/keep action so important drafts are not pushed out by newer studies.
- Add a confirmed delete action for old drafts.
- Add a label or short note field for saved drafts.
- Add comparison between two saved generations.
- Save source bundles separately so a regenerated note can show exactly what sources were used.
- Warn before generating again when the current draft has unsaved edits, if autosave ever fails.
