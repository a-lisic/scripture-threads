"use client";

import {
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type Unsubscribe,
  type User
} from "firebase/auth";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_ADMIN_SETTINGS,
  isSuperAdminEmail,
  loadAdminSnapshot,
  saveAdminSettings,
  upsertUserProfile
} from "@/lib/admin";
import { exportDestinations } from "@/lib/exportDestinations";
import { getFirebaseAuth, googleProvider, isFirebaseConfigured } from "@/lib/firebase";
import { generateStudyDraft, getGenerationBackendStatus, type GenerationBackendStatus } from "@/lib/generationPipeline";
import { buildMarkdown, escapeHtml, extractPreamble, renderMarkdownPreview, wikilinkLabel } from "@/lib/markdown";
import {
  createMemoryEntry,
  deleteMemoryEntry,
  loadMemoryEntries,
  MAX_MEMORY_ENTRIES,
  saveMemoryEntry
} from "@/lib/memoryStore";
import {
  buildObsidianStudyPath,
  buildObsidianUri,
  DEFAULT_OBSIDIAN_SETTINGS,
  loadObsidianSettings,
  saveObsidianSettings
} from "@/lib/obsidianConnector";
import { generateStudy } from "@/lib/study";
import type { AdminSettings, AdminSnapshot, MemoryEntry, ObsidianConnectorSettings, Study } from "@/lib/types";

type TabId = "study" | "export" | "entities" | "memory" | "destinations" | "ai" | "admin";
type AiProviderId = "openai" | "anthropic";
type AiConnectionState = "not_started" | "checking" | "connected" | "error";
type AiServerStatus = {
  connected: boolean;
  provider?: AiProviderId;
  connectedAt?: string;
  lastVerifiedAt?: string;
};
type TranslationOption = {
  value: string;
  label: string;
  available: boolean;
};

const aiProviders: Record<
  AiProviderId,
  {
    label: string;
    keyHint: string;
    keyUrl: string;
    docsUrl: string;
    validateKey: (value: string) => boolean;
  }
> = {
  openai: {
    label: "OpenAI",
    keyHint: "Usually starts with sk-",
    keyUrl: "https://platform.openai.com/api-keys",
    docsUrl: "https://platform.openai.com/docs/quickstart",
    validateKey: (value) => /^sk-[A-Za-z0-9_-]{20,}$/.test(value.trim())
  },
  anthropic: {
    label: "Anthropic",
    keyHint: "Usually starts with sk-ant-",
    keyUrl: "https://console.anthropic.com/settings/keys",
    docsUrl: "https://docs.anthropic.com/en/docs/get-started",
    validateKey: (value) => /^sk-ant-[A-Za-z0-9_-]{20,}$/.test(value.trim())
  }
};

const localUser = {
  uid: "local",
  displayName: "Local Prototype",
  email: "local@scripture-threads"
};

const fallbackTranslationOptions: TranslationOption[] = [
  { value: "CSB", label: "CSB", available: false },
  { value: "NLT", label: "NLT", available: false }
];

function inlineNodeToMarkdown(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent || "";
  if (node.nodeType !== Node.ELEMENT_NODE) return "";
  const element = node as HTMLElement;
  const tag = element.tagName.toLowerCase();
  const inner = [...element.childNodes].map(inlineNodeToMarkdown).join("");
  if (element.classList.contains("wikilink-token")) return element.dataset.wikilink || `[[${inner}]]`;
  if (tag === "strong" || tag === "b") return `**${inner}**`;
  if (tag === "em" || tag === "i") return `*${inner}*`;
  if (tag === "br") return "\n";
  return inner;
}

function tableToMarkdown(table: HTMLTableElement) {
  const rows = [...table.querySelectorAll("tr")].map((row) =>
    [...row.children].map((cell) => inlineNodeToMarkdown(cell).trim())
  );
  if (!rows.length) return "";
  const divider = rows[0].map(() => "---");
  return [rows[0], divider, ...rows.slice(1)].map((row) => `| ${row.join(" | ")} |`).join("\n");
}

function editorBodyToMarkdown(editor: HTMLElement | null) {
  if (!editor) return "";
  const blocks: string[] = [];
  [...editor.childNodes].forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) blocks.push(text);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const htmlElement = node as HTMLElement;
    const tag = htmlElement.tagName.toLowerCase();
    const text = inlineNodeToMarkdown(htmlElement).trim();
    if (!text && tag !== "ul" && tag !== "table") return;
    if (tag === "h1") blocks.push(`# ${text}`);
    else if (tag === "h2") blocks.push(`## ${text}`);
    else if (tag === "h3") blocks.push(`### ${text}`);
    else if (tag === "ul") {
      blocks.push(
        [...htmlElement.querySelectorAll(":scope > li")]
          .map((li) => `- ${inlineNodeToMarkdown(li).trim()}`)
          .join("\n")
      );
    } else if (tag === "table") blocks.push(tableToMarkdown(htmlElement as HTMLTableElement));
    else blocks.push(text);
  });
  return `${blocks.join("\n\n").trim()}\n`;
}

function formatMemoryDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "saved draft";
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function Home() {
  const [passage, setPassage] = useState("2 Chronicles 19");
  const [translation, setTranslation] = useState("CSB");
  const [mode, setMode] = useState("Guided Deep Study");
  const [activeTab, setActiveTab] = useState<TabId>("study");
  const [study, setStudy] = useState<Study | null>(null);
  const [markdown, setMarkdown] = useState("");
  const [preamble, setPreamble] = useState("");
  const [memoryEntries, setMemoryEntries] = useState<MemoryEntry[]>([]);
  const [activeMemoryId, setActiveMemoryId] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [user, setUser] = useState<User | typeof localUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState("");
  const [generationStatus, setGenerationStatus] = useState<GenerationBackendStatus>(getGenerationBackendStatus());
  const [menuOpen, setMenuOpen] = useState<"copy" | "export" | null>(null);
  const [adminSnapshot, setAdminSnapshot] = useState<AdminSnapshot | null>(null);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(DEFAULT_ADMIN_SETTINGS);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminSaving, setAdminSaving] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [aiProvider, setAiProvider] = useState<AiProviderId>("openai");
  const [aiKeyDraft, setAiKeyDraft] = useState("");
  const [aiConnectionState, setAiConnectionState] = useState<AiConnectionState>("not_started");
  const [aiConnectionMessage, setAiConnectionMessage] = useState("Choose a provider to begin.");
  const [aiServerStatus, setAiServerStatus] = useState<AiServerStatus>({ connected: false });
  const [aiBusy, setAiBusy] = useState(false);
  const [translationOptions, setTranslationOptions] = useState<TranslationOption[]>(fallbackTranslationOptions);
  const [translationStatus, setTranslationStatus] = useState("Loading YouVersion translations...");
  const [obsidianSettings, setObsidianSettings] =
    useState<ObsidianConnectorSettings>(DEFAULT_OBSIDIAN_SETTINGS);
  const [obsidianSaving, setObsidianSaving] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const saveTimer = useRef<number | null>(null);

  const ownerId = user?.uid || "local";
  const firebaseConfigured = isFirebaseConfigured();
  const isSuperAdmin = firebaseConfigured && isSuperAdminEmail(user?.email);
  const previewHtml = useMemo(() => renderMarkdownPreview(markdown), [markdown]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  }

  async function authHeaders() {
    if (!user || user.uid === "local" || !("getIdToken" in user)) throw new Error("Sign in before connecting AI.");
    const token = await user.getIdToken();
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    };
  }

  function currentMarkdownFromEditor() {
    return `${preamble || ""}${editorBodyToMarkdown(editorRef.current)}`;
  }

  async function persistEntries(nextEntries: MemoryEntry[], entryToSave?: MemoryEntry) {
    setMemoryEntries(nextEntries);
    if (entryToSave) await saveMemoryEntry(entryToSave, nextEntries);
  }

  async function saveCurrentMemory() {
    if (!activeMemoryId || !study) return;
    const nextMarkdown = currentMarkdownFromEditor();
    const index = memoryEntries.findIndex((entry) => entry.id === activeMemoryId);
    if (index === -1) return;
    const updated: MemoryEntry = {
      ...memoryEntries[index],
      passage: study.passage,
      translation: study.translation,
      mode: study.mode,
      book: study.book,
      study,
      markdown: nextMarkdown,
      updatedAt: new Date().toISOString()
    };
    const nextEntries = [
      updated,
      ...memoryEntries.slice(0, index),
      ...memoryEntries.slice(index + 1)
    ].slice(0, MAX_MEMORY_ENTRIES);
    setMarkdown(nextMarkdown);
    await persistEntries(nextEntries, updated);
  }

  function scheduleMemorySave() {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      void saveCurrentMemory();
    }, 450);
  }

  function clearPendingMemorySave() {
    if (saveTimer.current) {
      window.clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
  }

  function clearWorkspaceState() {
    clearPendingMemorySave();
    setMemoryEntries([]);
    setActiveMemoryId(null);
    setStudy(null);
    setMarkdown("");
    setPreamble("");
    if (editorRef.current) editorRef.current.innerHTML = "";
  }

  function setEditableNote(nextMarkdown: string) {
    setPreamble(extractPreamble(nextMarkdown));
    if (editorRef.current) editorRef.current.innerHTML = renderMarkdownPreview(nextMarkdown);
  }

  async function rememberStudy(nextStudy: Study, nextMarkdown: string) {
    const entry = createMemoryEntry(ownerId, nextStudy, nextMarkdown);
    const nextEntries = [entry, ...memoryEntries.filter((item) => item.id !== entry.id)].slice(0, MAX_MEMORY_ENTRIES);
    setActiveMemoryId(entry.id);
    await persistEntries(nextEntries, entry);
  }

  async function loadMemoryEntry(id: string, notify = true) {
    clearPendingMemorySave();
    await saveCurrentMemory();
    const entry = memoryEntries.find((item) => item.id === id);
    if (!entry) return;
    setActiveMemoryId(entry.id);
    setStudy(entry.study);
    setMarkdown(entry.markdown);
    setPassage(entry.study.passage);
    setTranslation(entry.study.translation);
    setMode(entry.study.mode);
    setEditableNote(entry.markdown);
    if (notify) showToast(`${entry.passage} restored.`);
  }

  async function handleGenerate() {
    clearPendingMemorySave();
    await saveCurrentMemory();
    try {
      let nextStudy: Study;
      if (aiServerStatus.connected && firebaseConfigured && user?.uid !== "local") {
        const response = await fetch("/api/generate-study", {
          method: "POST",
          headers: await authHeaders(),
          body: JSON.stringify({ passage, translation, mode })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error || "Live generation failed.");
        nextStudy = data.study as Study;
        setGenerationStatus({
          mode: "server-ready",
          ready: true,
          missing: [],
          notes: [`Generated with connected ${data.provider === "anthropic" ? "Anthropic" : "OpenAI"} account.`]
        });
      } else {
        const result = await generateStudyDraft({ passage, translation, mode });
        nextStudy = result.study;
        setGenerationStatus(result.backendStatus);
      }

      const nextMarkdown = buildMarkdown(nextStudy);
      setStudy(nextStudy);
      setMarkdown(nextMarkdown);
      setEditableNote(nextMarkdown);
      await rememberStudy(nextStudy, nextMarkdown);
      showToast(aiServerStatus.connected ? "Live study generated." : "Study generated.");
      if (window.matchMedia("(max-width: 620px)").matches) {
        setActiveTab("study");
        window.setTimeout(() => document.querySelector(".workspace-panel")?.scrollIntoView({ behavior: "smooth" }), 50);
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Study generation failed.");
    }
  }

  async function handleDeleteMemory(entry: MemoryEntry) {
    const nextEntries = memoryEntries.filter((item) => item.id !== entry.id);
    await deleteMemoryEntry(entry, nextEntries);
    setMemoryEntries(nextEntries);
    if (activeMemoryId === entry.id) {
      const nextEntry = nextEntries[0];
      if (nextEntry) await loadMemoryEntry(nextEntry.id, false);
      else setActiveMemoryId(null);
    }
  }

  async function copyMarkdown() {
    try {
      const nextMarkdown = currentMarkdownFromEditor();
      setMarkdown(nextMarkdown);
      await navigator.clipboard.writeText(nextMarkdown);
      setMenuOpen(null);
      showToast("Markdown copied.");
    } catch {
      showToast("Copy failed. Try Download MD.");
    }
  }

  async function copyRichText() {
    const html = editorRef.current?.innerHTML || "";
    const plain = editorRef.current?.innerText.trim() || "";
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": new Blob([html], { type: "text/html" }),
            "text/plain": new Blob([plain], { type: "text/plain" })
          })
        ]);
      } else await navigator.clipboard.writeText(plain);
      setMenuOpen(null);
      showToast("Rich text copied.");
    } catch {
      showToast("Rich text copy failed.");
    }
  }

  async function copyPlainText() {
    try {
      await navigator.clipboard.writeText(editorRef.current?.innerText.trim() || "");
      setMenuOpen(null);
      showToast("Plain text copied.");
    } catch {
      showToast("Plain text copy failed.");
    }
  }

  function downloadMarkdown() {
    const nextMarkdown = currentMarkdownFromEditor();
    setMarkdown(nextMarkdown);
    const blob = new Blob([nextMarkdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slugify(study?.passage || "bible-study") || "bible-study"}-obsidian-export.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setMenuOpen(null);
    showToast("Markdown download started.");
  }

  function exportToObsidian() {
    const nextMarkdown = currentMarkdownFromEditor();
    setMarkdown(nextMarkdown);
    const exportLink = buildObsidianUri(obsidianSettings, nextMarkdown, study, passage);
    setMenuOpen(null);

    if (!obsidianSettings.vaultName.trim()) {
      showToast("Add your Obsidian vault name first.");
      setActiveTab("destinations");
      return;
    }

    if (exportLink.tooLarge || obsidianSettings.exportMethod === "markdown-download") {
      downloadMarkdown();
      if (exportLink.tooLarge) showToast("Note is large. Downloaded markdown instead.");
      return;
    }

    window.location.href = exportLink.uri;
    showToast("Opening Obsidian...");
  }

  async function handleSaveObsidianSettings() {
    setObsidianSaving(true);
    try {
      const nextSettings = await saveObsidianSettings(ownerId, obsidianSettings);
      setObsidianSettings(nextSettings);
      showToast("Obsidian settings saved.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Obsidian settings could not be saved.");
    } finally {
      setObsidianSaving(false);
    }
  }

  function exportPdf() {
    setMenuOpen(null);
    document.body.classList.add("printing-note");
    window.setTimeout(() => {
      window.print();
      window.setTimeout(() => document.body.classList.remove("printing-note"), 500);
    }, 50);
  }

  async function signIn() {
    setAuthError("");
    const auth = getFirebaseAuth();
    if (!auth) {
      setAuthError("Firebase is not configured yet. Add .env.local values, then restart the app.");
      return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
      if (code.includes("popup") || code === "auth/network-request-failed") {
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      setAuthError(error instanceof Error ? error.message : "Google sign-in failed.");
    }
  }

  async function signOutUser() {
    clearWorkspaceState();
    setAdminSnapshot(null);
    setAdminSettings(DEFAULT_ADMIN_SETTINGS);
    setAdminError("");
    setActiveTab("study");
    const auth = getFirebaseAuth();
    if (auth) await signOut(auth);
  }

  async function refreshAdminSnapshot() {
    if (!isSuperAdmin) return;
    setAdminLoading(true);
    setAdminError("");
    try {
      const snapshot = await loadAdminSnapshot();
      setAdminSnapshot(snapshot);
      setAdminSettings(snapshot.settings);
      showToast("Admin panel refreshed.");
    } catch (error) {
      setAdminError(error instanceof Error ? error.message : "Admin panel could not load.");
    } finally {
      setAdminLoading(false);
    }
  }

  async function handleSaveAdminSettings() {
    if (!isSuperAdmin || !user?.email) return;
    setAdminSaving(true);
    setAdminError("");
    try {
      await saveAdminSettings(adminSettings, user.email);
      setAdminSnapshot(await loadAdminSnapshot());
      showToast("Admin settings saved.");
    } catch (error) {
      setAdminError(error instanceof Error ? error.message : "Admin settings could not be saved.");
    } finally {
      setAdminSaving(false);
    }
  }

  function selectAiProvider(provider: AiProviderId) {
    setAiProvider(provider);
    setAiKeyDraft("");
    setAiConnectionState("not_started");
    setAiConnectionMessage(`${aiProviders[provider].label} selected. Create a key, then paste it here when you come back.`);
  }

  async function refreshAiStatus(showMessage = false) {
    if (!firebaseConfigured || !user || user.uid === "local") {
      setAiServerStatus({ connected: false });
      return;
    }

    try {
      const response = await fetch("/api/ai/status", { headers: await authHeaders() });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "AI status unavailable.");
      setAiServerStatus(data);
      if (data.connected) {
        setAiProvider(data.provider);
        setAiConnectionState("connected");
        setAiConnectionMessage(`${aiProviders[data.provider as AiProviderId].label} is connected and ready for live generation.`);
      } else {
        setAiConnectionState("not_started");
        setAiConnectionMessage("Choose a provider to begin.");
      }
      if (showMessage) showToast("AI status refreshed.");
    } catch (error) {
      setAiServerStatus({ connected: false });
      setAiConnectionState("error");
      setAiConnectionMessage(error instanceof Error ? error.message : "AI status unavailable.");
    }
  }

  async function loadYouVersionTranslations() {
    if (!firebaseConfigured || !user || user.uid === "local") {
      setTranslationOptions(fallbackTranslationOptions);
      setTranslationStatus("");
      return;
    }

    try {
      const response = await fetch("/api/youversion/translations", { headers: await authHeaders() });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Unable to load YouVersion translations.");

      const liveOptions: TranslationOption[] = (data.translations || []).map(
        (item: { value: string; label: string }) => ({
          value: item.value,
          label: item.label,
          available: true
        })
      );
      const liveValues = new Set(liveOptions.map((item) => item.value));
      const pinnedUnavailable = fallbackTranslationOptions.filter(
        (item) => [translation, adminSettings.defaultTranslation].includes(item.value) && !liveValues.has(item.value)
      );

      setTranslationOptions([...pinnedUnavailable, ...liveOptions]);
      setTranslationStatus("");
    } catch (error) {
      setTranslationOptions(fallbackTranslationOptions);
      setTranslationStatus("");
    }
  }

  async function connectAiProvider() {
    const provider = aiProviders[aiProvider];
    if (!provider.validateKey(aiKeyDraft)) {
      setAiConnectionState("error");
      setAiConnectionMessage(`That does not look like a valid ${provider.label} API key yet. ${provider.keyHint}.`);
      return;
    }

    setAiBusy(true);
    setAiConnectionState("checking");
    setAiConnectionMessage(`Verifying ${provider.label} and saving the encrypted connection...`);
    try {
      const response = await fetch("/api/ai/connect", {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify({ provider: aiProvider, apiKey: aiKeyDraft })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "AI connection failed.");
      setAiKeyDraft("");
      setAiServerStatus(data);
      setAiConnectionState("connected");
      setAiConnectionMessage(`${provider.label} is connected and ready for live generation.`);
      showToast(`${provider.label} connected.`);
    } catch (error) {
      setAiConnectionState("error");
      setAiConnectionMessage(error instanceof Error ? error.message : "AI connection failed.");
    } finally {
      setAiBusy(false);
    }
  }

  async function disconnectAiProvider() {
    setAiBusy(true);
    setAiConnectionMessage("Disconnecting AI provider...");
    try {
      const response = await fetch("/api/ai/disconnect", {
        method: "POST",
        headers: await authHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Disconnect failed.");
      setAiServerStatus({ connected: false });
      setAiConnectionState("not_started");
      setAiConnectionMessage("AI provider disconnected.");
      showToast("AI disconnected.");
    } catch (error) {
      setAiConnectionState("error");
      setAiConnectionMessage(error instanceof Error ? error.message : "Disconnect failed.");
    } finally {
      setAiBusy(false);
    }
  }

  function clearAiKeyDraft() {
    setAiKeyDraft("");
    setAiConnectionState("not_started");
    setAiConnectionMessage(`${aiProviders[aiProvider].label} key cleared from this browser session.`);
  }

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setUser(localUser);
      setAuthReady(true);
      return;
    }
    let canceled = false;
    let unsubscribe: Unsubscribe | null = null;

    void getRedirectResult(auth)
      .catch((error) => {
        if (!canceled) setAuthError(error instanceof Error ? error.message : "Google redirect sign-in failed.");
      })
      .finally(() => {
        if (canceled) return;
        unsubscribe = onAuthStateChanged(auth, (nextUser) => {
          if (!nextUser) clearWorkspaceState();
          else void upsertUserProfile(nextUser);
          setUser(nextUser);
          setAuthReady(true);
        });
      });

    return () => {
      canceled = true;
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    if (!authReady || !user) return;
    void refreshAiStatus();
    void loadYouVersionTranslations();
    void loadObsidianSettings(user.uid).then(setObsidianSettings).catch(() => setObsidianSettings(DEFAULT_OBSIDIAN_SETTINGS));
    void loadMemoryEntries(user.uid).then((entries) => {
      setMemoryEntries(entries);
      const firstEntry = entries[0];
      if (firstEntry) {
        setActiveMemoryId(firstEntry.id);
        setStudy(firstEntry.study);
        setMarkdown(firstEntry.markdown);
        setPassage(firstEntry.study.passage);
        setTranslation(firstEntry.study.translation);
        setMode(firstEntry.study.mode);
        window.setTimeout(() => setEditableNote(firstEntry.markdown), 0);
      } else {
        const nextStudy = generateStudy(passage, translation, mode);
        const nextMarkdown = buildMarkdown(nextStudy);
        setStudy(nextStudy);
        setMarkdown(nextMarkdown);
        window.setTimeout(() => setEditableNote(nextMarkdown), 0);
        void rememberStudy(nextStudy, nextMarkdown);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, user?.uid]);

  useEffect(() => {
    if (!isSuperAdmin) {
      setAdminSnapshot(null);
      setAdminSettings(DEFAULT_ADMIN_SETTINGS);
      if (activeTab === "admin") setActiveTab("study");
      return;
    }
    void refreshAdminSnapshot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuperAdmin, user?.uid]);

  const metadataRows = study
    ? [
        ["Passage", study.passage],
        ["Book", study.book],
        ["Translation", study.translation],
        ["Mode", study.mode],
        ["Source Profile", study.sourceProfile],
        ["Generation", study.generationStatus],
        ["Tags", study.tags.join(", ") || "none"],
        ["Themes", study.themes.length.toString()],
        ["Entities", study.entityLinks.length.toString()],
        ["Claims", study.claimLedger.length.toString()]
      ]
    : [];

  if (firebaseConfigured && (!authReady || !user)) {
    return (
      <main className="auth-gate" aria-label="Sign in">
        <section className="auth-card">
          <img className="auth-brand-image" src="/assets/scripture-threads-header.png" alt="Scripture Threads" />
          <p className="eyebrow">Trace. Study. Connect. Grow.</p>
          <h1>Scripture Threads</h1>
          <p className="auth-intro">
            Sign in to open your study workspace, save study memory, and keep your notes connected across devices.
          </p>
          <button type="button" className="primary-action auth-action" onClick={signIn} disabled={!authReady}>
            {authReady ? "Continue with Google" : "Checking sign-in..."}
          </button>
          {authError ? <p className="auth-error">{authError}</p> : null}
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <section className="control-panel" aria-label="Study setup">
        <div className="brand-block">
          <img className="brand-image" src="/assets/scripture-threads-header.png" alt="Scripture Threads" />
          <p className="eyebrow">Trace. Study. Connect. Grow.</p>
          <h1>Study Workspace</h1>
        </div>

        <section className="account-strip" aria-label="Account">
          <div>
            <span>{firebaseConfigured ? "Signed in" : "Local prototype"}</span>
            <strong>{user ? user.displayName || user.email : "Local Prototype"}</strong>
          </div>
          {isSuperAdmin ? <span className="admin-badge">Super admin</span> : null}
          {firebaseConfigured && user?.uid !== "local" ? (
            <button type="button" className="secondary-action compact-action" onClick={signOutUser}>
              Sign out
            </button>
          ) : null}
        </section>

        <form
          className="study-form"
          onSubmit={(event) => {
            event.preventDefault();
            void handleGenerate();
          }}
        >
          <label className="field">
            <span>Passage</span>
            <input value={passage} onChange={(event) => setPassage(event.target.value)} autoComplete="off" />
          </label>

          <div className="field-grid">
            <label className="field">
              <span>Translation</span>
              <select value={translation} onChange={(event) => setTranslation(event.target.value)}>
                {translationOptions.map((option) => (
                  <option value={option.value} key={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {translationStatus ? <small className="field-note">{translationStatus}</small> : null}
            </label>

            <label className="field">
              <span>Mode</span>
              <select value={mode} onChange={(event) => setMode(event.target.value)}>
                <option>Guided Deep Study</option>
                <option>Quick Read</option>
                <option>Teaching Prep</option>
                <option>Full Research</option>
              </select>
            </label>
          </div>

          <div className="button-row">
            <button type="submit" className="primary-action">
              Generate
            </button>
          </div>

          <div className="action-menus" aria-label="Copy and export actions">
            <div className="action-menu">
              <button
                type="button"
                className="secondary-action menu-trigger"
                aria-expanded={menuOpen === "copy"}
                onClick={() => setMenuOpen(menuOpen === "copy" ? null : "copy")}
              >
                Copy
              </button>
              <div className="menu-popover" hidden={menuOpen !== "copy"}>
                <button type="button" onClick={copyRichText}>
                  Rich Text
                </button>
                <button type="button" onClick={copyMarkdown}>
                  Markdown .md
                </button>
                <button type="button" onClick={copyPlainText}>
                  Plain Text
                </button>
              </div>
            </div>
            <div className="action-menu">
              <button
                type="button"
                className="secondary-action menu-trigger"
                aria-expanded={menuOpen === "export"}
                onClick={() => setMenuOpen(menuOpen === "export" ? null : "export")}
              >
                Export
              </button>
              <div className="menu-popover" hidden={menuOpen !== "export"}>
                <button type="button" onClick={exportToObsidian}>
                  Obsidian
                </button>
                <button type="button" onClick={downloadMarkdown}>
                  Markdown .md
                </button>
                <button type="button" onClick={exportPdf}>
                  PDF
                </button>
              </div>
            </div>
          </div>
        </form>

        <section className="metadata-panel" aria-label="Generated metadata">
          <h2>Metadata</h2>
          <dl>
            {metadataRows.map(([label, value]) => (
              <div className="metadata-row" key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </section>

      <section className="workspace-panel" aria-label="Generated study">
        <nav className="tabs" aria-label="Output views">
          {[
            ["study", "Study"],
            ["export", "Edit Note"],
            ["entities", "Entities"],
            ["memory", "Memory"],
            ["destinations", "Destinations"],
            ["ai", "AI"],
            ...(isSuperAdmin ? ([["admin", "Admin"]] as [string, string][]) : [])
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`tab-button ${activeTab === id ? "active" : ""}`}
              aria-selected={activeTab === id}
              onClick={() => setActiveTab(id as TabId)}
            >
              {label}
              {id === "memory" ? <span>{memoryEntries.length}</span> : null}
            </button>
          ))}
        </nav>

        <section id="studyTab" className={`tab-panel ${activeTab === "study" ? "active" : ""}`} aria-label="Study preview">
          <div className="markdown-preview" dangerouslySetInnerHTML={{ __html: previewHtml }} />
        </section>

        <section
          id="exportTab"
          className={`tab-panel ${activeTab === "export" ? "active" : ""}`}
          aria-label="Editable study note"
        >
          <p className="editor-note">Edit this like a normal note. Copy and download convert it to markdown.</p>
          <div
            ref={editorRef}
            className="note-editor markdown-preview"
            contentEditable
            suppressContentEditableWarning
            spellCheck
            onInput={() => {
              const nextMarkdown = currentMarkdownFromEditor();
              setMarkdown(nextMarkdown);
              scheduleMemorySave();
            }}
            onPaste={(event) => {
              event.preventDefault();
              const text = event.clipboardData.getData("text/plain");
              document.execCommand("insertText", false, text);
            }}
          />
        </section>

        <section
          id="entitiesTab"
          className={`tab-panel ${activeTab === "entities" ? "active" : ""}`}
          aria-label="Entity review"
        >
          {study ? (
            <div className="entity-layout">
              {[
                ["People", study.people, true],
                ["Places", study.places, true],
                ["Groups", study.groups, true],
                ["Story Context", study.storyContext, false],
                ["Event Threads", study.eventThreads, true]
              ].map(([label, items, copyWikilinks]) => (
                <section key={label as string}>
                  <h2>{label as string}</h2>
                  <ul className={copyWikilinks ? "link-list" : "plain-list"}>
                    {(items as string[]).length ? (
                      (items as string[]).map((item) => (
                        <li key={item}>
                          {copyWikilinks ? (
                            <button
                              type="button"
                              className="entity-chip"
                              title={`Copy ${item}`}
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(item);
                                  showToast(`${wikilinkLabel(item)} link copied.`);
                                } catch {
                                  showToast(item);
                                }
                              }}
                            >
                              {wikilinkLabel(item)}
                            </button>
                          ) : (
                            <span dangerouslySetInnerHTML={{ __html: escapeHtml(item) }} />
                          )}
                        </li>
                      ))
                    ) : (
                      <li>None suggested.</li>
                    )}
                  </ul>
                </section>
              ))}
              <section>
                <h2>Themes And Tags</h2>
                <div className="pill-group">
                  {study.themes.map((item) => (
                    <span className="pill theme" key={`theme-${item}`}>
                      theme: {item}
                    </span>
                  ))}
                  {study.tags.map((item) => (
                    <span className="pill tag" key={`tag-${item}`}>
                      tag: {item}
                    </span>
                  ))}
                </div>
              </section>
            </div>
          ) : null}
        </section>

        <section id="memoryTab" className={`tab-panel ${activeTab === "memory" ? "active" : ""}`} aria-label="Study memory">
          <div className="memory-header">
            <h2>Study Memory</h2>
            <p>Saved {firebaseConfigured && user?.uid !== "local" ? "to your account" : "in this browser"} until you export what you want to keep.</p>
          </div>
          <ul className="memory-list">
            {memoryEntries.length ? (
              memoryEntries.map((entry) => (
                <li key={entry.id}>
                  <button
                    type="button"
                    className={`memory-item ${entry.id === activeMemoryId ? "active" : ""}`}
                    onClick={() => void loadMemoryEntry(entry.id)}
                  >
                    <strong>{entry.passage}</strong>
                    <span>
                      {entry.translation} · {entry.mode} · {formatMemoryDate(entry.updatedAt)}
                    </span>
                  </button>
                  <button type="button" className="text-action" onClick={() => void handleDeleteMemory(entry)}>
                    Delete draft
                  </button>
                </li>
              ))
            ) : (
              <li className="memory-empty">No saved studies yet.</li>
            )}
          </ul>
        </section>

        <section
          id="destinationsTab"
          className={`tab-panel ${activeTab === "destinations" ? "active" : ""}`}
          aria-label="Export destinations"
        >
          <div className="memory-header">
            <h2>Export Destinations</h2>
            <p>Obsidian, Markdown, and PDF work now. Other destinations are staged so the data model will not assume one note app.</p>
          </div>
          <section className="connector-panel" aria-label="Obsidian connector settings">
            <div className="connector-heading">
              <div>
                <h3>Obsidian Connector</h3>
                <p>Send the edited markdown note into your vault using Obsidian's app link, or fall back to a markdown download.</p>
              </div>
              <span>{obsidianSettings.exportMethod === "obsidian-uri" ? "Open in Obsidian" : "Download .md"}</span>
            </div>

            <div className="connector-grid">
              <label className="field">
                <span>Vault Name</span>
                <input
                  value={obsidianSettings.vaultName}
                  onChange={(event) => setObsidianSettings({ ...obsidianSettings, vaultName: event.target.value })}
                  autoComplete="off"
                />
              </label>
              <label className="field">
                <span>Export Method</span>
                <select
                  value={obsidianSettings.exportMethod}
                  onChange={(event) =>
                    setObsidianSettings({
                      ...obsidianSettings,
                      exportMethod: event.target.value as ObsidianConnectorSettings["exportMethod"]
                    })
                  }
                >
                  <option value="obsidian-uri">Open in Obsidian</option>
                  <option value="markdown-download">Download Markdown</option>
                </select>
              </label>
              <label className="field connector-wide-field">
                <span>Study Note Folder</span>
                <input
                  value={obsidianSettings.studyNoteFolder}
                  onChange={(event) => setObsidianSettings({ ...obsidianSettings, studyNoteFolder: event.target.value })}
                  autoComplete="off"
                />
              </label>
              <label className="field connector-wide-field">
                <span>Book Hub Folder</span>
                <input
                  value={obsidianSettings.bookHubFolder}
                  onChange={(event) => setObsidianSettings({ ...obsidianSettings, bookHubFolder: event.target.value })}
                  autoComplete="off"
                />
              </label>
              <label className="field connector-wide-field">
                <span>Content Hub Folder</span>
                <input
                  value={obsidianSettings.contentHubFolder}
                  onChange={(event) => setObsidianSettings({ ...obsidianSettings, contentHubFolder: event.target.value })}
                  autoComplete="off"
                />
              </label>
              <label className="field connector-wide-field">
                <span>Bible Database Folder</span>
                <input
                  value={obsidianSettings.bibleDatabaseFolder}
                  onChange={(event) => setObsidianSettings({ ...obsidianSettings, bibleDatabaseFolder: event.target.value })}
                  autoComplete="off"
                />
              </label>
            </div>

            <div className="connector-preview">
              <span>Next Obsidian note</span>
              <code>{buildObsidianStudyPath(obsidianSettings, study, passage)}</code>
            </div>

            <div className="connector-actions">
              <button type="button" className="secondary-action" onClick={() => void handleSaveObsidianSettings()} disabled={obsidianSaving}>
                {obsidianSaving ? "Saving..." : "Save Settings"}
              </button>
              <button type="button" className="primary-action" onClick={exportToObsidian}>
                Export to Obsidian
              </button>
            </div>
          </section>
          <div className="destination-grid">
            {exportDestinations.map((destination) => (
              <article className="destination-card" key={destination.id}>
                <div>
                  <h3>{destination.label}</h3>
                  <span>{destination.status.replace("-", " ")}</span>
                </div>
                <p>{destination.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="aiTab" className={`tab-panel ${activeTab === "ai" ? "active" : ""}`} aria-label="AI connection">
          <div className="ai-panel">
            <div className="memory-header">
              <h2>Connect AI</h2>
              <p>
                Use your own OpenAI or Anthropic account to power study generation. Scripture Threads should guide the setup,
                verify the key, and save it encrypted once the backend connection route is added.
              </p>
            </div>

            <div className="ai-status-card">
              <div>
                <span>Connection Status</span>
                <strong>{aiConnectionState === "connected" ? "Connected" : aiConnectionState === "checking" ? "Checking" : "Not Connected"}</strong>
              </div>
              <p>{aiConnectionMessage}</p>
              {aiServerStatus.connected ? (
                <small>
                  {aiProviders[aiServerStatus.provider || aiProvider].label} · verified{" "}
                  {aiServerStatus.lastVerifiedAt ? formatMemoryDate(aiServerStatus.lastVerifiedAt) : "recently"}
                </small>
              ) : null}
            </div>

            <div className="ai-provider-grid">
              {(Object.keys(aiProviders) as AiProviderId[]).map((providerId) => {
                const provider = aiProviders[providerId];
                return (
                  <button
                    type="button"
                    key={providerId}
                    className={`ai-provider-card ${aiProvider === providerId ? "active" : ""}`}
                    onClick={() => selectAiProvider(providerId)}
                  >
                    <strong>{provider.label}</strong>
                    <span>{provider.keyHint}</span>
                  </button>
                );
              })}
            </div>

            <section className="ai-connection-section">
              <div className="ai-step-list">
                <article>
                  <span>1</span>
                  <div>
                    <h3>Create an API key</h3>
                    <p>
                      Open the official {aiProviders[aiProvider].label} page, create a key in your account, then copy it.
                    </p>
                    <div className="ai-action-row">
                      <a className="secondary-link-action" href={aiProviders[aiProvider].keyUrl} target="_blank" rel="noreferrer">
                        Open key page
                      </a>
                      <a className="text-link-action" href={aiProviders[aiProvider].docsUrl} target="_blank" rel="noreferrer">
                        Provider docs
                      </a>
                    </div>
                  </div>
                </article>
                <article>
                  <span>2</span>
                  <div>
                    <h3>Paste and check</h3>
                    <p>The key is sent to the secure server route for verification and encrypted storage. It is never displayed again.</p>
                    <label className="field">
                      <span>{aiProviders[aiProvider].label} API Key</span>
                      <input
                        type="password"
                        value={aiKeyDraft}
                        onChange={(event) => {
                          setAiKeyDraft(event.target.value);
                          setAiConnectionState("not_started");
                        }}
                        placeholder={aiProviders[aiProvider].keyHint}
                        autoComplete="off"
                        spellCheck={false}
                      />
                    </label>
                    <div className="ai-action-row">
                      <button type="button" className="primary-action compact-action" onClick={() => void connectAiProvider()} disabled={aiBusy}>
                        {aiBusy ? "Connecting..." : "Verify And Connect"}
                      </button>
                      <button type="button" className="secondary-action compact-action" onClick={clearAiKeyDraft}>
                        Clear
                      </button>
                      {aiServerStatus.connected ? (
                        <button type="button" className="secondary-action compact-action" onClick={() => void disconnectAiProvider()} disabled={aiBusy}>
                          Disconnect
                        </button>
                      ) : null}
                    </div>
                  </div>
                </article>
                <article>
                  <span>3</span>
                  <div>
                    <h3>Verify and connect</h3>
                    <p>
                      Once connected, the Generate button uses your encrypted provider connection for live study drafts.
                      You can disconnect or replace the key at any time.
                    </p>
                  </div>
                </article>
              </div>
            </section>
          </div>
        </section>

        {isSuperAdmin ? (
          <section id="adminTab" className={`tab-panel ${activeTab === "admin" ? "active" : ""}`} aria-label="Admin panel">
            <div className="admin-panel">
              <div className="admin-header">
                <div>
                  <h2>Admin Control Panel</h2>
                  <p>Manage platform status, feature flags, source posture, super admin access, and user visibility.</p>
                </div>
                <div className="admin-actions">
                  <button type="button" className="secondary-action compact-action" onClick={() => void refreshAdminSnapshot()}>
                    {adminLoading ? "Refreshing..." : "Refresh"}
                  </button>
                  <button type="button" className="primary-action compact-action" onClick={() => void handleSaveAdminSettings()}>
                    {adminSaving ? "Saving..." : "Save Settings"}
                  </button>
                </div>
              </div>

              <div className="admin-metrics">
                <article>
                  <span>Total users</span>
                  <strong>{adminSnapshot?.totalUsers ?? 0}</strong>
                </article>
                <article>
                  <span>Saved studies</span>
                  <strong>{adminSnapshot?.totalStudies ?? 0}</strong>
                </article>
                <article>
                  <span>Super admins</span>
                  <strong>{adminSnapshot?.superAdminEmails.length ?? 2}</strong>
                </article>
                <article>
                  <span>App status</span>
                  <strong>{adminSettings.appStatus.replace("_", " ")}</strong>
                </article>
              </div>

              {adminError ? <p className="admin-error">{adminError}</p> : null}

              <div className="admin-grid">
                <section className="admin-section">
                  <h3>Platform Settings</h3>
                  <div className="admin-form-grid">
                    <label className="field">
                      <span>App Status</span>
                      <select
                        value={adminSettings.appStatus}
                        onChange={(event) =>
                          setAdminSettings({ ...adminSettings, appStatus: event.target.value as AdminSettings["appStatus"] })
                        }
                      >
                        <option value="prototype">Prototype</option>
                        <option value="private_beta">Private beta</option>
                        <option value="live">Live</option>
                      </select>
                    </label>
                    <label className="field">
                      <span>Default Translation</span>
                      <select
                        value={adminSettings.defaultTranslation}
                        onChange={(event) =>
                          setAdminSettings({
                            ...adminSettings,
                            defaultTranslation: event.target.value
                          })
                        }
                      >
                        {translationOptions.map((option) => (
                          <option value={option.value} key={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <small className="field-note">{translationStatus}</small>
                    </label>
                    <label className="field admin-wide-field">
                      <span>Default Mode</span>
                      <select
                        value={adminSettings.defaultMode}
                        onChange={(event) =>
                          setAdminSettings({ ...adminSettings, defaultMode: event.target.value as AdminSettings["defaultMode"] })
                        }
                      >
                        <option>Quick Read</option>
                        <option>Guided Deep Study</option>
                        <option>Teaching Prep</option>
                        <option>Full Research</option>
                      </select>
                    </label>
                    <label className="field admin-wide-field">
                      <span>Maintenance Message</span>
                      <textarea
                        value={adminSettings.maintenanceMessage}
                        onChange={(event) => setAdminSettings({ ...adminSettings, maintenanceMessage: event.target.value })}
                        placeholder="Optional message for admins to track launch notes or temporary issues."
                      />
                    </label>
                  </div>
                </section>

                <section className="admin-section">
                  <h3>Feature Flags</h3>
                  <div className="admin-toggle-list">
                    {[
                      ["publicSignupEnabled", "Public signup", "Allow users outside the initial private group."],
                      ["aiGenerationEnabled", "AI generation", "Enable live AI-backed study generation once the backend exists."],
                      ["youVersionEnabled", "YouVersion", "Enable server-side YouVersion Bible text lookup."]
                    ].map(([key, label, description]) => (
                      <label className="admin-toggle" key={key}>
                        <input
                          type="checkbox"
                          checked={Boolean(adminSettings[key as keyof AdminSettings])}
                          onChange={(event) =>
                            setAdminSettings({
                              ...adminSettings,
                              [key]: event.target.checked
                            })
                          }
                        />
                        <span>
                          <strong>{label}</strong>
                          <small>{description}</small>
                        </span>
                      </label>
                    ))}
                  </div>
                </section>

                <section className="admin-section">
                  <h3>Source And Doctrine Posture</h3>
                  <label className="field">
                    <span>Source Profile</span>
                    <textarea
                      value={adminSettings.sourceProfile}
                      onChange={(event) => setAdminSettings({ ...adminSettings, sourceProfile: event.target.value })}
                    />
                  </label>
                  <div className="admin-status-list">
                    <div>
                      <strong>Bible API</strong>
                      <span>YouVersion REST adapter is built and key-tested; live app use needs a server route so the key stays private.</span>
                    </div>
                    <div>
                      <strong>Generation Backend</strong>
                      <span>Not connected. Static Firebase Hosting is key-safe but cannot run private AI or Bible API calls by itself.</span>
                    </div>
                    <div>
                      <strong>Claim Discipline</strong>
                      <span>Claim ledger and source records are in the study data model.</span>
                    </div>
                  </div>
                </section>

                <section className="admin-section">
                  <h3>Super Admin Accounts</h3>
                  <ul className="plain-list">
                    {(adminSnapshot?.superAdminEmails || ["alexlisic@gmail.com", "bethlisic@gmail.com"]).map((email) => (
                      <li key={email}>{email}</li>
                    ))}
                  </ul>
                </section>
              </div>

              <section className="admin-section">
                <h3>Users</h3>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Role</th>
                        <th>Studies</th>
                        <th>Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminSnapshot?.users.length ? (
                        adminSnapshot.users.map((item) => (
                          <tr key={item.uid}>
                            <td>
                              <strong>{item.displayName}</strong>
                              <span>{item.email || item.uid}</span>
                            </td>
                            <td>{item.role.replace("_", " ")}</td>
                            <td>{item.studyCount}</td>
                            <td>{item.updatedAt ? formatMemoryDate(item.updatedAt) : "unknown"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4}>{adminLoading ? "Loading users..." : "No user profiles found yet."}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="admin-section">
                <h3>Admin Activity</h3>
                <div className="admin-activity-list">
                  {adminSnapshot?.activity.length ? (
                    adminSnapshot.activity.map((item) => (
                      <article key={item.id}>
                        <strong>{item.action.replace("_", " ")}</strong>
                        <span>
                          {item.actorEmail} · {item.createdAt ? formatMemoryDate(item.createdAt) : "unknown"}
                        </span>
                        <p>{item.detail}</p>
                      </article>
                    ))
                  ) : (
                    <p>No admin activity logged yet.</p>
                  )}
                </div>
              </section>
            </div>
          </section>
        ) : null}
      </section>

      <div className={`toast ${toast ? "visible" : ""}`} role="status" aria-live="polite">
        {toast}
      </div>
    </main>
  );
}
