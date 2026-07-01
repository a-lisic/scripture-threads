"use client";

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import type { MemoryEntry, Study } from "./types";

const LOCAL_MEMORY_KEY = "scriptureThreads.studyMemory.v2";
export const MAX_MEMORY_ENTRIES = 25;

function createMemoryId() {
  return `study-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toFirestoreMemoryEntry(entry: MemoryEntry) {
  const { study, ...rest } = entry;
  return {
    ...rest,
    studyJson: JSON.stringify(study)
  };
}

function fromFirestoreMemoryEntry(data: Record<string, unknown>): MemoryEntry | null {
  let study = data.study;
  if (typeof data.studyJson === "string") {
    try {
      study = JSON.parse(data.studyJson) as Study;
    } catch {
      return null;
    }
  }
  if (!study || typeof study !== "object") return null;
  const { studyJson: _studyJson, ...rest } = data;
  return {
    ...(rest as Omit<MemoryEntry, "study">),
    study: study as Study
  };
}

export function createMemoryEntry(ownerId: string, study: Study, markdown: string): MemoryEntry {
  const now = new Date().toISOString();
  return {
    id: createMemoryId(),
    ownerId,
    passage: study.passage,
    translation: study.translation,
    mode: study.mode,
    book: study.book,
    status: "draft",
    createdAt: now,
    updatedAt: now,
    study,
    markdown
  };
}

export function readLocalMemory(ownerId: string): MemoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(LOCAL_MEMORY_KEY) || "[]") as MemoryEntry[];
    return Array.isArray(parsed)
      ? parsed.filter((entry) => entry.ownerId === ownerId && entry.markdown && entry.study).slice(0, MAX_MEMORY_ENTRIES)
      : [];
  } catch {
    return [];
  }
}

export function writeLocalMemory(entries: MemoryEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_MEMORY_KEY, JSON.stringify(entries.slice(0, MAX_MEMORY_ENTRIES)));
}

export async function loadMemoryEntries(ownerId: string) {
  const db = getFirebaseDb();
  if (!db || ownerId === "local") return readLocalMemory(ownerId);

  const studiesRef = collection(db, "users", ownerId, "studies");
  const snapshot = await getDocs(query(studiesRef, orderBy("updatedAt", "desc"), limit(MAX_MEMORY_ENTRIES)));
  return snapshot.docs
    .map((item) => fromFirestoreMemoryEntry(item.data()))
    .filter((entry): entry is MemoryEntry => Boolean(entry));
}

export async function saveMemoryEntry(entry: MemoryEntry, allLocalEntries: MemoryEntry[]) {
  const db = getFirebaseDb();
  if (!db || entry.ownerId === "local") {
    writeLocalMemory(allLocalEntries);
    return;
  }

  await setDoc(
    doc(db, "users", entry.ownerId, "studies", entry.id),
    {
      ...toFirestoreMemoryEntry(entry),
      updatedAt: entry.updatedAt,
      serverUpdatedAt: serverTimestamp()
    },
    { merge: true }
  );
}

export async function deleteMemoryEntry(entry: MemoryEntry, remainingEntries: MemoryEntry[]) {
  const db = getFirebaseDb();
  if (!db || entry.ownerId === "local") {
    writeLocalMemory(remainingEntries);
    return;
  }

  await deleteDoc(doc(db, "users", entry.ownerId, "studies", entry.id));
}
