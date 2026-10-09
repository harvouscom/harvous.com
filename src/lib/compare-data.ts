import { readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { getCompareAngle } from "./compare-app-angles.ts";

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
  /** From data/compare-angles.json — e.g. "Coming soon" for an app not out yet. */
  status?: string;
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

function resolveCompareOgImage(slug: string, remoteUrl: string): string {
  const localPath = `/images/compare/og/${slug}.png`;
  if (existsSync(join(process.cwd(), "public", localPath.slice(1)))) {
    return localPath;
  }
  return remoteUrl;
}

function rowToEntry(headers: string[], values: string[]): CompareEntry | null {
  const get = (key: string) => values[headers.indexOf(key)]?.trim() ?? "";
  const slug = get("Slug");
  if (!slug) return null;

  // Per-app copy (data/compare-angles.json) wins over the CSV's where written.
  const angle = getCompareAngle(slug);
  return {
    name: get("Name"),
    slug,
    competitorType: get("Competitor type"),
    seoTitle: get("SEO Title"),
    seoDescription: angle?.seoDescription ?? get("SEO Description"),
    competitorLink: get("Competitor link"),
    intro: angle?.intro ?? get("Intro"),
    status: angle?.status,
    ogImage: resolveCompareOgImage(slug, get("Open Graph")),
    competitorImage: get("Competitor app image"),
    bestAt: get("Competitor Best at"),
    primaryUse: get("Competitor Primary Use"),
    idealFor: get("Competitor Ideal for"),
    worksBestAlongside: get("Competitor works best alongside"),
  };
}

let cache: CompareEntry[] | null = null;
const ANGLES_PATH = join(process.cwd(), "data/compare-angles.json");
let anglesMtimeMs = 0;
function anglesChanged(): boolean {
  const m = existsSync(ANGLES_PATH) ? statSync(ANGLES_PATH).mtimeMs : 0;
  if (m === anglesMtimeMs) return false;
  anglesMtimeMs = m;
  return true;
}
let cacheMtimeMs = 0;

export function getCompareEntries(): CompareEntry[] {
  const mtimeMs = existsSync(CSV_PATH) ? statSync(CSV_PATH).mtimeMs : 0;
  if (cache && cacheMtimeMs === mtimeMs && !anglesChanged()) return cache;

  const raw = readFileSync(CSV_PATH, "utf-8");
  const rows = parseCsvRows(raw);
  if (rows.length < 2) {
    cache = [];
    cacheMtimeMs = mtimeMs;
    return cache;
  }
  const [headerRow, ...dataRows] = rows;
  cache = dataRows
    .map((row) => rowToEntry(headerRow, row))
    .filter((e): e is CompareEntry => e !== null);
  cacheMtimeMs = mtimeMs;
  return cache;
}

export function getCompareBySlug(slug: string): CompareEntry | undefined {
  return getCompareEntries().find((e) => e.slug === slug);
}

/**
 * The kinds of app Harvous is compared with, alphabetical except that Bible
 * Notes leads: those are the apps someone choosing Harvous is most likely
 * weighing it against, so the hub opens on them.
 */
const LEADING_TYPE = "Bible Notes";

export function getCompareTypes(): string[] {
  const types = new Set(getCompareEntries().map((e) => e.competitorType).filter(Boolean));
  return [...types].sort((a, b) => (a === LEADING_TYPE ? -1 : b === LEADING_TYPE ? 1 : a.localeCompare(b)));
}

export function getCompareByType(type: string): CompareEntry[] {
  return getCompareEntries().filter((e) => e.competitorType === type);
}

/** App Store rating counts by slug — refresh with `npm run compare:popularity`. */
const POPULARITY_PATH = join(process.cwd(), "data/compare-popularity.json");
let popularity: Record<string, number> | null = null;

function getPopularity(): Record<string, number> {
  popularity ??= existsSync(POPULARITY_PATH) ? JSON.parse(readFileSync(POPULARITY_PATH, "utf-8")) : {};
  return popularity!;
}

/** Most popular first; apps with no App Store count go last, A–Z. */
export function sortByPopularity(list: CompareEntry[]): CompareEntry[] {
  const counts = getPopularity();
  const count = (e: CompareEntry) => counts[e.slug] ?? -1;
  return [...list].sort(
    (a, b) => count(b) - count(a) || a.name.localeCompare(b.name, "en", { sensitivity: "base" }),
  );
}

/** Stable anchor id for compare hub section nav (e.g. "Bible Notes" → "bible-notes"). */
export function compareTypeToId(type: string): string {
  return type
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * A competitor's icon for display: the 224px WebP cut (`npm run compare:icons`
 * makes them from the 400px PNGs, which stay for colour sampling and OG
 * generation). Falls back to the PNG for an app added without running it.
 */
export function compareIconSrc(slug: string): string {
  const webp = `/images/compare/icons/${slug}.webp`;
  return existsSync(join(process.cwd(), "public", webp)) ? webp : compareIconPng(slug);
}

/** The full-size PNG, for reading the icon's colour at build time. */
export function compareIconPng(slug: string): string {
  return `/images/compare/icons/${slug}.png`;
}
