const fixture = {
  passage: "2 Chronicles 19",
  translation: "CSB",
  mode: "Guided Deep Study",
  book: "2 Chronicles",
  bookLinks: ["[[2 Chronicles]]"],
  people: ["[[Jehoshaphat]]", "[[Ahab]]", "[[Jehu son of Hanani]]"],
  places: ["[[Jerusalem]]", "[[Ramoth-gilead]]"],
  groups: ["[[Judah]]"],
  storyContext: ["Battle at Ramoth-gilead"],
  eventThreads: [],
  entityLinks: [
    "[[Jehoshaphat]]",
    "[[Ahab]]",
    "[[Judah]]",
    "[[Jerusalem]]",
    "[[Ramoth-gilead]]",
    "[[Jehu son of Hanani]]"
  ],
  themes: [
    "correction",
    "compromise",
    "repentance",
    "judicial reform",
    "impartiality",
    "leadership",
    "justice",
    "courage"
  ],
  tags: ["repentance", "leadership", "justice", "courage"],
  sources: ["Scripture", "Enduring Word"],
  bigIdea:
    "2 Chronicles 19 shows Jehoshaphat receiving correction after compromise, then responding by leading Judah back toward the Lord and establishing justice under God's authority.",
  context: [
    "2 Chronicles 17 presents Jehoshaphat as a king who strengthened Judah and sought the Lord. In 2 Chronicles 18, he allies himself with Ahab, joins him in battle, and nearly dies despite Micaiah's prophetic warning. Chapter 19 begins after that failure: Jehoshaphat returns safely, but not without correction.",
    "The chapter moves from personal correction to public reform. Jehoshaphat receives rebuke, returns to leading the people toward the Lord, and appoints judges who must act with reverence, integrity, and courage."
  ],
  passageMap: [
    ["2 Chronicles 19:1", "Jehoshaphat returns safely", "Mercy after foolish compromise"],
    ["2 Chronicles 19:2-3", "Jehu rebukes and encourages him", "God corrects compromise without ignoring what is good"],
    ["2 Chronicles 19:4", "Jehoshaphat leads the people back", "Correction should produce renewed obedience"],
    ["2 Chronicles 19:5-7", "Judges appointed in Judah", "Human authority must answer to God's authority"],
    ["2 Chronicles 19:8-11", "Jerusalem court established", "Justice requires faithfulness, courage, and holy fear"]
  ],
  verseNotes: [
    {
      reference: "2 Chronicles 19:1",
      note:
        "Jehoshaphat returns safely to Jerusalem after the battle where Ahab was killed. His safety should be read as mercy, not approval of his alliance. God spared him, but the next verses show that his compromise still needed correction.",
      details: [
        "Context: 2 Chronicles 18:31 shows Jehoshaphat crying out and the Lord helping him in the previous chapter.",
        "Application: Safety after a bad decision should not be mistaken for God's endorsement."
      ],
      keep: "Mercy after compromise is not approval; it is an invitation to return."
    },
    {
      reference: "2 Chronicles 19:2-3",
      note:
        "Jehu confronts Jehoshaphat for helping the wicked and loving those who hate the Lord. The correction is direct, but it is not flattening. Jehu also names what is good in Jehoshaphat: he removed Asherah poles and set his heart to seek God.",
      details: [
        "Cross reference: Psalm 97:10 supports Jehu's rebuke by connecting love for the Lord with rejecting evil.",
        "Context: Jehu is the son of Hanani, who previously confronted Asa in 2 Chronicles 16:7-9.",
        "Application: Faithful correction can name what is wrong without erasing what God is still doing."
      ],
      keep:
        "Faithful correction tells the truth about compromise without erasing the evidence of grace."
    },
    {
      reference: "2 Chronicles 19:4",
      note:
        "Jehoshaphat does not only feel regret. He moves toward renewed obedience by going among the people and bringing them back to the Lord. The fruit of received correction is movement, not paralysis.",
      details: [
        "Context: This echoes Jehoshaphat's earlier teaching and reform work in 2 Chronicles 17:7-9.",
        "Application: Conviction is meant to move toward return and repair, not self-protection or self-punishment."
      ],
      keep: "Conviction is meant to move us toward obedience, not trap us in shame."
    },
    {
      reference: "2 Chronicles 19:5-7",
      note:
        "Jehoshaphat appoints judges throughout Judah and reminds them that they judge for the Lord, not merely for people. This echoes Deuteronomy's concern for justice without partiality or bribery.",
      details: [
        "Cross reference: Deuteronomy 16:18-20 gives the Torah background for appointing judges and pursuing justice without partiality.",
        "Application: Spiritual renewal should shape how responsibility, fairness, and authority are handled."
      ],
      keep: "When authority is received as stewardship before God, integrity becomes worship."
    },
    {
      reference: "2 Chronicles 19:8-11",
      note:
        "The Jerusalem court is charged to act in the fear of the Lord, with faithfulness and wholeheartedness. The final call to courage shows that justice requires more than structure; it requires holy fear, clear warning, and confidence in God's presence.",
      details: [
        "Cross reference: Psalm 82 shows God as the ultimate judge over earthly judges.",
        "Application: Doing what is right often requires courage because justice is not always convenient, popular, or personally beneficial."
      ],
      keep:
        "Faithfulness is not only knowing what is right; it is doing what is right with courage before God."
    }
  ],
  crossReferences: [
    ["2 Chronicles 18:31", "shows the immediate mercy behind Jehoshaphat's safe return."],
    [
      "Deuteronomy 16:18-20",
      "gives the Torah background for appointing judges and pursuing justice without partiality."
    ],
    ["Psalm 82", "shows God as the ultimate judge over earthly judges."],
    ["Psalm 97:10", "supports Jehu's rebuke about loving the Lord and rejecting evil."]
  ],
  questions: [
    "How does Jehoshaphat's response to correction compare with other kings in Chronicles?",
    "What does this chapter teach about the relationship between private devotion and public responsibility?",
    "Where does Scripture draw the line between loving people and forming compromising alliances?"
  ],
  application: [
    "Where might I be mistaking God's mercy for approval instead of an invitation to return?",
    "What responsibility has God given me that needs to be handled more consciously before Him?",
    "Where am I tempted toward partiality, people-pleasing, or avoiding hard truth?",
    "What would courageous faithfulness look like in one decision today?"
  ],
  sourceNotes: [
    "Scripture references: 2 Chronicles 17-19; Deuteronomy 16:18-20; Psalm 82; Psalm 97:10.",
    "Commentary test source: David Guzik, Enduring Word commentary on 2 Chronicles 19.",
    "Citation caution: commentary should be cited and quoted sparingly. Bible translation text should be handled according to each translation's permissions."
  ]
};

