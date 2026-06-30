# Scripture Threads Prototype

This is a small static prototype for testing the Scripture Threads study and Obsidian export workflow before adding Bible APIs, AI generation, or direct vault writing.

## Try It

Open this file in a browser:

```text
/Users/Elizabeth/Documents/Bible Study/index.html
```

The default passage is `2 Chronicles 19`, which uses the current fixture study and export shape.

## What This Prototype Tests

- Passage input
- Translation and study-mode selection
- Study preview
- Editable Obsidian markdown note
- Rich editing with markdown copy/download output
- Copy rich text, markdown, or plain text
- Export markdown or use the browser print flow to save as PDF
- Copy/download export actions
- Memory tab for generated and edited drafts before export
- People, places, groups, story context, and event-thread fields
- Theme vs tag distinction
- Cross references with short connection notes
- Clean entity display that preserves Obsidian wikilinks in the generated markdown

## Current Limits

- No live Bible API yet.
- No AI generation yet.
- No direct Obsidian vault writing yet.
- Only `2 Chronicles 19` has a full fixture. Other passages generate a structural scaffold.

## Next Build Step

Add a generation layer that can produce the same structured data for any passage, then wire in Bible text and source retrieval carefully.
