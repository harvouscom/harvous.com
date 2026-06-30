import { readFileSync } from "node:fs";
import { join } from "node:path";

export type ChangelogEntry = {
  slug: string;
  title: string;
  category: string;
  date: string;
  dateKey: number;
  lead: string;
  bullets: string[];
};

export type ChangelogRelease = {
  slug: string;
  version: string;
  date: string;
  dateKey: number;
  entries: ChangelogEntry[];
  excerpt: string;
  featureCount: number;
  fixCount: number;
  improvementCount: number;
};

const CSV_PATH = join(process.cwd(), "data/webflow-changelog.csv");

/** Parse a single CSV row respecting quoted fields (incl. embedded newlines). */
function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || (ch === "\r" && next === "\n")) {
      row.push(field);
      field = "";
      if (row.some((c) => c.trim())) rows.push(row);
      row = [];
      if (ch === "\r") i++;
    } else if (ch !== "\r") {
      field += ch;
    }
  }

  if (field.length || row.length) {
    row.push(field);
    if (row.some((c) => c.trim())) rows.push(row);
  }

  return rows;
}

function decodeHtml(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripBoilerplate(text: string): string {
  return text
    .replace(/^We've added a new feature:\s*/i, "")
    .replace(/^We've fixed an issue:\s*/i, "")
    .replace(/^We've improved:\s*/i, "")
    .trim();
}

export function parseCommitMessageHtml(html: string): { lead: string; bullets: string[] } {
  const plain = decodeHtml(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\r/g, "")
    .trim();

  const lines = plain
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const bullets: string[] = [];
  const prose: string[] = [];

  for (const line of lines) {
    if (line.startsWith("-")) {
      bullets.push(line.replace(/^-\s*/, "").trim());
    } else {
      prose.push(line);
    }
  }

  const lead = stripBoilerplate(prose[0] ?? "");
  const tail = prose.slice(1).filter((p) => !p.match(/^Co-?authored-by:/i) && !p.match(/^Made-with:/i));

  return {
    lead: lead || tail[0] || "",
    bullets: bullets.length > 0 ? bullets : tail.filter((p) => p !== lead),
  };
}

function versionToSlug(version: string): string {
  return `v${version.replace(/\./g, "-").toLowerCase()}`;
}

function formatReleaseDate(raw: string): { label: string; key: number } {
  const parsed = Date.parse(raw);
  if (Number.isNaN(parsed)) return { label: raw, key: 0 };
  return {
    key: parsed,
    label: new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(parsed),
  };
}

function buildExcerpt(release: Pick<ChangelogRelease, "featureCount" | "fixCount" | "improvementCount" | "entries">): string {
  const parts: string[] = [];
  if (release.featureCount) parts.push(`${release.featureCount} feature${release.featureCount === 1 ? "" : "s"}`);
  if (release.fixCount) parts.push(`${release.fixCount} fix${release.fixCount === 1 ? "" : "es"}`);
  if (release.improvementCount) {
    parts.push(`${release.improvementCount} improvement${release.improvementCount === 1 ? "" : "s"}`);
  }
  if (parts.length === 0) return release.entries[0]?.title ?? "Updates";
  return parts.join(", ");
}

/** Webflow exports can repeat the same change under different item slugs. */
function entryFingerprint(entry: ChangelogEntry): string {
  return [
    entry.title.toLowerCase().trim(),
    entry.category.toLowerCase().trim(),
    entry.lead.toLowerCase().trim(),
    entry.bullets.map((b) => b.toLowerCase().trim()).join("|"),
  ].join("\n");
}

function dedupeEntries(entries: ChangelogEntry[]): ChangelogEntry[] {
  const seen = new Set<string>();
  const unique: ChangelogEntry[] = [];

  for (const entry of entries) {
    const key = entryFingerprint(entry);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(entry);
  }

  return unique;
}

function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

/** Full release body — catches Webflow re-exporting the same notes under new version numbers. */
function releaseFingerprint(release: ChangelogRelease): string {
  return release.entries
    .map(entryFingerprint)
    .sort()
    .join("\n---\n");
}

function dedupeReleases(releases: ChangelogRelease[]): {
  releases: ChangelogRelease[];
  slugRedirects: Map<string, string>;
} {
  const groups = new Map<string, ChangelogRelease[]>();

  for (const release of releases) {
    const key = releaseFingerprint(release);
    const list = groups.get(key) ?? [];
    list.push(release);
    groups.set(key, list);
  }

  const kept: ChangelogRelease[] = [];
  const slugRedirects = new Map<string, string>();

  for (const group of groups.values()) {
    group.sort((a, b) => compareVersions(b.version, a.version) || b.dateKey - a.dateKey);
    const canonical = group[0]!;
    kept.push(canonical);

    for (const duplicate of group.slice(1)) {
      slugRedirects.set(duplicate.slug, canonical.slug);
    }
  }

  kept.sort(
    (a, b) => b.dateKey - a.dateKey || compareVersions(b.version, a.version)
  );

  return { releases: kept, slugRedirects };
}

let cache: ChangelogRelease[] | null = null;
let slugRedirectCache: Map<string, string> | null = null;

export function getReleaseNotes(): ChangelogRelease[] {
  if (cache) return cache;

  const raw = readFileSync(CSV_PATH, "utf-8");
  const rows = parseCsvRows(raw);
  const headers = rows[0] ?? [];
  const dataRows = rows.slice(1);

  const byVersion = new Map<string, ChangelogEntry[]>();

  for (const values of dataRows) {
    const get = (key: string) => values[headers.indexOf(key)]?.trim() ?? "";
    const version = get("Version Number");
    const title = get("Name");
    const slug = get("Slug");
    if (!version || !title || !slug) continue;

    const { label, key } = formatReleaseDate(get("Date"));
    const { lead, bullets } = parseCommitMessageHtml(get("Commit Message"));

    const entry: ChangelogEntry = {
      slug,
      title,
      category: get("Category") || "Update",
      date: label,
      dateKey: key,
      lead,
      bullets,
    };

    const list = byVersion.get(version) ?? [];
    list.push(entry);
    byVersion.set(version, list);
  }

  const built = [...byVersion.entries()]
    .map(([version, entries]) => {
      const sortedEntries = dedupeEntries(entries).sort(
        (a, b) => b.dateKey - a.dateKey || a.title.localeCompare(b.title)
      );
      const dateKey = Math.max(...sortedEntries.map((e) => e.dateKey));
      const date = sortedEntries.find((e) => e.dateKey === dateKey)?.date ?? sortedEntries[0]?.date ?? "";

      const featureCount = sortedEntries.filter((e) => e.category === "Feature").length;
      const fixCount = sortedEntries.filter((e) => e.category === "Fix").length;
      const improvementCount = sortedEntries.filter((e) => e.category === "Improvement").length;

      const release: ChangelogRelease = {
        slug: versionToSlug(version),
        version,
        date,
        dateKey,
        entries: sortedEntries,
        featureCount,
        fixCount,
        improvementCount,
        excerpt: "",
      };
      release.excerpt = buildExcerpt(release);
      return release;
    })
    .sort((a, b) => b.dateKey - a.dateKey || compareVersions(b.version, a.version));

  const deduped = dedupeReleases(built);
  cache = deduped.releases;
  slugRedirectCache = deduped.slugRedirects;

  return cache;
}

export function getReleaseNoteSlugRedirects(): ReadonlyMap<string, string> {
  getReleaseNotes();
  return slugRedirectCache ?? new Map();
}

export function getReleaseNoteBySlug(slug: string): ChangelogRelease | undefined {
  getReleaseNotes();
  const canonical = slugRedirectCache?.get(slug) ?? slug;
  return getReleaseNotes().find((release) => release.slug === canonical);
}

export const RELEASE_NOTES_PAGE_SIZE = 24;

export type ReleaseNotesPage = {
  releases: ChangelogRelease[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
};

export function getReleaseNotesPageCount(): number {
  return Math.max(1, Math.ceil(getReleaseNotes().length / RELEASE_NOTES_PAGE_SIZE));
}

export function getReleaseNotesPage(page: number): ReleaseNotesPage {
  const all = getReleaseNotes();
  const totalPages = getReleaseNotesPageCount();
  const currentPage = Math.min(Math.max(1, Math.floor(page) || 1), totalPages);
  const start = (currentPage - 1) * RELEASE_NOTES_PAGE_SIZE;

  return {
    releases: all.slice(start, start + RELEASE_NOTES_PAGE_SIZE),
    currentPage,
    totalPages,
    totalCount: all.length,
  };
}

export function releaseNotesPageHref(page: number): string {
  if (page <= 1) return "/release-notes/";
  return `/release-notes/page/${page}/`;
}

/** @deprecated Use ChangelogRelease — kept for any lingering imports. */
export type ReleaseNoteEntry = ChangelogRelease;
