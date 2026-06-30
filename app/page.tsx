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
import { exportDestinations } from "@/lib/exportDestinations";
import { getFirebaseAuth, googleProvider, isFirebaseConfigured } from "@/lib/firebase";
import { buildMarkdown, escapeHtml, extractPreamble, renderMarkdownPreview, wikilinkLabel } from "@/lib/markdown";
import {
  createMemoryEntry,
  deleteMemoryEntry,
  loadMemoryEntries,
  MAX_MEMORY_ENTRIES,
  saveMemoryEntry
} from "@/lib/memoryStore";
import { generateStudy } from "@/lib/study";
import type { MemoryEntry, Study } from "@/lib/types";

type TabId = "study" | "export" | "entities" | "memory" | "destinations";

const localUser = {
  uid: "local",
  displayName: "Local Prototype",
  email: "local@scripture-threads"
};

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
  const [menuOpen, setMenuOpen] = useState<"copy" | "export" | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const saveTimer = useRef<number | null>(null);

  const ownerId = user?.uid || "local";
  const firebaseConfigured = isFirebaseConfigured();
  const previewHtml = useMemo(() => renderMarkdownPreview(markdown), [markdown]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
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
    const nextStudy = generateStudy(passage, translation, mode);
    const nextMarkdown = buildMarkdown(nextStudy);
    setStudy(nextStudy);
    setMarkdown(nextMarkdown);
    setEditableNote(nextMarkdown);
    await rememberStudy(nextStudy, nextMarkdown);
    showToast("Study generated.");
    if (window.matchMedia("(max-width: 620px)").matches) {
      setActiveTab("study");
      window.setTimeout(() => document.querySelector(".workspace-panel")?.scrollIntoView({ behavior: "smooth" }), 50);
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
      showToast("Rich text copied.");
    } catch {
      showToast("Rich text copy failed.");
    }
  }

  async function copyPlainText() {
    try {
      await navigator.clipboard.writeText(editorRef.current?.innerText.trim() || "");
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
    showToast("Markdown download started.");
  }

  function exportPdf() {
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
    const auth = getFirebaseAuth();
    if (auth) await signOut(auth);
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

  const metadataRows = study
    ? [
        ["Passage", study.passage],
        ["Book", study.book],
        ["Translation", study.translation],
        ["Mode", study.mode],
        ["Tags", study.tags.join(", ") || "none"],
        ["Themes", study.themes.length.toString()],
        ["Entities", study.entityLinks.length.toString()]
      ]
    : [];

  return (
    <main className="app-shell">
      <section className="control-panel" aria-label="Study setup">
        <div className="brand-block">
          <img className="brand-image" src="/assets/scripture-threads-header.png" alt="Scripture Threads" />
          <p className="eyebrow">Trace. Study. Connect. Grow.</p>
          <h1>Study Workspace</h1>
        </div>

        <section className="auth-panel" aria-label="Account">
          <div>
            <strong>{user ? user.displayName || user.email : "Not signed in"}</strong>
            <span>{firebaseConfigured ? "Firebase Auth" : "Local prototype mode"}</span>
          </div>
          {!firebaseConfigured ? (
            <button type="button" className="secondary-action compact-action" disabled>
              Firebase setup needed
            </button>
          ) : user && user.uid !== "local" ? (
            <button type="button" className="secondary-action compact-action" onClick={signOutUser}>
              Sign out
            </button>
          ) : (
            <button type="button" className="secondary-action compact-action" onClick={signIn}>
              Google sign in
            </button>
          )}
          {authError ? <p>{authError}</p> : null}
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
                <option value="CSB">CSB</option>
                <option value="NLT">NLT</option>
              </select>
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
            ["destinations", "Destinations"]
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
            <p>Markdown and PDF work now. Other destinations are staged so the data model will not assume Obsidian is the only future path.</p>
          </div>
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
      </section>

      <div className={`toast ${toast ? "visible" : ""}`} role="status" aria-live="polite">
        {toast}
      </div>
    </main>
  );
}
