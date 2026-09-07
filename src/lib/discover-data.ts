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
import { getUseCaseBySlug } from "./use-cases-data.ts";
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
  /** So a scripture note is not drawn as a plain one. */
  noteType?: string | null;
  /** Harvous's own — a built-in template. Shown as "From Harvous", never a byline. */
  official?: boolean;
  /**
   * A file resource's type, lowercased ("pdf", "epub", …).
   *
   * Nothing writes this yet: `snapshotResource` takes links only, because a
   * file-kind item means copying a private storage object between owners and
   * that path does not exist. Read defensively so the day it does, the card
   * already knows how to draw one — and in the meantime the same treatment is
   * what an imageless link falls back to.
   */
  fileType?: string | null;
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
  /** The topic's hue as a thread-colour name — the app's palette. This site
   *  draws topics with `discoverTopicInk` + artwork instead. */
  color?: string | null;
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
/**
 * The glyph each kind wears — the app's, not ours. `list-check` is
 * `NOTE_TEMPLATE_ICON_NAME`, `arrow-right-arrow-left` is what
 * `PrototypeSidebarThreadCard` draws, `newspaper` is a resource row's, and a
 * note follows `noteKindIcon` (a scripture note takes `book`).
 */
export const DISCOVER_KIND_ICON: Record<DiscoverKind, string> = {
  template: "fa7-solid:list-check",
  note: "fa7-solid:note-sticky",
  pack: "fa7-solid:arrow-right-arrow-left",
  resource: "fa7-solid:newspaper",
};

export function discoverListingIcon(listing: DiscoverListing): string {
  if (listing.kind === "note" && listing.preview?.noteType === "scripture") {
    return "fa7-solid:book";
  }
  return DISCOVER_KIND_ICON[listing.kind] ?? DISCOVER_KIND_ICON.note;
}

/**
 * A topic's glyph, borrowed from its use-case page.
 *
 * Category ids are the use-case slugs on purpose (`discover-categories.ts` says
 * so), and every use case already carries an icon that the homepage carousel,
 * `/for/` and its own page all draw. Discover reuses it rather than picking a
 * second one, so "Sermon notes" looks like Sermon notes everywhere on the
 * site. Two topics have no use-case page and take their own.
 */
const TOPIC_ICON_FALLBACK: Record<string, string> = {
  "teaching-prep": "fa7-solid:chalkboard-user",
  reference: "fa7-solid:bookmark",
};

export function discoverTopicIcon(id: string): string {
  return getUseCaseBySlug(id)?.icon ?? TOPIC_ICON_FALLBACK[id] ?? "fa7-solid:layer-group";
}

/**
 * A topic's artwork, borrowed from its use-case page.
 *
 * Same trade as the glyph: the category ids *are* the use-case slugs, and each
 * use case already has a colour-matched wash curated onto it — the Daily journal
 * art is blue because Daily journal is blue. Picking new images per topic would
 * mean maintaining a second set that drifts from the first.
 *
 * Two topics have no use-case page. Teaching prep takes an unclaimed amber wash
 * to sit with the orange it shares with Sermon notes; **Reference deliberately
 * gets none** — it is the grey shelf, and a colour wash behind a list of links
 * would be the one card claiming a hue it does not have.
 */
const TOPIC_ART_FALLBACK: Record<string, string | null> = {
  "teaching-prep": "/images/auth-hero/ai_bg_060.webp",
  /* Deep study's use-case art is gold and its ink is neutral grey. Grey means
     Reference in this catalog, so the topic takes the violet pair instead —
     see `discoverTopicInk`. */
  "deep-study": "/images/auth-hero/ai_bg_076.webp",
  reference: null,
};

export function discoverTopicArt(id: string | null | undefined): string | null {
  if (!id) return null;
  if (id in TOPIC_ART_FALLBACK) return TOPIC_ART_FALLBACK[id];
  return getUseCaseBySlug(id)?.image ?? null;
}

/**
 * Where the wash is cropped, so two cards under one topic are not the same
 * picture twice. Deterministic per slug — the same listing always crops the
 * same way, which matters because these pages are static and diffed.
 */
export function discoverArtPosition(slug: string | null | undefined): string {
  let h = 0;
  for (let i = 0; i < (slug ?? "").length; i++) h = (h * 31 + (slug as string).charCodeAt(i)) >>> 0;
  const x = [12, 30, 50, 70, 88][h % 5];
  const y = [22, 42, 58, 78][(h >> 3) % 4];
  return `${x}% ${y}%`;
}

