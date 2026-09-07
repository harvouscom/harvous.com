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
  headings?: string[];
  titles?: string[];
  noteCount?: number;
  sourceDomain?: string | null;
  sourceSiteName?: string | null;
  excerpt?: string;
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

/** What taking a copy of each kind actually produces, said in the reader's words. */
export const DISCOVER_KIND_NOUN: Record<DiscoverKind, string> = {
  template: "Starter",
  note: "Study",
  pack: "Series",
  resource: "Resource",
};

export const DISCOVER_KIND_BLURB: Record<DiscoverKind, string> = {
  template: "A shape to write into — headings and prompts, nothing filled in.",
  note: "A finished study, copied into your own Harvous to read and change.",
  pack: "A series of notes that arrive together as one thread.",
  resource: "A link, saved to your own library.",
};

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
