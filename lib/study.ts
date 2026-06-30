import { fixture } from "./fixtures";
import type { Study } from "./types";

export function normalizePassage(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function getBookName(passage: string) {
  const cleaned = passage.trim().replace(/\s+/g, " ");
  const match = cleaned.match(/^((?:[1-3]\s+)?[A-Za-z]+(?:\s+[A-Za-z]+)*?)(?:\s+\d|$)/);
  return match ? match[1] : cleaned || "Unknown Book";
}

export function generateStudy(passage: string, translation: string, mode: string): Study {
  if (normalizePassage(passage) === "2 chronicles 19") {
    return {
      ...fixture,
      translation,
      mode
    };
  }

  const book = getBookName(passage);
  return {
    passage: passage.trim() || "Untitled Passage",
    translation,
    mode,
    book,
    bookLinks: [`[[${book}]]`],
    people: [],
    places: [],
    groups: [],
    storyContext: [],
    eventThreads: [],
    entityLinks: [],
    themes: ["context", "observation", "application"],
    tags: ["study"],
    sources: ["Scripture"],
    bigIdea:
      "Prototype scaffold: this passage is ready for generated study content once AI and Bible-source integrations are connected.",
    context: [
      "This prototype currently includes a detailed fixture for 2 Chronicles 19. For other passages, it generates the export structure so the workflow can be tested."
    ],
    passageMap: [[passage.trim() || "Untitled Passage", "Study scaffold", "Awaiting generated passage analysis"]],
    verseNotes: [
      {
        reference: passage.trim() || "Untitled Passage",
        note:
          "Generated notes will eventually include context, what to notice, study notes, overread guardrails, application, and concise takeaways.",
        details: [],
        keep: "This note is a placeholder for workflow testing."
      }
    ],
    crossReferences: [],
    questions: ["What should this passage help me notice, obey, or revisit?"],
    application: ["What is one faithful response to this passage today?"],
    sourceNotes: ["Prototype scaffold only. No external Bible or commentary sources were queried."]
  };
}