const state = {
  currentStudy: null,
  currentExport: "",
  currentPreamble: "",
  userNotes: [],
  memoryEntries: [],
  activeMemoryId: null,
  saveTimer: null
};

const MEMORY_KEY = "scriptureThreads.studyMemory.v1";
const MAX_MEMORY_ENTRIES = 15;

const form = document.querySelector("#studyForm");
const passageInput = document.querySelector("#passageInput");
const translationInput = document.querySelector("#translationInput");
const modeInput = document.querySelector("#modeInput");
const studyPreview = document.querySelector("#studyPreview");
const noteEditor = document.querySelector("#noteEditor");
const metadataList = document.querySelector("#metadataList");
const copyMenuButton = document.querySelector("#copyMenuButton");
const exportMenuButton = document.querySelector("#exportMenuButton");
const copyMenu = document.querySelector("#copyMenu");
const exportMenu = document.querySelector("#exportMenu");
const copyRichTextButton = document.querySelector("#copyRichTextButton");
const copyMarkdownButton = document.querySelector("#copyMarkdownButton");
const copyPlainTextButton = document.querySelector("#copyPlainTextButton");
const downloadMarkdownButton = document.querySelector("#downloadMarkdownButton");
const exportPdfButton = document.querySelector("#exportPdfButton");
const memoryList = document.querySelector("#memoryList");
const memoryCount = document.querySelector("#memoryCount");
const toast = document.querySelector("#toast");

