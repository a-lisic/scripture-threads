import "server-only";

import { buildStudyPrompt, extractJson, normalizeGeneratedStudy } from "@/lib/studyPrompt";

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
