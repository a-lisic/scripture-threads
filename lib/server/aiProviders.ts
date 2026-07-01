import "server-only";

import type { Study } from "@/lib/types";

export type AiProviderId = "openai" | "anthropic";

type ProviderCheck = {
  ok: boolean;
  message: string;
};

const OPENAI_DEFAULT_MODEL = process.env.AI_OPENAI_MODEL || "gpt-4.1-mini";
const ANTHROPIC_DEFAULT_MODEL = process.env.AI_ANTHROPIC_MODEL || "claude-3-5-haiku-latest";

export function isAiProvider(value: unknown): value is AiProviderId {
  return value === "openai" || value === "anthropic";
}

export function looksLikeProviderKey(provider: AiProviderId, apiKey: string) {
  const trimmed = apiKey.trim();
  if (provider === "openai") return /^sk-[A-Za-z0-9_-]{20,}$/.test(trimmed);
  return /^sk-ant-[A-Za-z0-9_-]{20,}$/.test(trimmed);
}

export async function verifyProviderKey(provider: AiProviderId, apiKey: string): Promise<ProviderCheck> {
  if (!looksLikeProviderKey(provider, apiKey)) return { ok: false, message: "Key format does not match the selected provider." };

  const response =
    provider === "openai"
      ? await fetch("https://api.openai.com/v1/models", {
          headers: { Authorization: `Bearer ${apiKey}` }
        })
      : await fetch("https://api.anthropic.com/v1/models", {
          headers: {
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01"
          }
        });

  if (response.ok) return { ok: true, message: `${provider} key verified.` };
  if (response.status === 401 || response.status === 403) return { ok: false, message: "Provider rejected this key." };
  return { ok: false, message: `Provider verification failed with status ${response.status}.` };
}

function studySchemaInstructions() {
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

function buildStudyPrompt(input: { passage: string; translation: string; mode: string }) {
  return `Create a Scripture Threads Bible study note.

Passage: ${input.passage}
Preferred translation: ${input.translation}
Mode: ${input.mode}
Doctrinal posture: Scripture-first evangelical, non-denominational, continuationist-friendly.

Requirements:
- Do not invent commentary citations or claim direct source support you do not have.
- Keep chunks usable, not bloated.
- Integrate application, cross references, context, and guardrails inside the verse-by-verse notes.
- Include short cross-reference connection statements.
- Use Obsidian wikilinks for book/person/place/entity arrays, such as [[2 Chronicles]].
- If exact Bible translation text is not supplied, summarize rather than quoting full copyrighted passages.
- Be explicit when a point is application rather than direct textual claim.

${studySchemaInstructions()}`;
}

function extractJson(text: string) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  if (fenced) return fenced[1];
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);
  return trimmed;
}

function normalizeGeneratedStudy(value: unknown, input: { passage: string; translation: string; mode: string }): Study {
  const data = value && typeof value === "object" ? (value as Partial<Study>) : {};
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
    tags: data.tags || [],
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

async function generateWithOpenAi(apiKey: string, input: { passage: string; translation: string; mode: string }) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: OPENAI_DEFAULT_MODEL,
      input: buildStudyPrompt(input),
      text: { format: { type: "json_object" } }
    })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || `OpenAI generation failed (${response.status}).`);
  const text =
    data.output_text ||
    data.output?.flatMap((item: { content?: Array<{ text?: string }> }) => item.content || []).map((item: { text?: string }) => item.text || "").join("");
  return normalizeGeneratedStudy(JSON.parse(extractJson(String(text || "{}"))), input);
}

async function generateWithAnthropic(apiKey: string, input: { passage: string; translation: string; mode: string }) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: ANTHROPIC_DEFAULT_MODEL,
      max_tokens: 5000,
      messages: [{ role: "user", content: buildStudyPrompt(input) }]
    })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || `Anthropic generation failed (${response.status}).`);
  const text = data.content?.map((item: { text?: string }) => item.text || "").join("") || "";
  return normalizeGeneratedStudy(JSON.parse(extractJson(text)), input);
}

export async function generateStudyWithProvider(provider: AiProviderId, apiKey: string, input: { passage: string; translation: string; mode: string }) {
  if (provider === "openai") return generateWithOpenAi(apiKey, input);
  return generateWithAnthropic(apiKey, input);
}
