import { generateStudy } from "./study";
import type { Study } from "./types";

export type GenerationInput = {
  passage: string;
  translation: string;
  mode: string;
};

export type GenerationBackendStatus = {
  mode: "static-prototype" | "server-ready";
  ready: boolean;
  missing: string[];
  notes: string[];
};

export type GenerationResult = {
  study: Study;
  backendStatus: GenerationBackendStatus;
};

export function getGenerationBackendStatus(): GenerationBackendStatus {
  return {
    mode: "static-prototype",
    ready: false,
    missing: ["server-side generation host", "OPENAI_API_KEY"],
    notes: [
      "The hosted Spark build is static, so browser code must not call private Bible or AI keys.",
      "YouVersion is intentionally deferred until the API key and allowed translations are confirmed."
    ]
  };
}

export async function generateStudyDraft(input: GenerationInput): Promise<GenerationResult> {
  const study = generateStudy(input.passage, input.translation, input.mode);
  return {
    study,
    backendStatus: getGenerationBackendStatus()
  };
}