function normalizePassage(value) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function getBookName(passage) {
  const cleaned = passage.trim().replace(/\s+/g, " ");
  const match = cleaned.match(/^((?:[1-3]\s+)?[A-Za-z]+(?:\s+[A-Za-z]+)*?)(?:\s+\d|$)/);
  return match ? match[1] : cleaned || "Unknown Book";
}

function yamlList(values) {
  if (!values.length) return "[]";
  return values.map((value) => `  - "${value}"`).join("\n");
}

function yamlField(name, values) {
  return values.length ? `${name}:\n${yamlList(values)}` : `${name}: []`;
}

function simpleList(items) {
  return items.map((item) => `- ${item}`).join("\n");
}

function detailList(details = []) {
  if (!details.length) return "";
  return `\n\n${details.map((detail) => `- ${detail}`).join("\n")}`;
}

function createMemoryId() {
  return `study-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readMemoryEntries() {
  try {
    const parsed = JSON.parse(localStorage.getItem(MEMORY_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((entry) => entry.markdown && entry.study) : [];
  } catch {
    return [];
  }
}

function persistMemoryEntries() {
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(state.memoryEntries.slice(0, MAX_MEMORY_ENTRIES)));
  } catch {
    showToast("Study memory could not be saved.");
  }
}

function formatMemoryDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "saved draft";
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function rememberStudy(study, markdown) {
  const now = new Date().toISOString();
  const entry = {
    id: createMemoryId(),
    passage: study.passage,
    translation: study.translation,
    mode: study.mode,
    book: study.book,
    createdAt: now,
    updatedAt: now,
    study,
    markdown
  };
  state.memoryEntries = [entry, ...state.memoryEntries.filter((item) => item.id !== entry.id)].slice(
    0,
    MAX_MEMORY_ENTRIES
  );
  state.activeMemoryId = entry.id;
  persistMemoryEntries();
  renderMemoryList();
}

function saveCurrentMemory() {
  if (!state.activeMemoryId || !state.currentStudy) return;
  const markdown = currentMarkdownFromEditor();
  const index = state.memoryEntries.findIndex((entry) => entry.id === state.activeMemoryId);
  if (index === -1) return;
  const updated = {
    ...state.memoryEntries[index],
    passage: state.currentStudy.passage,
    translation: state.currentStudy.translation,
    mode: state.currentStudy.mode,
    book: state.currentStudy.book,
    updatedAt: new Date().toISOString(),
    study: state.currentStudy,
    markdown
  };
  state.memoryEntries = [
    updated,
    ...state.memoryEntries.slice(0, index),
    ...state.memoryEntries.slice(index + 1)
  ].slice(0, MAX_MEMORY_ENTRIES);
  state.currentExport = markdown;
  persistMemoryEntries();
  renderMemoryList();
}

function scheduleMemorySave() {
  window.clearTimeout(state.saveTimer);
  state.saveTimer = window.setTimeout(saveCurrentMemory, 450);
}

function generateStudy(passage, translation, mode) {
  if (normalizePassage(passage) === "2 chronicles 19") {
    return {
      ...fixture,
      translation,
      mode
    };
  }

  const book = getBookName(passage);
  return {
    passage,
    translation,
    mode,
    book,
    bookLinks: [`[[${book}]]`],
    people: [],
    places: [],
    groups: [],
    storyContext: [],
    eventThreads: [],
    entityLinks: [],
    themes: ["context", "observation", "application"],
    tags: ["study"],
    sources: ["Scripture"],
    bigIdea:
      "Prototype scaffold: this passage is ready for generated study content once AI and Bible-source integrations are connected.",
    context: [
      "This prototype currently includes a detailed fixture for 2 Chronicles 19. For other passages, it generates the export structure so the workflow can be tested."
    ],
    passageMap: [[passage, "Study scaffold", "Awaiting generated passage analysis"]],
    verseNotes: [
      {
        reference: passage,
        note:
          "Generated notes will eventually include context, what to notice, study notes, overread guardrails, application, and concise takeaways.",
        details: [],
        keep: "This note is a placeholder for workflow testing."
      }
    ],
    crossReferences: [],
    questions: ["What should this passage help me notice, obey, or revisit?"],
    application: ["What is one faithful response to this passage today?"],
    sourceNotes: ["Prototype scaffold only. No external Bible or commentary sources were queried."]
  };
}

function buildMarkdown(study, userNotes = []) {
  const passageRows = study.passageMap
    .map(([section, movement, emphasis]) => `| ${section} | ${movement} | ${emphasis} |`)
    .join("\n");
  const verseNotes = study.verseNotes
    .map((item) => {
      return `### ${item.reference}\n\n${item.note}${detailList(item.details)}\n\n**Takeaway:** ${item.keep}`;
    })
    .join("\n\n");
  const crossRefs = study.crossReferences.length
    ? study.crossReferences.map(([ref, connection]) => `- ${ref} - ${connection}`).join("\n")
    : "- Add cross references with connection notes.";
  const linkedNotes = study.entityLinks.length
    ? [
        ...study.entityLinks.map((link) => `- ${link}`),
        ...study.storyContext.map((item) => `- ${item} - story context, not a standalone event thread by default.`)
      ].join("\n")
    : "- No entity links suggested yet.";
  return `---\ntype: bible-study\npassage: "${study.passage}"\ntranslation: "${study.translation}"\nmode: "${study.mode}"\ndate: ${new Date().toISOString().slice(0, 10)}\nbook: "${study.book}"\n${yamlField("book_links", study.bookLinks)}\n${yamlField("people", study.people)}\n${yamlField("places", study.places)}\n${yamlField("groups", study.groups)}\n${yamlField("story_context", study.storyContext)}\n${yamlField("event_threads", study.eventThreads)}\n${yamlField("entity_links", study.entityLinks)}\n${yamlField("themes", study.themes)}\n${yamlField("tags", study.tags)}\n${yamlField("sources", study.sources)}\nstatus: draft\n---\n\n[[A - Faith]] [[R - Study Notes]] ${study.bookLinks.join(" ")}\n\n# ${study.passage} Study Notes\n\n## Big Idea\n\n${study.bigIdea}\n\n## Context\n\n${study.context.join("\n\n")}\n\n## Passage Map\n\n| Section | Movement | Main Emphasis |\n|---|---|---|\n${passageRows}\n\n## Verse Notes\n\n${verseNotes}\n\n## Big Takeaways\n\n${simpleList(study.verseNotes.map((item) => item.keep))}\n\n## Questions To Revisit\n\n${simpleList(study.questions)}\n\n## Linked Notes\n\n${linkedNotes}\n\n## Vault Connections\n\nNo vault connections reviewed in this prototype run.\n\n## Cross-References\n\n${crossRefs}\n\n## Source Notes\n\n${simpleList(study.sourceNotes)}\n`;
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/"/g, "&quot;");
}

