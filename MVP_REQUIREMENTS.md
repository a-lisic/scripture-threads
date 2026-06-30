# Scripture Threads - MVP Requirements

## Purpose

Build a small first version of Scripture Threads that proves the study experience works before adding heavier source management, Obsidian automation, or a large commentary library.

The MVP should answer one question:

Can the app take a passage and produce a readable, trustworthy, Scripture-first guided study that the user would actually want to keep and revisit?

## Current Golden Example

Use `sample_2_chronicles_19_guided_study.md` as the current gold-standard sample.

Use `sample_2_chronicles_19_obsidian_export.md` as the current test sample for the Obsidian export shape.

The sample is not final because the wording and headings may still evolve, but it captures the target shape:

- context before verse walkthrough
- section-by-section study
- selective depth rather than exhaustive notes
- application woven through each section
- explicit overread guardrails
- source trail at the end
- condensed Obsidian export

## MVP User Flow

1. User enters a Bible passage.
2. User chooses a primary translation:
   - CSB for teaching-oriented study
   - NLT for daily reading tone
3. User chooses study mode:
   - Quick Read
   - Guided Deep Study
   - Teaching Prep
   - Full Research, optional or disabled for first prototype
4. App generates a structured study.
5. User can copy or export:
   - full study markdown
   - condensed Obsidian study note
   - teaching outline, if Teaching Prep mode is selected

## Required Output Sections

### Study Header

Includes:

- passage
- primary translation
- study mode
- source profile
- date
- citation/copyright note if full Bible text is included

### Big Idea

A concise summary of the passage's main movement.

### Context Around The Passage

Should answer:

- Where are we in the book?
- What came before?
- What happens in this passage?
- What comes next?
- What tension or theme should be watched?

### Passage Map

A simple table of the passage's movement.

### Section Walkthrough

Each natural section should use this current heading set:

- What's Happening
- What To Notice
- Study Notes
- Be Careful Not To Overread
- How It Lands Today
- Worth Holding Onto

### Final Synthesis

Short and non-repetitive:

- concise summary
- 3 to 5 key takeaways
- 3 to 6 reflection questions

### Claim Ledger

May be visually collapsed in the app, but should exist in the generated data.

Columns:

- claim
- evidence
- source type
- confidence

### Source Notes

Names Scripture references, commentaries, dictionaries, language tools, and any vault notes used.

Inline study notes can use warmer language like:

- Writer's note:
- It is worth noticing:
- Notice how:

The formal source trail belongs in Source Notes, not necessarily in the middle of every paragraph.

### Obsidian Condensed Study Export

Must be generated as markdown.

Includes:

- YAML/properties block
- Big Idea
- Worth Holding Onto
- Cross References
- Questions To Revisit
- Source Notes
- Vault Connections, if available
- Required Bible book wikilink(s), such as `[[2 Chronicles]]`
- Controlled tags from `TAGGING_STRATEGY.md`

## Depth Rules

The MVP should avoid both extremes:

- not so short that it becomes surface-level
- not so long that it becomes unusable

Default rule:

Each verse/section should include only the 1 to 3 most helpful study notes.

Include original-language notes only when they clarify meaning. Do not add Greek/Hebrew because it looks impressive.

Include translation comparison only when it highlights something useful. Do not dump multiple translations every time.

## Source And Copyright Strategy

This is not legal advice, but it should guide product decisions until exact permissions are confirmed.

### Personal Use Vs Commercial Use

If this app is only for private personal use, copyright risk is generally lower, especially when the app is not redistributing copyrighted text or commentary publicly.

If this app is for commercial use, public sharing, paid access, or broad distribution, copyright concerns are higher. Commercial use usually requires stricter permission, licensing, attribution, and quote-limit compliance.

Current clarification:

- The intended use is personal/non-commercial.
- The app should still preserve attribution, avoid unnecessary bulk copying, and store only what is useful for study and Obsidian notes.

### Bible Text

Preferred translations:

- CSB for teaching
- NLT for daily reading

MVP should support translation choice in the UI. Because this is personal/non-commercial, full-passage display inside the local/private app is less concerning, but the app should still avoid becoming a bulk Bible-text archive.

Preferred integration path:

1. Use YouVersion Platform as the primary Bible text source if CSB and NLT are available under the user's app key/license agreements.
2. Use the REST API first for a local web prototype.
3. Consider the JavaScript or React SDK later if it reduces rendering/citation work.

YouVersion Platform findings:

- Developer docs: https://developers.youversion.com/overview
- API usage guide: https://developers.youversion.com/api-usage
- API base: `https://api.youversion.com`
- Requests require the `X-YVP-App-Key` header.
- Apps must be registered in the YouVersion Platform Portal to obtain an App Key.
- Bible endpoints include available Bible collections, Bible metadata, Bible index, books, chapters, verses, and passage text.
- Passage text endpoint: `GET /v1/bibles/{bible_id_path}/passages/{passage_id_path}`
- Passage responses can return `text` or `html` and include a human-readable reference.
- License endpoints can show license metadata and which Bible IDs are covered by a license.

Practical fallback options:

1. User enters/pastes the passage text from their own Bible app.
2. App stores only the reference and uses short excerpts.
3. App links out to the full passage.
4. App uses a public-domain or permissively licensed translation for development testing.

Known source checks and caveats:

- YouVersion Platform appears to be the best current option for legal/official Bible access, but the specific availability of CSB and NLT under the user's app key must be verified.
- Tyndale has permissions guidance for NLT usage: https://www.tyndale.com/permissions
- CSB permissions need exact current confirmation before storing/exporting full passage text.
- If YouVersion provides CSB/NLT through accepted license terms, prefer the platform terms over ad hoc quote-limit handling for in-app display.

### Commentary

Enduring Word can be used as an initial commentary source, but should not be treated as open-source text.

MVP approach:

- cite/link Enduring Word in Source Notes
- summarize rather than quote heavily
- avoid making it the only source
- keep commentary secondary to Scripture

Known source check:

- Enduring Word permissions: https://enduringword.com/permissions/

### Public Domain And Free Sources

Possible later additions:

- public domain commentaries
- Bible dictionaries
- cross-reference databases
- maps/background resources
- user-owned notes/books

These should be screened for doctrinal fit, dated wording, and usefulness.

## Doctrinal And Source Profile

Default source lane:

- Scripture-first
- evangelical
- non-denominational
- continuationist/open to active gifts of the Holy Spirit today
- not cessationist by default
- careful with debated theological claims

The app should mark debated interpretations rather than flattening them.

## Obsidian Integration Findings

Vault path reviewed:

`/Users/Elizabeth/Documents/Obsidian/Elizabeth Vault`

Observed vault structure:

- `0. DAILY NOTES`
- `1. PROJECTS`
- `2. AREAS`
- `2. AREAS/Faith`
- `2. AREAS/Faith/Books of the Bible`
- `2. AREAS/Faith/Study Notes`
- `2. AREAS/Faith/Sermon Notes`
- `2. AREAS/Content Lab`
- `3. RESOURCES`
- `5. TEMPLATES`
- `6. PRAYER JOURNAL`

Relevant existing notes/folders:

- `2. AREAS/Faith/Books of the Bible/2 Chronicles.md` exists but is currently empty.
- `2. AREAS/Faith/Study Notes/Ephesians 1.md` shows a natural prior study style: relational, reflective, Scripture-focused, with direct application and questions.
- `2. AREAS/Faith/Study Notes/Joshua 1-4.md` shows the user's informal voice and practical analogy style.
- `2. AREAS/Faith/Ephesians Bible Study.md` shows a weekly study rhythm, personal questions, spiritual formation practices, and translation comparison.
- `2. AREAS/Content Lab` contains reusable devotions, teaching notes, sermons/prep notes, and deeper-dive material.
- Content Lab notes often include useful frontmatter fields: `type`, `stage`, `topics`, `primary_scripture`, `supporting_scriptures`, `audience`, `context`, `big_idea`, `series`, `date_created`, and `date_used`.
- Example Content Lab types include `devotion` and `teaching`.
- Daily notes include a `Scripture` section that reads from `0. DAILY NOTES/_data/bible-plan.json`.
- The vault already uses Obsidian wikilinks and project/file conventions.
- Existing tags are useful but inconsistent, so new Bible study imports should follow `TAGGING_STRATEGY.md` instead of copying old tag habits.

## Obsidian MVP Integration

Do not write directly into the vault in the first prototype unless the user explicitly chooses an export destination.

MVP should:

1. Generate Obsidian-compatible markdown.
2. Suggest the best destination path.
3. Include wikilinks to likely related notes.
4. Always include Obsidian wikilinks to the relevant Bible book note(s).
5. Suggest Bible entity links for important people, places, nations/groups, event threads, and topics.
6. Keep vault connections separated from interpretation.

Recommended initial export destination:

`2. AREAS/Faith/Study Notes/[Passage].md`

For 2 Chronicles 19:

`2. AREAS/Faith/Study Notes/2 Chronicles 19.md`

Required book hub link:

`[[2 Chronicles]]`

