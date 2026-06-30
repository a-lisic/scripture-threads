# Bible Entity Database Plan

## Why This Matters

The app should help the user see the story of Scripture across time, not only understand one passage in isolation.

One of the most useful future features is an automated database layer for:

- people
- places
- nations/groups
- topics/themes
- story context
- major event threads

The goal is to recreate the benefit of a Bible database without requiring the user to manually tag and maintain everything.

Example:

When studying `2 Chronicles 19`, the app should notice Jehoshaphat, Ahab, Ramoth-gilead, Judah, and Jerusalem. It should then help answer questions like:

- Where else has Ahab appeared?
- What is Jehoshaphat's story arc so far?
- What happened at Ramoth-gilead?
- How does this connect to earlier warnings about compromise?
- Have I made previous notes about this person, place, or theme?

## Core Principle

Use links for entities.

Use tags for reusable themes.

That means:

- `[[Ahab]]`, not `#ahab`
- `[[Jehoshaphat]]`, not `#jehoshaphat`
- `[[Jerusalem]]`, not `#jerusalem`
- `[[Ramoth-gilead]]`, not `#ramothgilead`
- `#repentance`, `#leadership`, or `#justice` only when the theme should be browsed across many notes

## Entity Types

Separate people, places, groups, story context, and event threads in properties because they answer different questions.

Example:

```yaml
people:
  - "[[Jehoshaphat]]"
  - "[[Ahab]]"
places:
  - "[[Jerusalem]]"
  - "[[Ramoth-gilead]]"
groups:
  - "[[Judah]]"
story_context:
  - "Battle at Ramoth-gilead"
event_threads:
  - "[[Conquest of the Promised Land]]"
entity_links:
  - "[[Jehoshaphat]]"
  - "[[Ahab]]"
  - "[[Jerusalem]]"
  - "[[Ramoth-gilead]]"
  - "[[Judah]]"
  - "[[Conquest of the Promised Land]]"
```

The separate fields make it easier to build Bases views later:

- all notes mentioning a person
- all notes tied to a place
- all notes involving a nation/group
- all notes with a local story-context anchor
- all notes connected to a larger event thread

The combined `entity_links` field is optional convenience. It gives the app one place to show all related database links.

## Story Context Vs Event Threads

Use `story_context` for one-off narrative anchors that matter for understanding the passage but probably do not need their own database page.

Example:

```yaml
story_context:
  - "Battle at Ramoth-gilead"
```

Use `event_threads` for larger events, repeated biblical references, or connected movements that gather multiple passages.

Examples:

- `[[Conquest of the Promised Land]]`
- `[[Exodus]]`
- `[[Fall of Jerusalem]]`
- `[[Exile]]`
- `[[Return from Exile]]`
- `[[Crucifixion]]`
- `[[Resurrection]]`
- `[[Pentecost]]`

An event thread should usually meet at least one of these criteria:

- Scripture repeatedly refers back to it.
- It spans multiple chapters or books.
- It gathers connected smaller events, such as battles within the conquest.
- It is a major covenant, salvation-history, or kingdom-history anchor.
- The user would likely ask, "Where else does this show up?"

For example, `Battle at Ramoth-gilead` is important context for 2 Chronicles 19, but it is probably a `story_context` item by default. A broader thread like `[[Conquest of the Promised Land]]` could be an `event_thread` because it gathers connected battles and is repeatedly referenced.

## Recommended Obsidian Structure

Proposed folders:

```text
2. AREAS/Faith/Bible Database/
  People/
  Places/
  Nations and Groups/
  Event Threads/
  Topics/
```

This should not replace book notes under:

```text
2. AREAS/Faith/Books of the Bible/
```

Book pages remain book hubs, such as `[[2 Chronicles]]`.

Entity pages become story/reference hubs, such as `[[Ahab]]` or `[[Jerusalem]]`.

## Entity Page Template

```markdown
---
type: bible-person
name: "Ahab"
aliases: []
related_books: []
related_people: []
related_places: []
first_mentioned:
last_mentioned:
tags: []
---

# Ahab

## Snapshot

## Key Passages

## Story Arc

## Related People

## Related Places

## Themes To Watch

## Notes From My Studies

## Source Notes
```

For places, use `type: bible-place`.

For topics, use `type: bible-topic`.

For event threads, use `type: bible-event-thread`.

## App Behavior

When the user generates a study, the app should:

1. Detect people, places, nations/groups, topics, story context, and event threads in the passage.
2. Normalize entity names so variants point to the same page.
3. Add wikilinks to the condensed Obsidian export.
4. Show a short "Where Else This Appears" section when useful.
5. Search the vault for existing mentions of those entities.
6. Suggest new entity pages only when the entity is significant enough to be worth tracking.
7. Avoid cluttering every proper noun with a link.
8. Keep entity connections separate from interpretation.

## Entity Link Threshold

The app should not link every name or every incident. It should link entities that carry story, context, or future retrieval value.

Include an entity when at least one of these is true:

- The person/place/group/event thread is central to the passage.
- The entity appears in the immediate context before or after the passage.
- The entity explains a conflict, warning, promise, covenant, movement, or repeated biblical thread.
- The entity is likely to appear again in future study.
- The entity connects to a user's prior notes, sermons, devotions, or prayer reflections.
- The entity is needed to understand the passage map or historical setting.

Usually skip or de-emphasize an entity when:

- It appears only once in a long list.
- It is not discussed or developed in the passage.
- Linking it would create clutter without helping interpretation or future lookup.
- The identification is uncertain and would require too much explanation for the note.

Default limit:

- Main study note: 3 to 8 entity links.
- Full research mode: more links allowed, grouped by type.
- Genealogy/list passage: use grouped summaries instead of linking every person by default.
- Local one-off incidents should usually go in `story_context`, not `entity_links`.

## Genealogies And Long Lists

Genealogies, census lists, land lists, and name-heavy chapters need a different rule.

Default approach:

1. Link the major ancestor, family line, tribe, nation, or location group.
2. Link repeated or theologically significant names.
3. Link names that are central to the surrounding narrative.
4. Do not create individual pages for every listed name unless the user asks for a full research index.

Example for a genealogy:

```yaml
people:
  - "[[Adam]]"
  - "[[Noah]]"
  - "[[Abraham]]"
groups:
  - "[[Tribe of Judah]]"
entity_note: "Genealogy contains many names; only major line markers are linked in the study note."
```

Possible note section:

```markdown
## Linked Notes

- [[Abraham]] - major covenant ancestor in this genealogy.
- [[Tribe of Judah]] - the family line emphasized in this section.
- Genealogy note: this chapter contains many names, but only major line markers are linked here to keep the study usable.
```

Full Research mode can offer an optional "Create genealogy index" export.

## Automation Levels

### Level 1: Suggested Links

The app suggests entity links inside the export:

```markdown
Related Bible database links: [[Jehoshaphat]], [[Ahab]], [[Judah]], [[Jerusalem]], [[Ramoth-gilead]]
```

No database pages are created automatically.

### Level 2: Draft Entity Pages

The app can create a draft page for an entity when the user approves it.

The draft should be modest:

- short snapshot
- key passages
- related people and places
- source notes
- links to user studies where the entity appears

### Level 3: Maintained Indexes

The app can update index pages or Dataview-friendly properties over time.

Examples:

- `People Index`
- `Places Index`
- `Events Index`
- `Topics Index`

This should remain optional because automatic vault editing needs user trust.

## Guardrails

- Do not create dozens of entity links in one note.
- Do not treat a person or place connection as the meaning of the passage.
- Do not merge similarly named people unless the identification is clear.
- Label uncertain identifications.
- Prefer canonical Bible names but preserve common readable forms.
- Use aliases for alternate spellings or names.

Example:

```yaml
name: "Ramoth-gilead"
aliases: ["Ramoth Gilead", "Ramoth in Gilead"]
```

## 2 Chronicles 19 Example

Suggested entity links:

- `[[Jehoshaphat]]`
- `[[Ahab]]`
- `[[Judah]]`
- `[[Jerusalem]]`
- `[[Ramoth-gilead]]`
- `[[Jehu son of Hanani]]`

Possible note section:

```markdown
## Linked Notes

- [[Jehoshaphat]] - king of Judah; this passage follows his alliance with Ahab.
- [[Ahab]] - king of Israel; his influence frames the warning Jehoshaphat receives.
- [[Ramoth-gilead]] - the battle location connected to the previous chapter.
- Battle at Ramoth-gilead - story context from the previous chapter; not linked as an event thread by default.
- [[Judah]] - Jehoshaphat's kingdom and the setting for his reforms.
- [[Jerusalem]] - where Jehoshaphat appoints Levites, priests, and family heads for judgment.
```

## MVP Recommendation

Do not build full entity-page automation in the first prototype.

For MVP, add:

- entity detection
- suggested wikilinks
- "Where Else This Appears" references from Scripture
- vault mention search if available

Save automatic entity-page creation for phase two, with user approval before writing into the vault.