function inlineMarkup(value) {
  const parts = [];
  const pattern = /\[\[([^\]]+)\]\]|\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(value))) {
    parts.push(escapeHtml(value.slice(lastIndex, match.index)));
    if (match[1]) {
      const label = match[1];
      const cleanLabel = label.includes("|") ? label.split("|").pop() : label;
      parts.push(
        `<span class="wikilink-token" data-wikilink="${escapeAttribute(`[[${label}]]`)}">${escapeHtml(cleanLabel)}</span>`
      );
    } else {
      parts.push(`<strong>${escapeHtml(match[2])}</strong>`);
    }
    lastIndex = pattern.lastIndex;
  }

  parts.push(escapeHtml(value.slice(lastIndex)));
  return parts.join("");
}

function wikilinkLabel(value) {
  const match = value.match(/^\[\[([^\]]+)\]\]$/);
  return match ? match[1] : value;
}

function extractPreamble(markdown) {
  const headingIndex = markdown.indexOf("\n# ");
  return headingIndex === -1 ? "" : markdown.slice(0, headingIndex + 1);
}

function renderMarkdownPreview(markdown) {
  const lines = markdown.split("\n");
  const html = [];
  let inList = false;
  let inTable = false;
  let tableRows = [];
  let compactSection = false;

  function closeList() {
    if (inList) {
      html.push("</ul>");
      inList = false;
    }
  }

  function closeTable() {
    if (!inTable) return;
    const rows = tableRows.filter((row) => !/^\|\s*-/.test(row));
    html.push("<table>");
    rows.forEach((row, index) => {
      const cells = row
        .slice(1, -1)
        .split("|")
        .map((cell) => cell.trim());
      const tag = index === 0 ? "th" : "td";
      html.push(`<tr>${cells.map((cell) => `<${tag}>${inlineMarkup(cell)}</${tag}>`).join("")}</tr>`);
    });
    html.push("</table>");
    tableRows = [];
    inTable = false;
  }

  lines.forEach((line) => {
    if (line.startsWith("---") || /^[a-z_]+:/.test(line) || line.startsWith("  - ")) return;
    if (/^\s*(\[\[[^\]]+\]\]\s*)+$/.test(line)) return;
    if (line.startsWith("|")) {
      closeList();
      inTable = true;
      tableRows.push(line);
      return;
    }
    closeTable();
    if (line.startsWith("# ")) {
      closeList();
      compactSection = false;
      html.push(`<h1>${inlineMarkup(line.slice(2))}</h1>`);
    } else if (line.startsWith("## ")) {
      closeList();
      const heading = line.slice(3);
      compactSection = heading === "Source Notes";
      const className = compactSection ? ' class="source-notes-heading"' : "";
      html.push(`<h2${className}>${inlineMarkup(heading)}</h2>`);
    } else if (line.startsWith("### ")) {
      closeList();
      compactSection = false;
      html.push(`<h3>${inlineMarkup(line.slice(4))}</h3>`);
    } else if (line.startsWith("- ")) {
      if (!inList) {
        html.push(compactSection ? '<ul class="source-notes-list">' : "<ul>");
        inList = true;
      }
      html.push(`<li>${inlineMarkup(line.slice(2))}</li>`);
    } else if (line.trim()) {
      closeList();
      const className = compactSection ? ' class="source-notes-text"' : "";
      html.push(`<p${className}>${inlineMarkup(line)}</p>`);
    }
  });

  closeList();
  closeTable();
  return html.join("\n");
}

