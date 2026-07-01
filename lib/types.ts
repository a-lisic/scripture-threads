export type PassageMapRow = [section: string, movement: string, emphasis: string];
export type CrossReference = [reference: string, connection: string];
export type SourceType =
  | "scripture"
  | "commentary"
  | "dictionary"
  | "language"
  | "background"
  | "vault"
  | "application";

export type EvidenceConfidence = "clear" | "strong" | "supported" | "possible" | "application";

export type StudySource = {
  id: string;
  label: string;
  type: SourceType;
  reference?: string;
  url?: string;
  note?: string;
};

export type ClaimLedgerEntry = {
  claim: string;
  evidence: string;
  sourceType: SourceType;
  confidence: EvidenceConfidence;
};

export type TranslationNote = {
  reference: string;
  note: string;
  translations: string[];
};

export type VerseNote = {
  reference: string;
  note: string;
  details: string[];
  guardrails?: string[];
  application?: string[];
  crossReferences?: CrossReference[];
  keep: string;
};

export type Study = {
  passage: string;
  translation: string;
  mode: string;
  book: string;
  sourceProfile: string;
  generatedAt: string;
  generationStatus: "fixture" | "scaffold" | "generated";
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
  translationNotes: TranslationNote[];
  claimLedger: ClaimLedgerEntry[];
  questions: string[];
  application: string[];
  sourceRecords: StudySource[];
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

export type ObsidianConnectorSettings = {
  vaultName: string;
  studyNoteFolder: string;
  bookHubFolder: string;
  contentHubFolder: string;
  bibleDatabaseFolder: string;
  exportMethod: "obsidian-uri" | "markdown-download";
  updatedAt?: string;
};

export type AdminUserSummary = {
  uid: string;
  email: string;
  displayName: string;
  role: "super_admin" | "user";
  updatedAt?: string;
  studyCount: number;
};

export type AdminSettings = {
  appStatus: "prototype" | "private_beta" | "live";
  defaultTranslation: string;
  defaultMode: "Quick Read" | "Guided Deep Study" | "Teaching Prep" | "Full Research";
  sourceProfile: string;
  publicSignupEnabled: boolean;
  aiGenerationEnabled: boolean;
  youVersionEnabled: boolean;
  maintenanceMessage: string;
  updatedAt?: string;
  updatedBy?: string;
};

export type AdminActivityLog = {
  id: string;
  action: string;
  actorEmail: string;
  createdAt: string;
  detail: string;
};

export type AdminSnapshot = {
  superAdminEmails: string[];
  users: AdminUserSummary[];
  settings: AdminSettings;
  activity: AdminActivityLog[];
  totalUsers: number;
  totalStudies: number;
  loadedAt: string;
};
