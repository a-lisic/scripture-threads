import type { Study } from "./types";

function yamlList(values: string[]) {
  if (!values.length) return "[]";
  return values.map((value) => `  - "${escapeYamlString(value)}"`).join("\n");
}

function yamlField(name: string, values: string[]) {
  return values.length ? `${name}:\n${yamlList(values)}` : `${name}: []`;
}

function escapeYamlString(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function simpleList(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

function detailList(details: string[] = []) {
  if (!details.length) return "";
  return `\n\n${details.map((detail) => `- ${detail}`).join("\n")}`;
}

function markdownTableCell(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

export function buildMarkdown(study: Study) {
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
  const translationNotes = study.translationNotes.length
    ? study.translationNotes
        .map((item) => `- ${item.reference} (${item.translations.join(", ")}) - ${item.note}`)
        .join("\n")
    : "- Add selective translation notes only when wording differences help the study.";
  const claimLedger = study.claimLedger.length
    ? study.claimLedger
        .map(
          (item) =>
            `| ${markdownTableCell(item.claim)} | ${markdownTableCell(item.evidence)} | ${item.sourceType} | ${item.confidence} |`
        )
        .join("\n")
    : "| Add claim | Add evidence | scripture | possible |";
  const sourceRecords = study.sourceRecords.length
    ? study.sourceRecords
        .map((item) => {
          const ref = item.reference ? ` ${item.reference}.` : "";
          const url = item.url ? ` ${item.url}` : "";
          const note = item.note ? ` ${item.note}` : "";
          return `- ${item.label} (${item.type}).${ref}${url}${note}`.trim();
        })
        .join("\n")
    : "- Add source records.";
  const linkedNotes = study.entityLinks.length
    ? [
        ...study.entityLinks.map((link) => `- ${link}`),
        ...study.storyContext.map((item) => `- ${item} - story context, not a standalone event thread by default.`)
      ].join("\n")
    : "- No entity links suggested yet.";

  return `---\ntype: bible-study\npassage: "${escapeYamlString(study.passage)}"\ntranslation: "${escapeYamlString(study.translation)}"\nmode: "${escapeYamlString(study.mode)}"\ndate: ${new Date().toISOString().slice(0, 10)}\nbook: "${escapeYamlString(study.book)}"\nsource_profile: "${escapeYamlString(study.sourceProfile)}"\ngeneration_status: "${escapeYamlString(study.generationStatus)}"\n${yamlField("book_links", study.bookLinks)}\n${yamlField("people", study.people)}\n${yamlField("places", study.places)}\n${yamlField("groups", study.groups)}\n${yamlField("story_context", study.storyContext)}\n${yamlField("event_threads", study.eventThreads)}\n${yamlField("entity_links", study.entityLinks)}\n${yamlField("themes", study.themes)}\n${yamlField("tags", study.tags)}\n${yamlField("sources", study.sources)}\nstatus: draft\n---\n\n[[A - Faith]] [[R - Study Notes]] ${study.bookLinks.join(" ")}\n\n# ${study.passage} Study Notes\n\n## Big Idea\n\n${study.bigIdea}\n\n## Context\n\n${study.context.join("\n\n")}\n\n## Passage Map\n\n| Section | Movement | Main Emphasis |\n|---|---|---|\n${passageRows}\n\n## Verse Notes\n\n${verseNotes}\n\n## Big Takeaways\n\n${simpleList(study.verseNotes.map((item) => item.keep))}\n\n## Questions To Revisit\n\n${simpleList(study.questions)}\n\n## Linked Notes\n\n${linkedNotes}\n\n## Vault Connections\n\nNo vault connections reviewed in this prototype run.\n\n## Cross-References\n\n${crossRefs}\n\n## Translation Notes\n\n${translationNotes}\n\n## Claim Ledger\n\n| Claim | Evidence | Source Type | Confidence |\n|---|---|---|---|\n${claimLedger}\n\n## Source Records\n\n${sourceRecords}\n\n## Source Notes\n\n${simpleList(study.sourceNotes)}\n`;
}

export function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function escapeAttribute(value: string) {
  return escapeHtml(value).replace(/"/g, "&quot;");
}

export function wikilinkLabel(value: string) {
  const match = value.match(/^\[\[([^\]]+)\]\]$/);
  return match ? match[1] : value;
}

export function inlineMarkup(value: string) {
  const parts: string[] = [];
  const pattern = /\[\[([^\]]+)\]\]|\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(value))) {
    parts.push(escapeHtml(value.slice(lastIndex, match.index)));
    if (match[1]) {
      const label = match[1];
      const cleanLabel = label.includes("|") ? label.split("|").pop() || label : label;
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

export function extractPreamble(markdown: string) {
  const headingIndex = markdown.indexOf("\n# ");
  return headingIndex === -1 ? "" : markdown.slice(0, headingIndex + 1);
}

export function renderMarkdownPreview(markdown: string) {
  const lines = markdown.split("\n");
  const html: string[] = [];
  let inList = false;
  let inTable = false;
  let tableRows: string[] = [];
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

  let inFrontmatter = false;

  lines.forEach((line) => {
    if (line.startsWith("---")) {
      inFrontmatter = !inFrontmatter;
      return;
    }
    if (inFrontmatter || line.startsWith("  - ")) return;
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