function inlineNodeToMarkdown(node) {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent;
  if (node.nodeType !== Node.ELEMENT_NODE) return "";
  const tag = node.tagName.toLowerCase();
  const inner = [...node.childNodes].map(inlineNodeToMarkdown).join("");
  if (node.classList.contains("wikilink-token")) return node.dataset.wikilink || `[[${inner}]]`;
  if (tag === "strong" || tag === "b") return `**${inner}**`;
  if (tag === "em" || tag === "i") return `*${inner}*`;
  if (tag === "br") return "\n";
  return inner;
}

function tableToMarkdown(table) {
  const rows = [...table.querySelectorAll("tr")].map((row) =>
    [...row.children].map((cell) => inlineNodeToMarkdown(cell).trim())
  );
  if (!rows.length) return "";
  const divider = rows[0].map(() => "---");
  return [rows[0], divider, ...rows.slice(1)].map((row) => `| ${row.join(" | ")} |`).join("\n");
}

function editorBodyToMarkdown() {
  const blocks = [];
  [...noteEditor.children].forEach((element) => {
    const tag = element.tagName.toLowerCase();
    const text = inlineNodeToMarkdown(element).trim();
    if (!text && tag !== "ul" && tag !== "table") return;
    if (tag === "h1") blocks.push(`# ${text}`);
    else if (tag === "h2") blocks.push(`## ${text}`);
    else if (tag === "h3") blocks.push(`### ${text}`);
    else if (tag === "ul") {
      blocks.push(
        [...element.querySelectorAll(":scope > li")]
          .map((li) => `- ${inlineNodeToMarkdown(li).trim()}`)
          .join("\n")
      );
    } else if (tag === "table") {
      blocks.push(tableToMarkdown(element));
    } else {
      blocks.push(text);
    }
  });
  return `${blocks.join("\n\n").trim()}\n`;
}