/**
 * A topic's ink **on this site**, taken from its use-case page.
 *
 * Not `DiscoverCategory.color`. That is a thread-colour name and it is right in
 * the app, whose tiles speak that palette — but here a topic also wears its
 * use case's artwork, and the two disagreed: Deep study is purple in the app
 * and its curated wash is gold. The use-case page already pairs an ink with
 * that image, so the chip borrows the pairing rather than inventing a second
 * one and drifting from it.
 */
const TOPIC_INK_FALLBACK: Record<string, string> = {
  "teaching-prep": "var(--study-dock-accent-warmAmber)",
  reference: "var(--study-dock-accent-neutral)",
  /* Overrides its use case, which is neutral grey. **Grey is Reference's** in
     Discover — it is the shelf, and the links on it are grey for the same
     reason — so a second grey topic would be saying something it does not mean.
     Violet is the nearest free pair, and Deep study's artwork moves with it. */
  "deep-study": "var(--study-dock-accent-violet)",
};

export function discoverTopicInk(id: string): string {
  return (
    TOPIC_INK_FALLBACK[id] ??
    getUseCaseBySlug(id)?.ink ??
    "var(--study-dock-accent-neutral)"
  );
}

/**
 * The app's thread-colour names in this site's palette.
 *
 * `preview.iconColor` arrives as one of the app's colour names, because that is
 * what a template's author picked in the app's own picker. Nothing here can
 * consume that name directly, so this is the one place the two palettes are
 * pinned to each other.
 *
 * `orange` and `yellow` land on **different** tokens on purpose: the accent set
 * had no orange for a long time and `warmAmber` (#f2cf13) is a yellow, so
 * folding them together would draw Inductive Study and Comparative Study — both
 * filed under Deep study, and side by side in that strip — as the same colour.
 */
const THREAD_COLOR_INK: Record<string, string> = {
  blue: "var(--study-dock-accent-skyBlue)",
  orange: "var(--study-dock-accent-orange)",
  yellow: "var(--study-dock-accent-warmAmber)",
  pink: "var(--study-dock-accent-coralRose)",
  green: "var(--study-dock-accent-mintGreen)",
  purple: "var(--study-dock-accent-violet)",
  teal: "var(--study-dock-accent-teal)",
  gray: "var(--study-dock-accent-neutral)",
};

/**
 * A listing's own ink: the author's colour where the kind has one, the topic's
 * otherwise — the same rule the app's Discover panel follows, so a template is
 * the colour its author chose in both products.
 *
 * Only the tile on a `mini` card uses this. The full card carries its topic as
 * artwork instead, which is a deliberate difference: a card with room for a
 * picture shows the artifact, and a card without room shows what kind of thing
 * it is.
 */
export function discoverListingInk(listing: DiscoverListing): string {
  const own = listing.preview?.iconColor;
  if (own && THREAD_COLOR_INK[own]) return THREAD_COLOR_INK[own];
  if (listing.category) return discoverTopicInk(listing.category);
  return "var(--study-dock-accent-neutral)";
}

/**
 * The wash behind a resource that has no picture of its own — a PDF, or a link
 * whose site publishes no OG image. Four of the unclaimed auth-hero plates,
 * chosen by slug so a row of them is not four copies of one image.
 */
const DOCUMENT_ART = [
  "/images/auth-hero/ai_bg_046.webp",
  "/images/auth-hero/ai_bg_059.webp",
  "/images/auth-hero/ai_bg_072.webp",
  "/images/auth-hero/ai_bg_077.webp",
];

export function discoverDocumentArt(slug: string | null | undefined): string {
  let h = 0;
  for (let i = 0; i < (slug ?? "").length; i++) h = (h * 31 + (slug as string).charCodeAt(i)) >>> 0;
  return DOCUMENT_ART[h % DOCUMENT_ART.length];
}

export type DiscoverTopic = DiscoverCategory & {
  icon: string;
  ink: string;
  count: number;
};

/** The topics that have something in them, with their glyph, ink and a count. */
export function getDiscoverTopics(): DiscoverTopic[] {
  return getPopulatedDiscoverCategories().map((category) => ({
    id: category.id,
    label: category.label,
    blurb: category.blurb,
    color: category.color,
    icon: discoverTopicIcon(category.id),
    ink: discoverTopicInk(category.id),
    count: category.listings.length,
  }));
}

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
