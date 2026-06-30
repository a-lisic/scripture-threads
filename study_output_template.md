# Study Output Template

This template is designed for a balanced "Guided Deep Study" output: deep enough to be useful, structured enough to stay readable, and source-aware enough to avoid unsupported claims.

## Output Length Principle

Each verse or section should include only the most important study helps. The app should usually choose 1 to 3 of the following per section:

- Translation note
- Cross reference
- Word meaning
- Cultural or historical note
- Commentary support
- Doctrinal/theological note
- Obsidian/vault connection

If everything is included every time, the study becomes unusable. If too little is included, it becomes surface level. The default should be selective depth.

## Study Header

```markdown
# [Passage] Study

Primary translation: [CSB/NLT]
Mode: [Quick Read / Guided Deep Study / Full Research / Teaching Prep]
Source profile: Evangelical, non-denominational, continuationist, Scripture-first
Date: [date]
```

## Big Idea

One concise statement that captures the main movement of the chapter or passage.

Example:

```markdown
God brings victory over overwhelming opposition as His people remain obedient over time, showing that lasting faithfulness, not just momentary success, leads to the fulfillment of His promises.
```

## Context Around The Passage

Purpose: orient the reader before entering the verse-by-verse walkthrough.

Include:

- Where this passage sits in the book.
- What came immediately before.
- What comes after.
- Major tension or movement in the chapter.
- Key themes to watch.

Example:

```markdown
Joshua 11 brings closure to the major conquest movement. Joshua 10 emphasized the southern campaign; Joshua 11 turns north, where many kings gather with horses and chariots. The chapter is not only about military victory. It also shows sustained obedience over time.
```

## Passage Map

```markdown
| Section | Movement | Main Emphasis |
|---|---|---|
| Joshua 11:1-5 | Northern kings unite | Opposition becomes overwhelming |
| Joshua 11:6 | God reassures Joshua | Present trust is still needed |
| Joshua 11:7-9 | Israel obeys and defeats them | Victory and obedience stay linked |
| Joshua 11:10-15 | Hazor and the cities are judged | Joshua leaves nothing undone |
| Joshua 11:16-23 | The conquest is summarized | Promise is fulfilled over time |
```

## Verse Or Section Walkthrough

Use this structure for each verse or natural section.

```markdown
## [Reference] - [Short Section Title]

### What's Happening
[A clear summary of the verse or section. Keep this direct.]

### What To Notice
[What the reader might miss: repetition, contrast, movement, emphasis, literary detail, covenant thread, or emotional/spiritual tension.]

### Study Notes
- [Only include the most useful items.]
- [Translation note, cross reference, word meaning, cultural context, commentary support, or theological note.]

### Be Careful Not To Overread
[What should not be overclaimed or misapplied.]

### How It Lands Today
[A grounded application tied directly to the meaning of the text.]

### Worth Holding Onto
> [A concise sentence worth saving to Obsidian.]
```

## Sample Walkthrough Section

```markdown
## Joshua 11:6 - God Reassures Joshua

### What's Happening
God tells Joshua not to fear the gathered northern armies and promises that He will give them over to Israel.

### What To Notice
Joshua has already seen God give victory, but he still needs present reassurance. Past victories do not eliminate the need for present trust.

### Study Notes
- Translation note: CSB and NLT both carry the direct command not to fear, which echoes repeated biblical reassurance language.
- Context: Horses and chariots represented the enemy's military advantage. Israel was not being invited to win by matching the enemy's strength.
- Cross reference: Psalm 20:7 contrasts trusting in chariots and horses with trusting in the name of the Lord.

### Be Careful Not To Overread
This verse does not mean every intimidating situation will resolve quickly or visibly. The direct promise belongs to Joshua in Israel's conquest. The broader principle is that God's people are called to trust Him when visible strength looks unequal.

### How It Lands Today
God may ask His people to reject what looks strategically useful when it would become a misplaced source of trust.

### Worth Holding Onto
> Past victories do not eliminate the need for present trust.
```

## Claim Ledger

The claim ledger may be collapsed in the app by default, but it should exist behind the output.

```markdown
| Claim | Evidence | Source Type | Confidence |
|---|---|---|---|
| Joshua 11 functions as closure to the conquest phase | Joshua 10-12 chapter flow | Scripture context | Strongly supported |
| Horses and chariots represented military advantage | Joshua 11:4, ancient warfare background | Background-supported | High |
| Destroying the horses and chariots protected Israel from misplaced trust | Joshua 11:6, Psalm 20:7, broader biblical theology | Theological synthesis | Medium-high |
| This applies to modern dependence on strength or strategy | Pastoral application | Application/reflection | Application, not exegesis |
```

## Obsidian Connections

These should be separated from interpretation.

```markdown
## Connections From My Vault

- [[Note Title]] - Theme connection: trust, fear, or obedience.
- [[Note Title]] - Personal reflection connection: past prayer or life pattern.
- [[Note Title]] - Teaching connection: prior lesson or group discussion.
```

Connection labels:

- Direct Scripture connection
- Theme connection
- Personal reflection connection
- Ministry/application connection
- Teaching connection

## Final Synthesis

Keep this short. It should gather the study, not repeat every theme.

Include:

- Simple chapter summary
- 3 to 5 key takeaways
- 3 to 6 reflection questions
- Optional teaching aim
- Optional prayer prompt

## Obsidian Export Template

```markdown
---
type: bible-study
passage: "[Passage]"
translation: "[CSB/NLT]"
mode: "[Guided Deep Study]"
date: [YYYY-MM-DD]
book: "[Book Name]"
book_links: ["[[Book Name]]"]
people: []
places: []
groups: []
story_context: []
event_threads: []
entity_links: []
themes: []
tags: []
sources: []
status: draft
---

[[A - Faith]] [[R - Study Notes]] [[Book Name]]

# [Passage] Study Notes

## Big Idea

## Context

## Passage Map

## Verse Notes

## Worth Holding Onto

## Cross References

Each cross reference should include a short connection note.

- [Reference] - [short statement about why this passage is connected]
- Deuteronomy 16:18-20 - gives the Torah background for appointing judges and pursuing justice without partiality.
- Psalm 82 - shows God as the ultimate judge over earthly judges.

## Source Notes

## Personal Application

## Questions To Revisit

## Vault Connections

## Linked Notes
```

## Export Options

### Full Study Export

Includes the complete generated study, citations, source notes, claim ledger, and vault connections.

### Condensed Study Export

Includes only:

- Big idea
- Best "worth holding onto" notes
- Key cross references
- Personal application
- Questions to revisit
- Links to related Obsidian notes
- Required book note wikilink(s), such as `[[2 Chronicles]]`
- Suggested Bible entity wikilinks, such as `[[Ahab]]` or `[[Jerusalem]]`
- 2 to 5 controlled tags from `TAGGING_STRATEGY.md`

### Teaching Export

Includes:

- Teaching aim
- Main point
- Section outline
- Key explanations
- Discussion questions
- Application prompts
- Possible misunderstandings