Book-link rule:

- Every imported study note must include a wikilink to the matching book note in `2. AREAS/Faith/Books of the Bible`.
- The link should use the simple Obsidian page name, not the full path, for example `[[2 Chronicles]]`, `[[John]]`, `[[1 Samuel]]`, or `[[Ephesians]]`.
- If the passage spans multiple books, include all relevant book links.
- If the book note does not exist yet, still include the wikilink so Obsidian can create or resolve it later.
- The app should derive the book link from the normalized passage reference and preserve number prefixes exactly, such as `1 Kings`, `2 Chronicles`, `1 Corinthians`, and `3 John`.
- These book links should appear near the top of the Obsidian export, before the main heading.

Tagging rule:

- Use properties for structure: `type`, `passage`, `book`, `translation`, `mode`, `date`, `themes`, `tags`, `sources`, and `status`.
- Use `themes` for passage-specific ideas the app notices.
- Use `tags` only for the smaller controlled set of stable categories worth browsing across many notes.
- `themes` and `tags` may overlap, but tags should be a curated subset rather than a duplicate list.
- Default to 2 to 5 controlled tags per imported study note.
- Do not use book tags. Use book wikilinks instead, such as `[[2 Chronicles]]`.
- Do not add numeric tags, color tags, generated ID tags, or one-off event tags to new imports.
- Content workflow tags, such as `content-idea` or `sermon-prep`, should be reserved for reusable Content Lab derivatives.

Bible entity database rule:

- Use wikilinks for Bible people, places, nations/groups, event threads, and topics.
- Do not use tags for people or places. Use `[[Ahab]]`, `[[Jehoshaphat]]`, `[[Jerusalem]]`, and `[[Ramoth-gilead]]`.
- Store people, places, groups, story context, and event threads in separate properties when possible, then optionally combine linkable entities in `entity_links` for display.
- The app should detect important entities in the passage and suggest links automatically.
- The app should not link every proper noun. It should prioritize entities that help the user see the story, context, or repeated biblical thread.
- Local one-off incidents should usually be captured as `story_context`, not as linked event pages.
- Use `event_threads` only for larger or repeatedly referenced biblical events, such as `[[Exodus]]`, `[[Exile]]`, `[[Resurrection]]`, or a broader campaign like `[[Conquest of the Promised Land]]`.
- In genealogies, census lists, land lists, and long name lists, link only major line markers, repeated or theologically significant names, and entities central to the surrounding narrative by default.
- Entity connections should appear in a separate section, not inside the explanation in a way that confuses connection with interpretation.
- Full entity-page creation should require user approval until the workflow is trusted.
- See `ENTITY_DATABASE_PLAN.md` for the proposed database structure.

Recommended area/resource links:

- `[[A - Faith]]`, if that convention remains active
- `[[R - Study Notes]]`, if that convention remains active
- `[[Ephesians Bible Study]]` only when relevant
- `[[Prayer Bible Verses]]` or prayer notes only when directly relevant
- `[[Content Lab]]` is not currently a folder note, but Content Lab files should be considered related reusable material when relevant.

Content Hub / Content Lab rule:

- Study notes should live in Faith Study Notes by default.
- Reusable teaching/devotional derivatives should be suggested for Content Lab.
- The app should not automatically turn every Bible study into content. It should offer this only when the user chooses Teaching Prep, Devotional Draft, or Save as Content Idea.

## Obsidian Phase Two Integration

Phase two should add vault-aware retrieval:

1. Search by passage:
   - `2 Chronicles`
   - `2 Chronicles 19`
   - `Jehoshaphat`
2. Search by themes:
   - correction
   - compromise
   - repentance
   - obedience
   - justice
   - leadership
   - courage
3. Search by note type:
   - Faith book notes
   - Study Notes
   - Sermon Notes
   - Content Lab devotions
   - Content Lab teaching notes
   - Prayer Journal
   - Daily Scripture sections
   - Content Lab
4. Return possible connections with labels:
   - Direct Scripture connection
   - Theme connection
   - Personal reflection connection
   - Teaching connection
   - Prayer connection
   - Ministry/application connection
   - Bible person connection
   - Bible place connection
   - Bible event-thread connection

Vault connections must never be presented as the meaning of the passage unless Scripture itself supports that meaning.

Entity database retrieval should search for:

- people in the passage
- places in the passage
- nations or groups in the passage
- story-context anchors
- major event threads or repeated story moments
- aliases and spelling variants

Entity link threshold:

