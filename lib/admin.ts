"use client";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import type { AdminActivityLog, AdminSettings, AdminSnapshot, AdminUserSummary } from "./types";

export const SUPER_ADMIN_EMAILS = ["alexlisic@gmail.com", "bethlisic@gmail.com"];

export function normalizeEmail(email?: string | null) {
  return (email || "").trim().toLowerCase();
}

export function isSuperAdminEmail(email?: string | null) {
  return SUPER_ADMIN_EMAILS.includes(normalizeEmail(email));
}

export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  appStatus: "prototype",
  defaultTranslation: "CSB",
  defaultMode: "Guided Deep Study",
  sourceProfile: "Scripture-first evangelical, non-denominational, continuationist-friendly",
  publicSignupEnabled: false,
  aiGenerationEnabled: false,
  youVersionEnabled: false,
  maintenanceMessage: ""
};

function normalizeSettings(data?: Partial<AdminSettings>): AdminSettings {
  return {
    ...DEFAULT_ADMIN_SETTINGS,
    ...data,
    appStatus: data?.appStatus || DEFAULT_ADMIN_SETTINGS.appStatus,
    defaultTranslation: data?.defaultTranslation || DEFAULT_ADMIN_SETTINGS.defaultTranslation,
    defaultMode: data?.defaultMode || DEFAULT_ADMIN_SETTINGS.defaultMode,
    sourceProfile: data?.sourceProfile || DEFAULT_ADMIN_SETTINGS.sourceProfile,
    maintenanceMessage: data?.maintenanceMessage || ""
  };
}

export async function upsertUserProfile(user: {
  uid: string;
  email?: string | null;
  displayName?: string | null;
}) {
  const db = getFirebaseDb();
  if (!db || user.uid === "local") return;

  const email = normalizeEmail(user.email);
  await setDoc(
    doc(db, "users", user.uid),
    {
      uid: user.uid,
      email,
      displayName: user.displayName || email || "Unknown user",
      role: isSuperAdminEmail(email) ? "super_admin" : "user",
      updatedAt: new Date().toISOString(),
      serverUpdatedAt: serverTimestamp()
    },
    { merge: true }
  );
}

async function loadAdminSettings(): Promise<AdminSettings> {
  const db = getFirebaseDb();
  if (!db) return DEFAULT_ADMIN_SETTINGS;
  const snapshot = await getDoc(doc(db, "admin", "settings"));
  return snapshot.exists() ? normalizeSettings(snapshot.data() as Partial<AdminSettings>) : DEFAULT_ADMIN_SETTINGS;
}

async function loadAdminActivity(): Promise<AdminActivityLog[]> {
  const db = getFirebaseDb();
  if (!db) return [];
  const snapshot = await getDocs(query(collection(db, "adminActivity"), orderBy("createdAt", "desc"), limit(12)));
  return snapshot.docs.map((item) => {
    const data = item.data();
    return {
      id: item.id,
      action: typeof data.action === "string" ? data.action : "admin_action",
      actorEmail: typeof data.actorEmail === "string" ? data.actorEmail : "unknown",
      createdAt: typeof data.createdAt === "string" ? data.createdAt : "",
      detail: typeof data.detail === "string" ? data.detail : ""
    };
  });
}

export async function saveAdminSettings(settings: AdminSettings, actorEmail: string) {
  const db = getFirebaseDb();
  if (!db) return;
  const now = new Date().toISOString();
  const nextSettings = {
    ...normalizeSettings(settings),
    updatedAt: now,
    updatedBy: normalizeEmail(actorEmail)
  };
  await setDoc(
    doc(db, "admin", "settings"),
    {
      ...nextSettings,
      serverUpdatedAt: serverTimestamp()
    },
    { merge: true }
  );
  await setDoc(doc(collection(db, "adminActivity")), {
    action: "settings_updated",
    actorEmail: normalizeEmail(actorEmail),
    createdAt: now,
    detail: "Updated admin platform settings.",
    serverCreatedAt: serverTimestamp()
  });
}

export async function loadAdminSnapshot(): Promise<AdminSnapshot> {
  const db = getFirebaseDb();
  if (!db) {
    return {
      superAdminEmails: SUPER_ADMIN_EMAILS,
      users: [],
      settings: DEFAULT_ADMIN_SETTINGS,
      activity: [],
      totalUsers: 0,
      totalStudies: 0,
      loadedAt: new Date().toISOString()
    };
  }

  const usersSnapshot = await getDocs(collection(db, "users"));
  const users = await Promise.all(
    usersSnapshot.docs.map(async (userDoc): Promise<AdminUserSummary> => {
      const data = userDoc.data();
      const studiesSnapshot = await getDocs(collection(db, "users", userDoc.id, "studies"));
      const email = normalizeEmail(typeof data.email === "string" ? data.email : "");
      return {
        uid: userDoc.id,
        email,
        displayName:
          typeof data.displayName === "string" && data.displayName.trim()
            ? data.displayName
            : email || "Unknown user",
        role: isSuperAdminEmail(email) ? "super_admin" : "user",
        updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : undefined,
        studyCount: studiesSnapshot.size
      };
    })
  );

  const sortedUsers = users.sort((a, b) => {
    if (a.role !== b.role) return a.role === "super_admin" ? -1 : 1;
    return a.email.localeCompare(b.email);
  });
  const [settings, activity] = await Promise.all([loadAdminSettings(), loadAdminActivity()]);

  return {
    superAdminEmails: SUPER_ADMIN_EMAILS,
    users: sortedUsers,
    settings,
    activity,
    totalUsers: sortedUsers.length,
    totalStudies: sortedUsers.reduce((sum, item) => sum + item.studyCount, 0),
    loadedAt: new Date().toISOString()
  };
}
