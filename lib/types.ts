export type PassageMapRow = [section: string, movement: string, emphasis: string];
export type CrossReference = [reference: string, connection: string];

export type VerseNote = {
  reference: string;
  note: string;
  details: string[];
  keep: string;
};

export type Study = {
  passage: string;
  translation: string;
  mode: string;
  book: string;
  bookLinks: string[];
  people: string[];
  places: string[];
  groups: string[];
  storyContext: string[];
  eventThreads: string[];
  entityLinks: string[];
  themes: string[];
  tags: string[];
  sources: string[];
  bigIdea: string;
  context: string[];
  passageMap: PassageMapRow[];
  verseNotes: VerseNote[];
  crossReferences: CrossReference[];
  questions: string[];
  application: string[];
  sourceNotes: string[];
};

export type MemoryEntry = {
  id: string;
  ownerId: string;
  passage: string;
  translation: string;
  mode: string;
  book: string;
  status: "draft" | "kept" | "exported";
  createdAt: string;
  updatedAt: string;
  study: Study;
  markdown: string;
};

export type ExportDestination = {
  id: string;
  label: string;
  description: string;
  status: "available" | "planned" | "requires-connection";
};
