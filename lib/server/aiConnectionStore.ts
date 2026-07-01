import "server-only";

import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "./firebaseAdmin";
import { decryptSecret, encryptSecret } from "./crypto";
import type { AiProviderId } from "./aiProviders";

export type StoredAiConnection = {
  provider: AiProviderId;
  encryptedKey: string;
  connectedAt: string;
  lastVerifiedAt: string;
  status: "connected";
};

function connectionRef(uid: string) {
  return adminDb().doc(`users/${uid}/private/aiConnection`);
}

export async function readAiConnection(uid: string) {
  const snapshot = await connectionRef(uid).get();
  if (!snapshot.exists) return null;
  return snapshot.data() as StoredAiConnection;
}

export async function readAiConnectionStatus(uid: string) {
  const connection = await readAiConnection(uid);
  if (!connection) return { connected: false as const };
  return {
    connected: true as const,
    provider: connection.provider,
    connectedAt: connection.connectedAt,
    lastVerifiedAt: connection.lastVerifiedAt
  };
}

export async function saveAiConnection(uid: string, provider: AiProviderId, apiKey: string) {
  const now = new Date().toISOString();
  const payload: StoredAiConnection = {
    provider,
    encryptedKey: encryptSecret(apiKey),
    connectedAt: now,
    lastVerifiedAt: now,
    status: "connected"
  };
  await connectionRef(uid).set({ ...payload, serverUpdatedAt: FieldValue.serverTimestamp() }, { merge: true });
  return readAiConnectionStatus(uid);
}

export async function deleteAiConnection(uid: string) {
  await connectionRef(uid).delete();
}

export async function getDecryptedAiConnection(uid: string) {
  const connection = await readAiConnection(uid);
  if (!connection) return null;
  return {
    provider: connection.provider,
    apiKey: decryptSecret(connection.encryptedKey)
  };
}
