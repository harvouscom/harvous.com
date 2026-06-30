import { readFileSync } from "node:fs";
import { join } from "node:path";

export type CompareEntry = {
  name: string;
  slug: string;
  competitorType: string;
  seoTitle: string;
  seoDescription: string;
  competitorLink: string;
  intro: string;
  ogImage: string;
  competitorImage: string;
  bestAt: string;
  primaryUse: string;
  idealFor: string;
  worksBestAlongside: string;
};

const CSV_PATH = join(process.cwd(), "data/compare.csv");

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

function rowToEntry(headers: string[], values: string[]): CompareEntry | null {
  const get = (key: string) => values[headers.indexOf(key)]?.trim() ?? "";
  const slug = get("Slug");
  if (!slug) return null;

  return {
    name: get("Name"),
    slug,
    competitorType: get("Competitor type"),
    seoTitle: get("SEO Title"),
    seoDescription: get("SEO Description"),
    competitorLink: get("Competitor link"),
    intro: get("Intro"),
    ogImage: get("Open Graph"),
    competitorImage: get("Competitor app image"),
    bestAt: get("Competitor Best at"),
    primaryUse: get("Competitor Primary Use"),
    idealFor: get("Competitor Ideal for"),
    worksBestAlongside: get("Competitor works best alongside"),
  };
}

let cache: CompareEntry[] | null = null;

export function getCompareEntries(): CompareEntry[] {
  if (cache) return cache;
  const raw = readFileSync(CSV_PATH, "utf-8");
  const rows = parseCsvRows(raw);
  if (rows.length < 2) {
    cache = [];
    return cache;
  }
  const [headerRow, ...dataRows] = rows;
  cache = dataRows
    .map((row) => rowToEntry(headerRow, row))
    .filter((e): e is CompareEntry => e !== null);
  return cache;
}

export function getCompareBySlug(slug: string): CompareEntry | undefined {
  return getCompareEntries().find((e) => e.slug === slug);
}

export function getCompareTypes(): string[] {
  const types = new Set(getCompareEntries().map((e) => e.competitorType).filter(Boolean));
  return [...types].sort();
}

export function getCompareByType(type: string): CompareEntry[] {
  return getCompareEntries().filter((e) => e.competitorType === type);
}

/** Stable anchor id for compare hub section nav (e.g. "Bible Notes" → "bible-notes"). */
export function compareTypeToId(type: string): string {
  return type
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
