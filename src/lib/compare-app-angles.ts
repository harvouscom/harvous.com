/**
 * Per-app compare copy — what's genuinely distinctive about each app, and where
 * Harvous differs from *that* app, written one app at a time.
 *
 * Lives in data/compare-angles.json (keyed by the compare slug) so it can be
 * edited without touching code. When an app has an angle, its /compare/<app>/
 * page uses it instead of the category-wide positioning in
 * compare-harvous-positioning.ts; apps without one fall back to that.
 *
 * House rule for anyone editing: the Harvous line is never longer than the
 * other app's, and never the same sentence on two pages.
 */
import { readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

export type CompareAngleRow = { label: string; harvous: string; them: string };

export type CompareAngle = {
  /** One sentence, "<App> is …; Harvous …" — the part before "; Harvous" is reused on related cards. */
  intro: string;
  seoDescription: string;
  /** Completes “Choose <App> if…”. */
  chooseThem: string;
  /** Completes “Choose Harvous if…”. */
  chooseHarvous: string;
  /** Completes “Harvous isn’t for…”. */
  harvousIsnt: string;
  /** “Works best alongside”. */
  together: string;
  table: CompareAngleRow[];
};

const PATH = join(process.cwd(), "data/compare-angles.json");
let cache: Record<string, CompareAngle> | null = null;
let cacheMtime = 0;

function load(): Record<string, CompareAngle> {
  const mtime = existsSync(PATH) ? statSync(PATH).mtimeMs : 0;
  if (cache && cacheMtime === mtime) return cache;
  cache = mtime ? (JSON.parse(readFileSync(PATH, "utf-8")) as Record<string, CompareAngle>) : {};
  cacheMtime = mtime;
  return cache;
}

export function getCompareAngle(slug: string): CompareAngle | undefined {
  return load()[slug];
}