function currentMarkdownFromEditor() {
  return `${state.currentPreamble || ""}${editorBodyToMarkdown()}`;
}

function currentPlainTextFromEditor() {
  return noteEditor.innerText.trim();
}

function currentRichHtmlFromEditor() {
  return noteEditor.innerHTML;
}

function setEditableNote(markdown) {
  state.currentPreamble = extractPreamble(markdown);
  state.currentExport = markdown;
  noteEditor.innerHTML = renderMarkdownPreview(markdown);
}

function renderMetadata(study) {
  const rows = [
    ["Passage", study.passage],
    ["Book", study.book],
    ["Translation", study.translation],
    ["Mode", study.mode],
    ["Tags", study.tags.join(", ") || "none"],
    ["Themes", study.themes.length.toString()],
    ["Entities", study.entityLinks.length.toString()]
  ];
  metadataList.innerHTML = rows.map(([label, value]) => `<dt>${label}</dt><dd>${escapeHtml(value)}</dd>`).join("");
}

function renderList(id, items, options = {}) {
  const element = document.querySelector(id);
  if (!items.length) {
    element.innerHTML = "<li>None suggested.</li>";
    return;
  }
  if (options.copyWikilinks) {
    element.innerHTML = items
      .map(
        (item) =>
          `<li><button type="button" class="entity-chip" data-wikilink="${escapeAttribute(item)}" title="Copy ${escapeAttribute(item)}">${escapeHtml(wikilinkLabel(item))}</button></li>`
      )
      .join("");
    return;
  }
  element.innerHTML = items.map((item) => `<li>${inlineMarkup(item)}</li>`).join("");
}

function renderEntities(study) {
  renderList("#peopleList", study.people, { copyWikilinks: true });
  renderList("#placesList", study.places, { copyWikilinks: true });
  renderList("#groupsList", study.groups, { copyWikilinks: true });
  renderList("#storyContextList", study.storyContext);
  renderList("#eventThreadsList", study.eventThreads, { copyWikilinks: true });
  document.querySelector("#themeTagList").innerHTML = [
    ...study.themes.map((item) => `<span class="pill theme">theme: ${escapeHtml(item)}</span>`),
    ...study.tags.map((item) => `<span class="pill tag">tag: ${escapeHtml(item)}</span>`)
  ].join("");
}

function renderMemoryList() {
  const count = state.memoryEntries.length;
  memoryCount.textContent = String(count);
  if (!count) {
    memoryList.innerHTML = '<li class="memory-empty">No saved studies yet.</li>';
    return;
  }
  memoryList.innerHTML = state.memoryEntries
    .map((entry) => {
      const activeClass = entry.id === state.activeMemoryId ? " active" : "";
      return `<li><button type="button" class="memory-item${activeClass}" data-memory-id="${escapeAttribute(
        entry.id
      )}"><strong>${escapeHtml(entry.passage)}</strong><span>${escapeHtml(entry.translation)} · ${escapeHtml(
        entry.mode
      )} · ${escapeHtml(formatMemoryDate(entry.updatedAt))}</span></button></li>`;
    })
    .join("");
}

function loadMemoryEntry(id, options = {}) {
  saveCurrentMemory();
  const entry = state.memoryEntries.find((item) => item.id === id);
  if (!entry) return;
  state.activeMemoryId = entry.id;
  state.currentStudy = entry.study;
  state.currentExport = entry.markdown;
  passageInput.value = entry.study.passage;
  translationInput.value = entry.study.translation;
  modeInput.value = entry.study.mode;
  studyPreview.innerHTML = renderMarkdownPreview(entry.markdown);
  setEditableNote(entry.markdown);
  renderMetadata(entry.study);
  renderEntities(entry.study);
  renderMemoryList();
  if (options.notify !== false) showToast(`${entry.passage} restored.`);
}

