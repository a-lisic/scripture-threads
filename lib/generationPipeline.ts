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
    missing: ["server-side generation host"],
    notes: [
      "The hosted Spark build is static, so browser code must not call private Bible or AI keys.",
      "YouVersion REST support is implemented as a server-side adapter and smoke test, but it is not called directly from the browser.",
      "Live AI study generation still needs a provider strategy: app-owned API key, user-owned API key, or manual copy/paste AI workflow."
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