- Link an entity if it is central to the passage, immediate context, repeated story thread, historical setting, or likely future lookup.
- Skip an entity if it appears only once in a list and does not help interpretation or future retrieval.
- Put one-off narrative incidents in `story_context` unless Scripture repeatedly refers back to them or they belong under a larger event thread.
- Default to 3 to 8 entity links in a normal study note.
- Allow more in Full Research mode, grouped by type.

For 2 Chronicles 19, likely entity links include:

- `[[Jehoshaphat]]`
- `[[Ahab]]`
- `[[Judah]]`
- `[[Jerusalem]]`
- `[[Ramoth-gilead]]`
- `[[Jehu son of Hanani]]`

Content Lab retrieval should prioritize structured fields when present:

- `primary_scripture`
- `supporting_scriptures`
- `topics`
- `type`
- `stage`
- `audience`
- `context`
- `big_idea`

Content Lab results should be labeled differently from personal notes:

- Existing devotion
- Teaching/prep note
- Sermon-related note
- Deeper dive
- Content idea
- Reusable illustration/application

These results can help with teaching prep, devotional writing, or remembering past insights, but should remain separate from exegesis unless the note is directly grounded in the passage.

## Suggested Obsidian Export Format

```markdown
---
type: bible-study
passage: "2 Chronicles 19"
translation: "CSB"
mode: "Guided Deep Study"
date: 2026-06-30
book: "2 Chronicles"
book_links: ["[[2 Chronicles]]"]
people: ["[[Jehoshaphat]]", "[[Ahab]]", "[[Jehu son of Hanani]]"]
places: ["[[Jerusalem]]", "[[Ramoth-gilead]]"]
groups: ["[[Judah]]"]
story_context: ["Battle at Ramoth-gilead"]
event_threads: []
entity_links: ["[[Jehoshaphat]]", "[[Ahab]]", "[[Judah]]", "[[Jerusalem]]", "[[Ramoth-gilead]]", "[[Jehu son of Hanani]]"]
themes: [correction, compromise, repentance, judicial reform, impartiality, leadership, justice, courage]
tags: [repentance, leadership, justice, courage]
sources: [Scripture, Enduring Word]
status: draft
---

[[A - Faith]] [[R - Study Notes]] [[2 Chronicles]]

# 2 Chronicles 19 Study Notes

## Big Idea

## Context

## Passage Map

## Worth Holding Onto

## Cross References

- 2 Chronicles 18:31 - shows the immediate mercy behind Jehoshaphat's safe return.
- Deuteronomy 16:18-20 - gives the Torah background for appointing judges and pursuing justice without partiality.
- Psalm 82 - shows God as the ultimate judge over earthly judges.
- Psalm 97:10 - supports Jehu's rebuke about loving the Lord and rejecting evil.

## Questions To Revisit

## Source Notes

## Vault Connections

## Linked Notes
```

## Non-Goals For MVP

Do not build these yet:

- full Bible text storage
- direct vault write automation
- large commentary ingestion
- user account system
- payment/commercial distribution
- mobile sync
- full semantic search over the entire vault
- automatic theological source-ranking
- sermon manuscript generator

## Prototype Build Recommendation

Build a local web app first.

Suggested first stack:

- simple local web UI
- markdown output preview
- copy/export buttons
- configuration file for source profile and output rules
- YouVersion Platform REST API adapter, behind an optional `YVP_APP_KEY` environment variable

The first prototype can use a mocked or manually supplied passage/source bundle before connecting live APIs. This keeps the focus on output quality and trustworthiness. Once the output quality feels right, connect YouVersion Platform for live Bible text.

## YouVersion Integration Tasks

Before or during prototype build:

1. Create/register an app in YouVersion Platform.
2. Store the app key locally as `YVP_APP_KEY`; do not commit it.
3. Call `GET /v1/bibles?language_ranges[]=en` to list available English Bibles.
4. Confirm whether CSB and NLT are available for the app key.
5. Record their Bible IDs in a local config file.
6. Test passage fetches for:
   - `2CH.19`
   - `2CH.19.1`
   - `JHN.3.16`
7. Decide whether to request `format=text` or `format=html`.
8. Preserve YouVersion/version copyright metadata in Source Notes or an app footer.
9. Avoid caching large amounts of Bible text by default; cache only recent passage fetches if needed for performance.

## Acceptance Criteria

The MVP is successful when:

- The 2 Chronicles 19 sample can be generated or reproduced in the app.
- Output feels readable, not bloated.
- Application is woven through the study.
- Major claims have evidence in the claim ledger.
- Source notes are present without making the writing stiff.
- Obsidian export is clean enough to keep.
- The user can say, "I would actually use this after reading my Bible."
