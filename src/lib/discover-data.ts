/**
 * The Discover catalog, read at build time.
 *
 * The catalog itself lives in the app's database. This site is a fully static
 * Astro build with no SSR adapter, so a listing's page has to exist as HTML in
 * `dist/` before a crawler ever asks for one — which rules out fetching at
 * request time, and rules out a client-side fetch that would rank at nothing.
 *
 * So the catalog arrives as a committed file, refreshed by
 * `.github/workflows/sync-discover-catalog.yml` in the app repo, exactly the way
 * `data/webflow-changelog.csv` already arrives for release notes. Same idiom as
 * release-notes-data.ts: read once, cache for the build.
 *
 * The file is the contract. If it is missing or malformed the build fails here,
 * loudly, rather than shipping a hub page with nothing under it.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

export type DiscoverKind = "template" | "note" | "pack" | "resource";

export type DiscoverListing = {
  slug: string;
  kind: DiscoverKind;
  title: string;
  description: string | null;
  category: string | null;
  authorDisplayName: string | null;
  preview: DiscoverPreview | null;
  installCount: number;
  listedAt: string | null;
};

export type DiscoverPreview = {
  titleTemplate?: string | null;
  /** The colour the author picked; absent falls back to a hash of the slug. */
  iconColor?: string | null;
  headings?: string[];
  titles?: string[];
  noteCount?: number;
  /** The Thread's own colour, for the stripe that says it is a Thread. */
  color?: string | null;
  /** So a scripture note is not drawn as a plain one. */
  noteType?: string | null;
  sourceDomain?: string | null;
  sourceSiteName?: string | null;
  sourceImage?: string | null;
  excerpt?: string;
  /**
   * The artifact itself — sanitized server-side on write and again on read, so
   * this is safe to render with `set:html` and this repo needs no sanitizer of
   * its own. Capped, which the fade makes invisible. Absent on rows written
   * before it existed and on links, which have no body; the page falls back to
   * the outline in that case.
   */
  bodyHtml?: string;
};

export type DiscoverCategory = {
  id: string;
  label: string;
  blurb: string;
};

type CatalogFile = {
  categories: DiscoverCategory[];
  listings: DiscoverListing[];
};

const CATALOG_PATH = join(process.cwd(), "data/discover-listings.json");

let cache: CatalogFile | null = null;

function readCatalog(): CatalogFile {
  if (cache) return cache;
  const raw = readFileSync(CATALOG_PATH, "utf-8");
  const parsed = JSON.parse(raw) as CatalogFile;
  if (!Array.isArray(parsed.listings) || !Array.isArray(parsed.categories)) {
    throw new Error(
      "data/discover-listings.json is missing `listings` or `categories`. It is written by " +
        "sync-discover-catalog.yml in the app repo from GET /api/discover/export.",
    );
  }
  cache = parsed;
  return cache;
}

export function getDiscoverListings(): DiscoverListing[] {
  return readCatalog().listings;
}

export function getDiscoverCategories(): DiscoverCategory[] {
  return readCatalog().categories;
}

export function getDiscoverListingBySlug(slug: string): DiscoverListing | undefined {
  return getDiscoverListings().find((listing) => listing.slug === slug);
}

/** Only categories with something in them — a heading over an empty list is a dead end. */
export function getPopulatedDiscoverCategories(): Array<
  DiscoverCategory & { listings: DiscoverListing[] }
> {
  const listings = getDiscoverListings();
  return getDiscoverCategories()
    .map((category) => ({
      ...category,
      listings: listings.filter((listing) => listing.category === category.id),
    }))
    .filter((category) => category.listings.length > 0);
}

/*
 * The app's own words, not new ones.
 *
 * These were Starter / Study / Series, which read well and named nothing: the
 * app calls them Templates, Notes and Threads, and someone arriving here from
 * search then has to translate before they can use what they took. "Series" was
 * worse than merely new — the church planner already uses it for a teaching
 * series, so it named two different things.
 */
export const DISCOVER_KIND_NOUN: Record<DiscoverKind, string> = {
  template: "Template",
  note: "Note",
  pack: "Thread",
  resource: "Resource",
};

export const DISCOVER_KIND_BLURB: Record<DiscoverKind, string> = {
  template: "A shape to write into — headings and prompts, nothing filled in.",
  note: "A finished note, copied into your own Harvous to read and change.",
  pack: "A Thread of notes that arrive together, as one.",
  resource: "A link, saved to your own library.",
};

/**
 * The colour a kind wears, from the site's own content-type hues.
 *
 * `ContentPill` already paints a note blue and a thread green everywhere else
 * on this site; Discover reading the same way is most of what makes the catalog
 * feel like part of the product rather than a page about it. Those two are
 * exact matches and are not negotiable.
 *
 * Templates and links have no pill of their own, so they take the two remaining
 * hues rather than earning new tokens in a palette the whole site shares. A
 * template took `--color-accent` first and it was wrong: accent and
 * `--pill-note` are both blue, so a template card and a note card were
 * indistinguishable at a glance — which is the entire job of this function. It
 * takes the amber instead, and specifically `--pill-highlight-ink`, the readable
 * one: `--pill-highlight` is a highlighter fill and vanishes as a border.
 *
 * These are all fills. `global.css` says so in as many words — mix them toward
 * `--color-ink` before using one as text or a glyph.
 */
export function discoverKindInk(kind: DiscoverKind): string {
  switch (kind) {
    case "note":
      return "var(--pill-note)";
    case "pack":
      return "var(--pill-thread)";
    case "resource":
      return "var(--pill-scripture)";
    case "template":
    default:
      return "var(--pill-highlight-ink)";
  }
}

/**
 * A Thread's colour, translated into this site's palette.
 *
 * The app's thread hues (`--color-blue`, `--color-purple`, …) do not exist
 * here — a stripe asking for one silently fell back to the accent, so every
 * Thread looked blue no matter what its owner picked. This is the same mapping
 * the app itself keeps in `THREAD_TO_APPEARANCE_COLOR_ID` (blue→sky,
 * purple→lilac, orange→peach, green→mint, pink→pink), extended with yellow→cream
 * because this site has no yellow tile.
 *
 * `paper` is a real thread colour meaning "no colour", and gets the rule.
 */
export function discoverThreadStripe(color: string | null | undefined): string {
  switch ((color ?? "").toLowerCase()) {
    case "purple":
      return "var(--color-lilac)";
    case "green":
      return "var(--color-mint)";
    case "orange":
      return "var(--color-peach)";
    case "pink":
      return "var(--color-pink)";
    case "yellow":
      return "var(--color-cream)";
    case "paper":
      return "var(--color-rule)";
    case "blue":
    default:
      return "var(--color-sky)";
  }
}

export function discoverCategoryLabel(id: string | null): string {
  if (!id) return "Uncategorized";
  return getDiscoverCategories().find((c) => c.id === id)?.label ?? id;
}

/** Newest first, which is what a small catalog wants until it needs ranking. */
export function sortedDiscoverListings(): DiscoverListing[] {
  return [...getDiscoverListings()].sort((a, b) => {
    const at = a.listedAt ? Date.parse(a.listedAt) : 0;
    const bt = b.listedAt ? Date.parse(b.listedAt) : 0;
    return bt - at;
  });
}
