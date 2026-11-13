/**
 * Family rows on compare pages — what each app offers households, checked one
 * app at a time, with sources.
 *
 * Lives in data/compare-family.json, keyed by compare slug. An app gets the two
 * family rows on its /compare/<app>/ page only when it has an entry here, so a
 * page never says "no family plan" about an app nobody checked. Each entry
 * keeps its sources and the date they were read; re-check before the date is a
 * year old, because family plans come and go.
 *
 * The Harvous side is fixed (HARVOUS_FAMILY below) and must match the app:
 * Family is in Harvous Plus, covers the organizer and up to five more people,
 * and is on the web for now. Teens 13 and up share counts, never content.
 * Child notebooks (under 13, US only, verified parent consent) are
 * "Coming soon" until enrollment opens — keep that wording, and keep the US
 * and under-13 limits wherever they are named.
 */
import { readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

export type CompareFamilyEntry = {
  /** "Family plan" cell for the other app. */
  plan: string;
  /** "Kids and teens" cell for the other app. */
  kids: string;
  /** Where each claim came from. */
  sources: string[];
  /** ISO date the sources were read. */
  checked: string;
  notes?: string;
};

export const HARVOUS_FAMILY = {
  plan: "Plus covers you and up to 5 more, with a Family Space you share",
  kids: "Teens 13+ share progress, never notes. Notebooks for under-13s in the US, with verified parent consent: coming soon",
} as const;

export const FAMILY_ROW_LABELS = { plan: "Family plan", kids: "Kids and teens" } as const;

const PATH = join(process.cwd(), "data/compare-family.json");
let cache: Record<string, CompareFamilyEntry> | null = null;
let cacheMtime = 0;

function load(): Record<string, CompareFamilyEntry> {
  const mtime = existsSync(PATH) ? statSync(PATH).mtimeMs : 0;
  if (cache && cacheMtime === mtime) return cache;
  cache = mtime ? (JSON.parse(readFileSync(PATH, "utf-8")) as Record<string, CompareFamilyEntry>) : {};
  cacheMtime = mtime;
  return cache;
}

export function getCompareFamily(slug: string): CompareFamilyEntry | undefined {
  return load()[slug];
}

/** The two family rows for an app's side-by-side table, or none if unchecked. */
export function familyRowsFor(slug: string): { label: string; harvous: string; them: string }[] {
  const entry = getCompareFamily(slug);
  if (!entry) return [];
  return [
    { label: FAMILY_ROW_LABELS.plan, harvous: HARVOUS_FAMILY.plan, them: entry.plan },
    { label: FAMILY_ROW_LABELS.kids, harvous: HARVOUS_FAMILY.kids, them: entry.kids },
  ];
}
