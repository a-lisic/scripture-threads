import fs from "node:fs";
import path from "node:path";

const API_BASE = "https://api.youversion.com/v1";
const ENV_PATH = path.join(process.cwd(), ".env.local");
const PREFERRED_FALLBACK_TRANSLATIONS = ["BSB", "NASB2020", "NIV", "NASB1995", "ASV"];

const BOOK_TO_USFM = {
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

function loadLocalEnv() {
  if (!fs.existsSync(ENV_PATH)) return;

  const lines = fs.readFileSync(ENV_PATH, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [rawKey, ...rawValue] = trimmed.split("=");
    const key = rawKey.trim();
    const value = rawValue.join("=").trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

function getAppKey() {
  return process.env.YOUVERSION_APP_KEY || process.env.YOUVERSION_API_KEY || "";
}

function normalizeTranslation(value) {
  return value.trim().toUpperCase();
}

function parsePassageToUsfm(passage) {
  const cleaned = passage.trim().replace(/\s+/g, " ");
  const match = cleaned.match(/^((?:[1-3]\s+)?[A-Za-z]+(?:\s+[A-Za-z]+)*?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/);
  if (!match) throw new Error(`Unsupported passage format: ${passage}`);

  const [, bookName, chapter, startVerse, endVerse] = match;
  const bookCode = BOOK_TO_USFM[bookName.trim().toLowerCase().replace(/\s+/g, " ")];
  if (!bookCode) throw new Error(`Unsupported Bible book: ${bookName}`);

  if (!startVerse) return `${bookCode}.${chapter}`;
  if (endVerse) return `${bookCode}.${chapter}.${startVerse}-${bookCode}.${chapter}.${endVerse}`;
  return `${bookCode}.${chapter}.${startVerse}`;
}

async function youVersionFetch(pathname) {
  const response = await fetch(`${API_BASE}${pathname}`, {
    headers: {
      "X-YVP-App-Key": getAppKey()
    }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`YouVersion request failed (${response.status}): ${body.slice(0, 300)}`);
  }

  return response.json();
}

async function main() {
  loadLocalEnv();

  if (!getAppKey()) {
    throw new Error("Missing YOUVERSION_APP_KEY or YOUVERSION_API_KEY in .env.local.");
  }

  const requestedTranslation = process.argv[2] || "CSB";
  const passage = process.argv.slice(3).join(" ") || "2 Chronicles 19";
  const params = new URLSearchParams();
  params.append("language_ranges[]", "en");
  params.set("page_size", "99");

  const biblesResponse = await youVersionFetch(`/bibles?${params.toString()}`);
  const bibles = biblesResponse.data || [];
  const exactBible = bibles.find((bible) =>
    [bible.abbreviation, bible.localized_abbreviation]
      .filter(Boolean)
      .some((abbr) => normalizeTranslation(String(abbr)) === normalizeTranslation(requestedTranslation))
  );
  const fallbackBible =
    exactBible ||
    PREFERRED_FALLBACK_TRANSLATIONS.map((fallback) =>
      bibles.find((bible) =>
        [bible.abbreviation, bible.localized_abbreviation].filter(Boolean).some((abbr) => normalizeTranslation(String(abbr)) === fallback)
      )
    ).find(Boolean);

  if (!fallbackBible) throw new Error("No supported English Bible version is available for this YouVersion App Key.");

  const passageId = parsePassageToUsfm(passage);
  const passageResponse = await youVersionFetch(`/bibles/${fallbackBible.id}/passages/${encodeURIComponent(passageId)}`);
  const resolvedTranslation = fallbackBible.localized_abbreviation || fallbackBible.abbreviation;

  console.log("YouVersion smoke test passed");
  console.log(`Available English Bibles: ${bibles.length}`);
  console.log(`Requested translation: ${requestedTranslation}`);
  console.log(`Resolved translation: ${resolvedTranslation}`);
  console.log(`Used fallback: ${normalizeTranslation(resolvedTranslation) !== normalizeTranslation(requestedTranslation)}`);
  console.log(`Passage: ${passageResponse.reference}`);
  console.log(`Bible: ${fallbackBible.localized_title || fallbackBible.title} (${fallbackBible.id})`);
  console.log(`Content characters: ${String(passageResponse.content || "").length}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
