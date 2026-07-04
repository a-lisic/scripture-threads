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

function modeGuidance(mode: string) {
  const normalized = mode.toLowerCase();
  if (normalized.includes("quick")) {
    return `Mode budget:
- Quick Read should be concise.
- Use 3-5 verseNotes items.
- Each verseNotes item: note 1-2 sentences, details 1-2 bullets, application 0-1 bullet, reflection 0-1 question, crossReferences 0-1.
- Omit claimLedger and sourceRecords unless needed for a major interpretive guardrail.
- Use 0-1 translationNotes and 0-2 top-level crossReferences.
- Keep sourceNotes to 0-1 short note.`;
  }

  if (normalized.includes("teaching")) {
    return `Mode budget:
- Teaching Prep can be fuller, but still keep the main substance in verseNotes.
- Use 5-9 verseNotes items.
- Each verseNotes item: note 2-4 sentences, details 3-5 bullets, application 1-2 bullets, reflection 1 question, crossReferences 1-2.
- Use claimLedger max 5 items, sourceRecords max 5, sourceNotes max 3, translationNotes max 4, top-level crossReferences max 6.`;
  }

  if (normalized.includes("full")) {
    return `Mode budget:
- Full Research may be the most detailed mode.
- Use 6-12 verseNotes items.
- Each verseNotes item: note 2-4 sentences, details 4-6 bullets, application 1-3 bullets, reflection 1-2 questions, crossReferences 1-3.
- Use claimLedger max 7 items, sourceRecords max 7, sourceNotes max 4, translationNotes max 5, top-level crossReferences max 8.`;
  }

  return `Mode budget:
- Guided Deep Study should be grounded and rich without becoming bulky.
- Use 4-7 verseNotes items.
- Each verseNotes item: note 2-3 sentences, details 2-4 bullets, application 1-2 bullets, reflection 1 question, crossReferences 1-2.
- Use claimLedger max 4 items, sourceRecords max 4, sourceNotes max 2, translationNotes max 3, top-level crossReferences max 5.`;
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
- Use Obsidian wikilinks only for bookLinks, such as [[2 Chronicles]]. Do not create separate people/place/entity arrays.
- If exact Bible translation text is not supplied, summarize rather than quoting full copyrighted passages.
- Be explicit when a point is application rather than direct textual claim.
- Return JSON only so the result can be imported back into Scripture Threads.

${modeGuidance(input.mode)}

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
  const normalizedMode = input.mode.toLowerCase();
  const limits = normalizedMode.includes("quick")
    ? { claims: 0, sourceRecords: 0, sourceNotes: 1, translationNotes: 1, crossReferences: 2, details: 2, application: 1, reflection: 1, verseCrossRefs: 1 }
    : normalizedMode.includes("teaching")
      ? { claims: 5, sourceRecords: 5, sourceNotes: 3, translationNotes: 4, crossReferences: 6, details: 5, application: 2, reflection: 1, verseCrossRefs: 2 }
      : normalizedMode.includes("full")
        ? { claims: 7, sourceRecords: 7, sourceNotes: 4, translationNotes: 5, crossReferences: 8, details: 6, application: 3, reflection: 2, verseCrossRefs: 3 }
        : { claims: 4, sourceRecords: 4, sourceNotes: 2, translationNotes: 3, crossReferences: 5, details: 4, application: 2, reflection: 1, verseCrossRefs: 2 };
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
  const verseNotes = (data.verseNotes || []).map((item) => ({
    ...item,
    details: (item.details || []).slice(0, limits.details),
    application: (item.application || []).slice(0, limits.application),
    reflection: (item.reflection || []).slice(0, limits.reflection),
    crossReferences: (item.crossReferences || []).slice(0, limits.verseCrossRefs)
  }));

  return {
    passage: data.passage || input.passage,
    translation: data.translation || input.translation,
    mode: data.mode || input.mode,
    book: data.book || input.passage.replace(/\s+\d.*$/, ""),
    sourceProfile: data.sourceProfile || "Scripture-first evangelical, non-denominational, continuationist-friendly",
    generatedAt: new Date().toISOString(),
    generationStatus: "generated",
    bookLinks: data.bookLinks || [],
    people: [],
    places: [],
    groups: [],
    storyContext: [],
    eventThreads: [],
    entityLinks: [],
    themes: [],
    tags,
    sources: data.sources || ["AI-generated draft"],
    bigIdea: data.bigIdea || "Generated study draft.",
    context: data.context || [],
    passageMap: data.passageMap || [],
    verseNotes,
    crossReferences: (data.crossReferences || []).slice(0, limits.crossReferences),
    translationNotes: (data.translationNotes || []).slice(0, limits.translationNotes),
    claimLedger: (data.claimLedger || []).slice(0, limits.claims),
    questions: (data.questions || []).slice(0, 2),
    application: (data.application || []).slice(0, 2),
    sourceRecords: (data.sourceRecords || []).slice(0, limits.sourceRecords),
    sourceNotes: (data.sourceNotes || ["Generated by connected AI provider. Review claims before teaching or exporting."]).slice(
      0,
      limits.sourceNotes
    )
  };
}

export function parseStudyJson(text: string, input: { passage: string; translation: string; mode: string }) {
  return normalizeGeneratedStudy(JSON.parse(extractJson(text)), input);
}
