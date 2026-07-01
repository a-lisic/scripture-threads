export type YouVersionIntegrationStatus = {
  ready: boolean;
  needed: string[];
  keyVariable?: "YOUVERSION_APP_KEY" | "YOUVERSION_API_KEY";
};

export type YouVersionBible = {
  id: number;
  abbreviation: string;
  localized_abbreviation?: string;
  localized_title?: string;
  title: string;
  language_tag?: string;
};

export type YouVersionPassage = {
  id: string;
  reference: string;
  content: string;
  requestedTranslation: string;
  resolvedTranslation: string;
  bibleId: number;
  bibleTitle: string;
  usedFallback: boolean;
};

const API_BASE = "https://api.youversion.com/v1";

const PREFERRED_FALLBACK_TRANSLATIONS = ["BSB", "NASB2020", "NIV", "NASB1995", "ASV"];

const BOOK_TO_USFM: Record<string, string> = {
  genesis: "GEN",
  exodus: "EXO",
  leviticus: "LEV",
  numbers: "NUM",
  deuteronomy: "DEU",
  joshua: "JOS",
  judges: "JDG",
  ruth: "RUT",
  "1 samuel": "1SA",
  "2 samuel": "2SA",
  "1 kings": "1KI",
  "2 kings": "2KI",
  "1 chronicles": "1CH",
  "2 chronicles": "2CH",
  ezra: "EZR",
  nehemiah: "NEH",
  esther: "EST",
  job: "JOB",
  psalms: "PSA",
  psalm: "PSA",
  proverbs: "PRO",
  ecclesiastes: "ECC",
  "song of songs": "SNG",
  "song of solomon": "SNG",
  isaiah: "ISA",
  jeremiah: "JER",
  lamentations: "LAM",
  ezekiel: "EZK",
  daniel: "DAN",
  hosea: "HOS",
  joel: "JOL",
  amos: "AMO",
  obadiah: "OBA",
  jonah: "JON",
  micah: "MIC",
  nahum: "NAM",
  habakkuk: "HAB",
  zephaniah: "ZEP",
  haggai: "HAG",
  zechariah: "ZEC",
  malachi: "MAL",
  matthew: "MAT",
  mark: "MRK",
  luke: "LUK",
  john: "JHN",
  acts: "ACT",
  romans: "ROM",
  "1 corinthians": "1CO",
  "2 corinthians": "2CO",
  galatians: "GAL",
  ephesians: "EPH",
  philippians: "PHP",
  colossians: "COL",
  "1 thessalonians": "1TH",
  "2 thessalonians": "2TH",
  "1 timothy": "1TI",
  "2 timothy": "2TI",
  titus: "TIT",
  philemon: "PHM",
  hebrews: "HEB",
  james: "JAS",
  "1 peter": "1PE",
  "2 peter": "2PE",
  "1 john": "1JN",
  "2 john": "2JN",
  "3 john": "3JN",
  jude: "JUD",
  revelation: "REV"
};

function getAppKey() {
  return process.env.YOUVERSION_APP_KEY || process.env.YOUVERSION_API_KEY || "";
}

function getKeyVariable(): YouVersionIntegrationStatus["keyVariable"] {
  if (process.env.YOUVERSION_APP_KEY) return "YOUVERSION_APP_KEY";
  if (process.env.YOUVERSION_API_KEY) return "YOUVERSION_API_KEY";
  return undefined;
}

function normalizeTranslation(value: string) {
  return value.trim().toUpperCase();
}

function normalizeBook(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function getYouVersionIntegrationStatus(): YouVersionIntegrationStatus {
  const needed: string[] = [];
  if (!getAppKey()) needed.push("YOUVERSION_APP_KEY");

  return {
    ready: needed.length === 0,
    needed,
    keyVariable: getKeyVariable()
  };
}

export function parsePassageToUsfm(passage: string) {
  const cleaned = passage.trim().replace(/\s+/g, " ");
  const match = cleaned.match(/^((?:[1-3]\s+)?[A-Za-z]+(?:\s+[A-Za-z]+)*?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/);
  if (!match) throw new Error(`Unsupported passage format: ${passage}`);

  const [, bookName, chapter, startVerse, endVerse] = match;
  const bookCode = BOOK_TO_USFM[normalizeBook(bookName)];
  if (!bookCode) throw new Error(`Unsupported Bible book: ${bookName}`);

  if (!startVerse) return `${bookCode}.${chapter}`;
  if (endVerse) return `${bookCode}.${chapter}.${startVerse}-${bookCode}.${chapter}.${endVerse}`;
  return `${bookCode}.${chapter}.${startVerse}`;
}

async function youVersionFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const appKey = getAppKey();
  if (!appKey) throw new Error("Missing YOUVERSION_APP_KEY.");

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "X-YVP-App-Key": appKey,
      ...(init?.headers || {})
    }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`YouVersion request failed (${response.status}): ${body.slice(0, 300)}`);
  }

  return response.json() as Promise<T>;
}

export async function listAvailableBibles(language = "en"): Promise<YouVersionBible[]> {
  const params = new URLSearchParams();
  params.append("language_ranges[]", language);
  params.set("page_size", "99");
  const response = await youVersionFetch<{ data: YouVersionBible[] }>(`/bibles?${params.toString()}`);
  return response.data || [];
}

function findBibleForTranslation(bibles: YouVersionBible[], requestedTranslation: string) {
  const requested = normalizeTranslation(requestedTranslation);
  const exact = bibles.find((bible) =>
    [bible.abbreviation, bible.localized_abbreviation].filter(Boolean).some((abbr) => normalizeTranslation(String(abbr)) === requested)
  );
  if (exact) return exact;

  return PREFERRED_FALLBACK_TRANSLATIONS.map((fallback) =>
    bibles.find((bible) =>
      [bible.abbreviation, bible.localized_abbreviation].filter(Boolean).some((abbr) => normalizeTranslation(String(abbr)) === fallback)
    )
  ).find(Boolean);
}

export async function fetchYouVersionPassage(passage: string, translation: string): Promise<YouVersionPassage> {
  const bibles = await listAvailableBibles("en");
  const bible = findBibleForTranslation(bibles, translation);
  if (!bible) throw new Error("No supported English Bible version is available for this YouVersion App Key.");

  const usfmPassage = parsePassageToUsfm(passage);
  const response = await youVersionFetch<{ id: string; reference: string; content: string }>(
    `/bibles/${bible.id}/passages/${encodeURIComponent(usfmPassage)}`
  );

  const resolvedTranslation = bible.localized_abbreviation || bible.abbreviation;
  return {
    id: response.id,
    reference: response.reference,
    content: response.content,
    requestedTranslation: translation,
    resolvedTranslation,
    bibleId: bible.id,
    bibleTitle: bible.localized_title || bible.title,
    usedFallback: normalizeTranslation(resolvedTranslation) !== normalizeTranslation(translation)
  };
}
