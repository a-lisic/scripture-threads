# Obsidian Tagging Strategy For Bible Study Notes

## Goal

Create a simple, meaningful tag system for Bible study imports that helps notes resurface later without making the vault feel over-managed.

The main idea:

- Wikilinks connect notes to real pages.
- Properties describe the note.
- Tags name reusable themes.
- Bible people and places should use wikilinks, not tags.

## What The Current Tag Review Shows

The vault already has many useful tags, but they are mixed with noisy ones.

Common patterns:

- Workflow/status tags: `#todevelop`, `#meeting`, `#sync`
- Topic/theme tags: `#prayer`, `#identity`, `#peace`, `#anxiety`
- Ministry/content tags: `#familydiscipleship`, `#devoseries`, `#sermons`
- Accidental/generated tags: color values, numeric tags, generated IDs
- Duplicate or inconsistent forms: `#meetingnotes` and `#Meeting`, `#sermons` and `#sermonnotes`

For new Bible study notes, the app should not try to clean the whole vault at once. It should start using a cleaner system going forward.

## Core Rule

Use the smallest number of tags that will help this note be found again.

Default:

- 2 to 5 tags per imported Bible study note
- lowercase
- hyphenated when needed
- no spaces
- no book tags
- no numeric, color, generated, or one-off event tags

## Wikilinks Instead Of Tags

Use wikilinks for real note destinations:

- Bible books: `[[2 Chronicles]]`, `[[John]]`, `[[1 Corinthians]]`
- Vault areas: `[[A - Faith]]`, `[[R - Study Notes]]`
- Related studies, notes, sermons, devotions, or prayers

Do not create tags like `#2chronicles`, `#john`, or `#ephesians` for imported Bible study notes. The book link does that job better.

The same principle applies to people and places:

- Use `[[Ahab]]`, not `#ahab`.
- Use `[[Jehoshaphat]]`, not `#jehoshaphat`.
- Use `[[Jerusalem]]`, not `#jerusalem`.
- Use `[[Ramoth-gilead]]`, not `#ramothgilead`.

These belong in Bible database-style links, not in the tag system.

## Properties Instead Of Tags

Use properties for structured details:

```yaml
---
type: bible-study
passage: "2 Chronicles 19"
book: "2 Chronicles"
translation: "CSB"
mode: "Guided Deep Study"
date: 2026-06-30
themes: [correction, compromise, repentance, leadership, justice, courage]
tags: [repentance, leadership, justice, courage]
sources: [Scripture, Enduring Word]
status: draft
---
```

Use `themes` for passage-specific ideas the app noticed. These can be more numerous, more granular, and closer to the language of the passage.

Use `tags` for the smaller controlled set of stable categories you would want to browse across many notes.

In other words:

- `themes` = what is meaningfully present in this passage
- `tags` = which of those themes should become reusable vault-level categories

If a theme is too specific to this one chapter, keep it in `themes` but do not make it a tag.

Example:

```yaml
themes: [correction, compromise, repentance, judicial reform, impartiality, leadership, courage]
tags: [repentance, leadership, justice, courage]
```

In this example, `judicial reform` and `impartiality` are real themes in 2 Chronicles 19, but they may not need to become broad vault tags unless they recur often.

## Recommended Controlled Tags

### Spiritual Themes

- `identity`
- `grace`
- `repentance`
- `obedience`
- `faith`
- `trust`
- `surrender`
- `prayer`
- `worship`
- `wisdom`
- `discernment`
- `renewal`
- `restoration`
- `peace`
- `hope`
- `joy`
- `courage`
- `endurance`
- `waiting`

### Formation And Ministry

- `spiritual-formation`
- `discipleship`
- `family-discipleship`
- `leadership`
- `teaching`
- `church`
- `community`

### Pastoral And Application Themes

- `anxiety`
- `forgiveness`
- `shame`
- `belonging`
- `healing`
- `grief`
- `conflict`
- `justice`
- `generosity`
- `stewardship`

### Content Workflow

Use these mostly for Content Lab or teaching/devotional derivatives, not every study note.

- `content-idea`
- `to-develop`
- `ready`
- `used`
- `devotion-series`
- `team-meeting`
- `sermon-prep`

## Tags To Avoid In New Imports

- Book tags, such as `#2chronicles` or `#ephesians`
- People or place tags, such as `#ahab`, `#jehoshaphat`, or `#jerusalem`
- Numeric tags, such as `#1`, `#2`, `#3`
- Color tags, such as `#ff8e58`
- Generated IDs
- One-off event tags unless the note is truly event-specific
- People tags when a wikilink would be better
- Case variants, such as `#Meeting` and `#meeting`

## Suggested Cleanup Map

Do not mass rename these yet. Use this as a future cleanup guide.

| Current Pattern | Prefer |
|---|---|
| `#todevelop` | `#to-develop` or `stage: 1 - idea` |
| `#devoseries` | `#devotion-series` or `series:` |
| `#familydiscipleship` | `#family-discipleship` |
| `#renewyourmind` | `#renewal` or `#discernment` |
| `#sermons`, `#sermonnotes` | `#sermon-prep` or `type: sermon-note` |
| `#teammeeting` | `#team-meeting` or `context: [team meeting]` |
| `#biblenotes` | `type: bible-study` |
| `#christmasdevo` | `series: Christmas` or `#devotion-series` |

## App Behavior For New Bible Study Notes

When generating an Obsidian export, the app should:

1. Derive the Bible book wikilink from the passage.
2. Detect important Bible people, places, nations/groups, events, and topics.
3. Suggest entity wikilinks, such as `[[Ahab]]` or `[[Jerusalem]]`, when they help connect the story.
4. Fill structured properties first.
5. Suggest 2 to 5 controlled tags.
6. Keep a richer `themes` list when helpful.
7. Avoid adding tags that were only useful for a single generated note.
8. Put Content Lab workflow tags only on reusable derivatives, not on the main study archive by default.

## Theme Vs Tag Decision Rule

Ask two questions:

1. Is this idea actually present in the passage?
2. Would I want to find other notes under this same category later?

If the answer to the first question is yes, it can be a `theme`.

If the answer to both questions is yes, it can be a `tag`.

Default behavior:

- Generate 4 to 8 `themes`.
- Choose 2 to 5 of those as `tags`.
- Do not invent new tags casually.
- Prefer an existing controlled tag when it fits.

## Example

For `2 Chronicles 19`, a good import could use:

```yaml
book: "2 Chronicles"
book_links: ["[[2 Chronicles]]"]
themes: [correction, compromise, repentance, leadership, justice, courage]
tags: [repentance, leadership, justice, courage]
```

The note should also include this near the top:

```markdown
[[A - Faith]] [[R - Study Notes]] [[2 Chronicles]]
```
