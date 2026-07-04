import type { Study } from "@/lib/types";

export function studySchemaInstructions() {
  return `Return only valid JSON matching this TypeScript shape:
{
  "passage": string,
  "translation": string,
  "mode": string,
  "book": string,
  "sourceProfile": string,
  "generatedAt": string,
  "generationStatus": "generated",
  "bookLinks": string[],
  "people": string[],
  "places": string[],
  "groups": string[],
  "storyContext": string[],
  "eventThreads": string[],
  "entityLinks": string[],
  "themes": string[],
  "tags": string[],
  "sources": string[],
  "bigIdea": string,
  "context": string[],
  "passageMap": [string, string, string][],
  "verseNotes": Array<{
    "reference": string,
    "note": string,
    "details": string[],
    "guardrails"?: string[],
    "application"?: string[],
    "crossReferences"?: [string, string][],
    "reflection"?: string[],
    "keep": string
  }>,
  "crossReferences": [string, string][],
  "translationNotes": Array<{ "reference": string, "note": string, "translations": string[] }>,
  "claimLedger": Array<{ "claim": string, "evidence": string, "sourceType": "scripture" | "commentary" | "dictionary" | "language" | "background" | "vault" | "application", "confidence": "clear" | "strong" | "supported" | "possible" | "application" }>,
  "questions": string[],
  "application": string[],
  "sourceRecords": Array<{ "id": string, "label": string, "type": "scripture" | "commentary" | "dictionary" | "language" | "background" | "vault" | "application", "reference"?: string, "url"?: string, "note"?: string }>,
  "sourceNotes": string[]
}`;
}

export function buildStudyPrompt(input: { passage: string; translation: string; mode: string }) {
  return `Create a Scripture Threads Bible study note.

Passage: ${input.passage}
Preferred translation: ${input.translation}
Mode: ${input.mode}
Doctrinal posture: Scripture-first evangelical, non-denominational, continuationist-friendly.

Requirements:
- Do not invent commentary citations or claim direct source support you do not have.
- Keep chunks usable, not bloated.
- The main depth belongs inside the verse-by-verse walkthrough, not in a large ending summary.
- Each verse/section note should move beyond historical facts into textual meaning, key word observations, cultural or covenant context, cross references, and present-day application where the text supports it.
- Use the verseNotes array as the primary study experience. Group verses naturally when needed, but make each section substantial enough to help someone study.
- For each verseNotes item:
  - note: 2-4 sentences explaining what is happening in the text and why it matters.
  - details: 3-6 bullets that may include word meaning, historical/cultural background, canonical context, literary movement, and careful observations.
  - crossReferences: 1-3 relevant references with a short sentence explaining the connection.
  - application: 1-3 grounded application bullets woven from the text, not generic advice.
  - reflection: 1-2 questions that help the reader personally wrestle with this section.
  - guardrails: include only when needed to prevent overreading, flattening, or unsupported leaps.
  - keep: one concise key note or life-application sentence for this section.
- Keep questions and application at the end short: 0-2 overarching items only if they genuinely summarize the whole passage.
- Include short cross-reference connection statements.
- Make tags refined and reusable: 3-5 lowercase thematic tags, not every entity, detail, or one-time idea.
- Use Obsidian wikilinks for book/person/place/entity arrays, such as [[2 Chronicles]].
- If exact Bible translation text is not supplied, summarize rather than quoting full copyrighted passages.
- Be explicit when a point is application rather than direct textual claim.
- Return JSON only so the result can be imported back into Scripture Threads.

${studySchemaInstructions()}`;
}

export function extractJson(text: string) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  if (fenced) return fenced[1];
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);
  return trimmed;
}

export function normalizeGeneratedStudy(value: unknown, input: { passage: string; translation: string; mode: string }): Study {
  const data = value && typeof value === "object" ? (value as Partial<Study>) : {};
  const tags = (data.tags || [])
    .map((tag) =>
      tag
        .replace(/^#/, "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    )
    .filter(Boolean)
    .filter((tag, index, list) => list.indexOf(tag) === index)
    .slice(0, 5);

  return {
    passage: data.passage || input.passage,
    translation: data.translation || input.translation,
    mode: data.mode || input.mode,
    book: data.book || input.passage.replace(/\s+\d.*$/, ""),
    sourceProfile: data.sourceProfile || "Scripture-first evangelical, non-denominational, continuationist-friendly",
    generatedAt: new Date().toISOString(),
    generationStatus: "generated",
    bookLinks: data.bookLinks || [],
    people: data.people || [],
    places: data.places || [],
    groups: data.groups || [],
    storyContext: data.storyContext || [],
    eventThreads: data.eventThreads || [],
    entityLinks: data.entityLinks || [],
    themes: data.themes || [],
    tags,
    sources: data.sources || ["AI-generated draft"],
    bigIdea: data.bigIdea || "Generated study draft.",
    context: data.context || [],
    passageMap: data.passageMap || [],
    verseNotes: data.verseNotes || [],
    crossReferences: data.crossReferences || [],
    translationNotes: data.translationNotes || [],
    claimLedger: data.claimLedger || [],
    questions: data.questions || [],
    application: data.application || [],
    sourceRecords: data.sourceRecords || [],
    sourceNotes: data.sourceNotes || ["Generated by connected AI provider. Review claims before teaching or exporting."]
  };
}

export function parseStudyJson(text: string, input: { passage: string; translation: string; mode: string }) {
  return normalizeGeneratedStudy(JSON.parse(extractJson(text)), input);
}
