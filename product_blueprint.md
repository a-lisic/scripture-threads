# Scripture Threads - Product Blueprint

## Working Goal

Build a Bible study companion that takes a Scripture passage and produces a structured, source-grounded study guide with contextual overview, verse-by-verse walkthrough, cross references, original-language and cultural notes when relevant, doctrinally aligned commentary support, personal application woven throughout, and Obsidian-ready export notes.

The app should help the user study deeply without replacing their own careful reading, prayer, discernment, or pastoral/community accountability.

## Core Convictions

1. Scripture comes first.
   - The app should begin with the biblical text and context.
   - It should distinguish what is directly in the passage from commentary, synthesis, application, and personal reflection.

2. Claims need evidence.
   - Major claims should cite Scripture, commentary, language tools, historical sources, or the user's own notes.
   - The app should avoid unsupported spiritual-sounding jumps.

3. Application should be woven in, not dumped at the end.
   - Each verse or section should include grounded application where appropriate.
   - Final takeaways should synthesize, not repeat everything.

4. Depth should be layered.
   - The default output should be readable and useful.
   - Deeper research, word studies, commentary excerpts, and claim details should be expandable or secondary.

5. Obsidian is part of the study ecosystem.
   - The app should eventually connect current study to past notes, prayer themes, teaching notes, life patterns, and ministry reflections.
   - Vault connections must be labeled carefully so they do not become accidental interpretation.
   - Bible people, places, events, and topics should become linked database-style pages over time without requiring manual tagging.

## User Study Profile

- Day-to-day reading: NLT or CSB.
- Teaching preference: CSB.
- Translation comparison: helpful when it clarifies meaning, emphasis, or wording.
- Church context: non-denominational evangelical.
- Doctrinal posture: open to and affirming active gifts of the Holy Spirit for believers today.
- Desired tone: warm, direct, Scripture-first, thoughtful, not academic for its own sake.

## Source Profile

### Preferred Bible Translations

- Primary daily reading: NLT or CSB.
- Primary teaching: CSB.
- Optional comparison translations: ESV, NASB, NIV, KJV/NKJV, or others when useful.

Translation comparison should be selective. The app should not show multiple translations unless the difference helps the study.

### Commentary and Study Sources

Initial trusted-source lane:

- Enduring Word, with permission/copyright caution.
- Other evangelical, Scripture-centered resources to be evaluated.
- Public domain commentaries can be used for technical or historical support, but should be screened for doctrinal fit and dated language.

Potential future source categories:

- User-owned books or exported notes.
- Sermon notes or teaching manuscripts.
- Study Bible notes.
- Lexicons and dictionaries.
- Bible atlas or background resources.
- The user's Obsidian notes.

### Source Rules

- Do not quote long copyrighted passages.
- Prefer short quotes plus summary and citation.
- Do not treat a commentary as equal to Scripture.
- Label disagreements or debated interpretations.
- Prefer sources aligned with the user's stated theological lane.

## Evidence and Confidence System

Each meaningful claim should be tagged internally or visibly with one of these evidence levels:

- Clear from the text: directly stated in the passage.
- Strongly supported: supported by immediate context, book context, or cross references.
- Commentary-supported: supported by an approved source, but not directly stated.
- Background-supported: supported by historical, cultural, language, or geography resources.
- Possible but uncertain: plausible, but should not be taught dogmatically.
- Application/reflection: a faithful modern landing point, not the original meaning itself.
- Vault connection: connection to the user's prior notes, life, prayer, or ministry context.

## Required Guardrails

- Separate meaning, implication, application, and personal connection.
- Do not overstate typology, symbolism, or prophetic connections.
- Do not turn every narrative detail into a universal principle.
- Do not use original-language notes unless they clarify something meaningful.
- Do not force Obsidian connections into the passage's meaning.
- When sources disagree, say so briefly.
- When evidence is thin, label the claim as possible or uncertain.

## Study Modes

### Quick Read

For daily reading when the user wants orientation without a long study.

Includes:

- Big idea
- Brief context
- Section map
- Key noticings
- Short application
- Keep notes

### Guided Deep Study

Default mode.

Includes:

- Chapter context
- Passage map
- Section-by-section or verse-by-verse walkthrough
- Selective study helps
- Woven application
- Guardrails
- Keep notes
- Summary and questions

### Full Research

For deeper digging.

Includes:

- More commentary support
- More cross references
- Expanded word studies
- Historical/cultural notes
- Claim ledger
- Interpretation options

### Teaching Prep

For preparing to teach from the passage.

Includes:

- Teaching aim
- Main point
- Section flow
- Key explanations
- Possible misunderstandings
- Group discussion questions
- Application prompts
- Concise teaching outline

## MVP Scope

The first prototype should do only the following:

1. Accept a passage reference.
2. Let the user choose mode: Quick Read, Guided Deep Study, Full Research, or Teaching Prep.
3. Let the user choose primary translation: NLT or CSB.
4. Generate structured study output using the approved template.
5. Include citations/evidence labels for major claims.
6. Create an Obsidian-ready markdown export.

Do not build full vault integration in the first version. Instead, design the export well and add vault search/connections in phase two.

## Phase Two

- Search the user's Obsidian vault for related notes.
- Suggest links to past Bible studies, prayers, teaching notes, and life themes.
- Add automated Bible entity detection for people, places, nations/groups, events, and topics.
- Suggest database-style wikilinks such as `[[Ahab]]`, `[[Jehoshaphat]]`, `[[Jerusalem]]`, and `[[Ramoth-gilead]]`.
- Add source library management.
- Save study history.
- Add tags and theme tracking.
- Support "keep this" selection while studying.
- Add export destinations directly into the vault.

## Open Decisions

- Which Bible API or source will provide NLT/CSB text legally?
- Which commentaries are approved for default use?
- Which sources should be excluded?
- How visible should the claim ledger be in the default interface?
- What should the Obsidian folder path and note naming convention be?
- Should Bible entity pages live under `2. AREAS/Faith/Bible Database/`, and which entity types should be created first?
- Should the app run locally only, or eventually sync across devices?