function renderStudy() {
  saveCurrentMemory();
  const study = generateStudy(passageInput.value, translationInput.value, modeInput.value);
  const markdown = buildMarkdown(study, state.userNotes);
  state.currentStudy = study;
  state.currentExport = markdown;
  studyPreview.innerHTML = renderMarkdownPreview(markdown);
  setEditableNote(markdown);
  renderMetadata(study);
  renderEntities(study);
  rememberStudy(study, markdown);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.setTimeout(() => toast.classList.remove("visible"), 1800);
}

async function copyExport() {
  try {
    state.currentExport = currentMarkdownFromEditor();
    await navigator.clipboard.writeText(state.currentExport);
    showToast("Markdown copied.");
  } catch {
    showToast("Copy failed. Try Download MD.");
  }
}

async function copyRichText() {
  const html = currentRichHtmlFromEditor();
  const plain = currentPlainTextFromEditor();
  try {
    if (navigator.clipboard && window.ClipboardItem) {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([plain], { type: "text/plain" })
        })
      ]);
    } else {
      await navigator.clipboard.writeText(plain);
    }
    showToast("Rich text copied.");
  } catch {
    showToast("Rich text copy failed.");
  }
}

async function copyPlainText() {
  try {
    await navigator.clipboard.writeText(currentPlainTextFromEditor());
    showToast("Plain text copied.");
  } catch {
    showToast("Plain text copy failed.");
  }
}

function downloadMarkdown() {
  state.currentExport = currentMarkdownFromEditor();
  const slug = state.currentStudy.passage.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const blob = new Blob([state.currentExport], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${slug || "bible-study"}-obsidian-export.md`;
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

function setMenuOpen(menu, trigger, isOpen) {
  menu.hidden = !isOpen;
  trigger.setAttribute("aria-expanded", String(isOpen));
}

function closeMenus() {
  setMenuOpen(copyMenu, copyMenuButton, false);
  setMenuOpen(exportMenu, exportMenuButton, false);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  renderStudy();
  showToast("Study generated.");
  if (window.matchMedia("(max-width: 620px)").matches) {
    document.querySelector('[data-tab="study"]').click();
    document.querySelector(".workspace-panel").scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

copyRichTextButton.addEventListener("click", copyRichText);
copyMarkdownButton.addEventListener("click", copyExport);
copyPlainTextButton.addEventListener("click", copyPlainText);
downloadMarkdownButton.addEventListener("click", downloadMarkdown);
exportPdfButton.addEventListener("click", exportPdf);

copyMenuButton.addEventListener("click", () => {
  const shouldOpen = copyMenu.hidden;
  closeMenus();
  setMenuOpen(copyMenu, copyMenuButton, shouldOpen);
});

exportMenuButton.addEventListener("click", () => {
  const shouldOpen = exportMenu.hidden;
  closeMenus();
  setMenuOpen(exportMenu, exportMenuButton, shouldOpen);
});

document.querySelector(".action-menus").addEventListener("click", (event) => {
  if (event.target.closest(".menu-popover button")) {
    window.setTimeout(closeMenus, 80);
  }
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".action-menus")) closeMenus();
});

noteEditor.addEventListener("input", () => {
  state.currentExport = currentMarkdownFromEditor();
  studyPreview.innerHTML = noteEditor.innerHTML;
  scheduleMemorySave();
});

memoryList.addEventListener("click", (event) => {
  const button = event.target.closest(".memory-item");
  if (!button) return;
  loadMemoryEntry(button.dataset.memoryId);
});

document.querySelector("#entitiesTab").addEventListener("click", async (event) => {
  const button = event.target.closest(".entity-chip");
  if (!button) return;
  try {
    await navigator.clipboard.writeText(button.dataset.wikilink);
    showToast(`${button.textContent} link copied.`);
  } catch {
    showToast(button.dataset.wikilink);
  }
});

document.querySelectorAll(".tab-button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tab-button").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    document.querySelector(`#${button.dataset.tab}Tab`).classList.add("active");
  });
});

function initializeApp() {
  state.memoryEntries = readMemoryEntries();
  renderMemoryList();
  if (state.memoryEntries.length) {
    loadMemoryEntry(state.memoryEntries[0].id, { notify: false });
  } else {
    renderStudy();
  }
}

initializeApp();
