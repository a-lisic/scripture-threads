"use client";

import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import type { ObsidianConnectorSettings, Study } from "./types";

const LOCAL_OBSIDIAN_KEY = "scriptureThreads.obsidianConnector.v1";
const MAX_OBSIDIAN_URI_LENGTH = 18000;

export const DEFAULT_OBSIDIAN_SETTINGS: ObsidianConnectorSettings = {
  vaultName: "Elizabeth Vault",
  studyNoteFolder: "2. AREAS/Faith/Study Notes",
  bookHubFolder: "2. AREAS/Faith/Books of the Bible",
  contentHubFolder: "2. AREAS/Content Lab",
  bibleDatabaseFolder: "2. AREAS/Faith/Bible Database",
  exportMethod: "obsidian-uri"
};

function cleanPathSegment(value: string) {
  return value
    .replace(/[\\:*?"<>|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanFolder(value: string) {
  return value
    .split("/")
    .map(cleanPathSegment)
    .filter(Boolean)
    .join("/");
}

function withoutMarkdownExtension(value: string) {
  return value.replace(/\.md$/i, "");
}

function withSettingsDefaults(settings?: Partial<ObsidianConnectorSettings> | null): ObsidianConnectorSettings {
  return {
    ...DEFAULT_OBSIDIAN_SETTINGS,
    ...(settings || {}),
    exportMethod: settings?.exportMethod || DEFAULT_OBSIDIAN_SETTINGS.exportMethod
  };
}

function readLocalSettings() {
  if (typeof window === "undefined") return DEFAULT_OBSIDIAN_SETTINGS;
  try {
    return withSettingsDefaults(JSON.parse(localStorage.getItem(LOCAL_OBSIDIAN_KEY) || "null"));
  } catch {
    return DEFAULT_OBSIDIAN_SETTINGS;
  }
}

function writeLocalSettings(settings: ObsidianConnectorSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_OBSIDIAN_KEY, JSON.stringify(settings));
}

export function buildObsidianNoteName(study: Study | null, fallbackPassage = "Bible Study") {
  return cleanPathSegment(study?.passage || fallbackPassage || "Bible Study") || "Bible Study";
}

export function buildObsidianStudyPath(settings: ObsidianConnectorSettings, study: Study | null, fallbackPassage = "Bible Study") {
  const folder = cleanFolder(settings.studyNoteFolder);
  const noteName = buildObsidianNoteName(study, fallbackPassage);
  return `${folder ? `${folder}/` : ""}${noteName}.md`;
}

export function buildObsidianUri(settings: ObsidianConnectorSettings, markdown: string, study: Study | null, fallbackPassage = "Bible Study") {
  const path = withoutMarkdownExtension(buildObsidianStudyPath(settings, study, fallbackPassage));
  const params = new URLSearchParams({
    vault: settings.vaultName.trim(),
    file: path,
    content: markdown
  });
  const uri = `obsidian://new?${params.toString()}`;
  return {
    uri,
    path: `${path}.md`,
    tooLarge: uri.length > MAX_OBSIDIAN_URI_LENGTH
  };
}

export async function loadObsidianSettings(ownerId: string) {
  const localSettings = readLocalSettings();
  const db = getFirebaseDb();
  if (!db || ownerId === "local") return localSettings;

  const snapshot = await getDoc(doc(db, "users", ownerId, "exports", "obsidian-settings"));
  if (!snapshot.exists()) return localSettings;
  const settings = withSettingsDefaults(snapshot.data() as Partial<ObsidianConnectorSettings>);
  writeLocalSettings(settings);
  return settings;
}

export async function saveObsidianSettings(ownerId: string, settings: ObsidianConnectorSettings) {
  const nextSettings = {
    ...withSettingsDefaults(settings),
    vaultName: settings.vaultName.trim(),
    studyNoteFolder: cleanFolder(settings.studyNoteFolder),
    bookHubFolder: cleanFolder(settings.bookHubFolder),
    contentHubFolder: cleanFolder(settings.contentHubFolder),
    bibleDatabaseFolder: cleanFolder(settings.bibleDatabaseFolder),
    updatedAt: new Date().toISOString()
  };
  writeLocalSettings(nextSettings);

  const db = getFirebaseDb();
  if (!db || ownerId === "local") return nextSettings;

  await setDoc(
    doc(db, "users", ownerId, "exports", "obsidian-settings"),
    {
      ...nextSettings,
      serverUpdatedAt: serverTimestamp()
    },
    { merge: true }
  );
  return nextSettings;
}
