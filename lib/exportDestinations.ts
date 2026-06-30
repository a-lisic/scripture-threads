import type { ExportDestination } from "./types";

export const exportDestinations: ExportDestination[] = [
  {
    id: "markdown",
    label: "Markdown .md",
    description: "Download an Obsidian-ready markdown file with YAML, wikilinks, linked notes, and source notes.",
    status: "available"
  },
  {
    id: "pdf",
    label: "PDF",
    description: "Use browser print/save as PDF for a clean study handout or teaching prep copy.",
    status: "available"
  },
  {
    id: "obsidian",
    label: "Obsidian",
    description: "Manual markdown export now; future options may include Obsidian URI, plugin, or local companion sync.",
    status: "planned"
  },
  {
    id: "icloud",
    label: "iCloud Drive",
    description: "Best first version is file download/share sheet on Apple devices. Direct writes need a separate user-approved workflow.",
    status: "planned"
  },
  {
    id: "google-drive",
    label: "Google Drive",
    description: "Future OAuth connection can save markdown, PDF, or Google Docs copies to a chosen Drive folder.",
    status: "requires-connection"
  },
  {
    id: "notion",
    label: "Notion",
    description: "Future OAuth connection can create database pages or notes from the edited study.",
    status: "requires-connection"
  },
  {
    id: "goodnotes",
    label: "GoodNotes",
    description: "Best first version is PDF export/share sheet. Direct app import depends on GoodNotes-supported device workflows.",
    status: "planned"
  },
  {
    id: "apple-notes",
    label: "Apple Notes",
    description: "Use rich text copy/share workflows first; direct writes are limited from hosted web apps.",
    status: "planned"
  },
  {
    id: "google-docs",
    label: "Google Docs",
    description: "Future Drive OAuth flow can create a Google Doc version for teaching edits and sharing.",
    status: "requires-connection"
  },
  {
    id: "word",
    label: "Word / DOCX",
    description: "Future server export can generate DOCX handouts or teaching documents.",
    status: "planned"
  }
];
