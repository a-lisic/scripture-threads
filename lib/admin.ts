"use client";

import { collection, doc, getDocs, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import type { AdminSnapshot, AdminUserSummary } from "./types";

export const SUPER_ADMIN_EMAILS = ["alexlisic@gmail.com", "bethlisic@gmail.com"];

export function normalizeEmail(email?: string | null) {
  return (email || "").trim().toLowerCase();
}

export function isSuperAdminEmail(email?: string | null) {
  return SUPER_ADMIN_EMAILS.includes(normalizeEmail(email));
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

export async function loadAdminSnapshot(): Promise<AdminSnapshot> {
  const db = getFirebaseDb();
  if (!db) {
    return {
      superAdminEmails: SUPER_ADMIN_EMAILS,
      users: [],
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

  return {
    superAdminEmails: SUPER_ADMIN_EMAILS,
    users: sortedUsers,
    totalUsers: sortedUsers.length,
    totalStudies: sortedUsers.reduce((sum, item) => sum + item.studyCount, 0),
    loadedAt: new Date().toISOString()
  };
}
