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
import { existsSync, readFileSync } from "node:fs";
import { getUseCaseBySlug } from "./use-cases-data.ts";
import { buildInstallUrl } from "./signup-url.ts";
import { join } from "node:path";

export type DiscoverKind = "template" | "note" | "pack" | "resource";

/** Which file a row's identity came from. Stamped by the reader, never authored. */
export type DiscoverOrigin = "catalog" | "curated";

/** What a curated reference *is*, which is a finer question than its kind. */
/**
 * `"article"` used to cover everything with no video and no full curriculum —
 * which quietly meant STEP Bible's interlinear, Blue Letter Bible's lexicons
 * and Matthew Henry's whole commentary all wore the same label as a 900-word
 * essay. Two of those are instruments you look something up in and put back
 * down; one is a historical work read cover to cover. Neither is an article.
 *
 *   article  something written to be read once, start to end
 *   book     a full-length work — a commentary, a devotional, a classic text
 *   tool     an instrument you consult, not read — a lexicon, an index, a
 *            concordance
 *   guide    ours: a how-to piece written for Harvous
 *   series   a curriculum or course library, worked through over weeks
 *   video    plays in place — see `DiscoverVideo`
 */
export type DiscoverResourceType = "video" | "article" | "book" | "tool" | "guide" | "series";

export const DISCOVER_RESOURCE_TYPE_NOUN: Record<DiscoverResourceType, string> = {
  video: "Video",
  article: "Article",
  book: "Book",
  tool: "Tool",
  guide: "Guide",
  series: "Series",
};

/**
 * The publisher a curated reference points at.
 *
 * A reference is somebody's work, and the first thing worth knowing about it is
 * whose — so this is not `preview.sourceDomain` with a nicer name. The domain is
 * small print; the name and the mark are what a reader recognises, and the
 * attribution is a promise we make to the publisher rather than a caption we
 * chose.
 */
export type DiscoverSource = {
  /** The publisher's name as they write it — "BibleProject", not "bibleproject.com". */
  name: string;
  /** Bare host, for the card's small print. */
  domain: string;
  /** The exact page this points at. `https://…`, or `/…` when it is ours. */
  url: string;
  /** Their home page — where the credit line's link goes. */
  homeUrl: string;
  /** Square mark under `/images/discover-sources/logos/`. Absent draws an initial. */
  logo?: string | null;
  /** One sentence naming who made it and who owns it. Shown beside the player. */
  attribution: string;
  /** What the licence actually allows, in plain words. Doubles as the CTA note. */
  licence?: string | null;
  /**
   * Never host this publisher's media — embed it from their own platform.
   *
   * BibleProject's terms are the reason this field exists: they permit embedding
   * a stream or a link, and forbid uploading or storing the file. It governs
   * *media*, not the poster frame — see `mirrorPoster`.
   */
  embedOnly?: boolean;
  /**
   * Whether we may keep a local copy of the poster frame. Default true.
   *
   * Hot-linking a YouTube thumbnail fires a request to a Google host from
   * `/discover/` before anyone presses play, which undoes the whole point of the
   * click-to-play facade. A mirrored thumbnail that credits and links back is
   * what every link preview on the web already does. One flag to flip for a
   * publisher who would rather we hot-linked theirs.
   */
  mirrorPoster?: boolean;
};

export type DiscoverVideo = {
  provider: "youtube";
  /** The 11-character id, not a URL. Validated at build. */
  id: string;
  /**
   * When the publisher put it out — *not* when we listed it.
   *
   * `VideoObject.uploadDate` is a claim about someone else's video, and
   * `listedAt` would make it a false one: Genesis 1–11 went up in 2015 and we
   * listed it in 2026. Absent means the JSON-LD omits the field rather than
   * guessing, which costs a video rich result and tells no lies.
   */
  publishedAt?: string | null;
  /** ISO 8601, e.g. "PT8M57S" — schema.org's spelling, for `VideoObject`. */
  duration?: string | null;
  /** What the badge shows, e.g. "8:57". */
  durationLabel?: string | null;
};

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

  /** Which file this row came from. */
  origin: DiscoverOrigin;
  /**
   * Whether the app has a listing at this slug — i.e. whether `buildInstallUrl`
   * resolves to a real page rather than a 404.
   *
   * Deliberately not the same question as `origin`. The CTA branches on this
   * one, so a curated row that later lands in the synced catalog becomes
   * installable while keeping its publisher chrome, with no component edit.
   */
  installable: boolean;
  /** Curated only: the publisher this points at. */
  source?: DiscoverSource | null;
  resourceType?: DiscoverResourceType | null;
  video?: DiscoverVideo | null;
  /** Curated only: our own sentence about why it is here. Never the publisher's. */
  note?: string | null;
  /**
   * Curated only: the ground behind this listing's picture, taken from the
   * picture itself by `npm run discover:sources`.
   *
   * A curated card used to sit its picture on the *topic's* wash, and the two
   * disagree more often than not — a guide's blog thumb is graded to its blog
   * category (`plan-the-quarter-not-the-week` is `equipping`, so green) while
   * its Discover topic is `teaching-prep`, which is amber. Neither taxonomy is
   * wrong; they are just different ones. So a reference stops borrowing either
   * and takes the colour of the thing itself, which cannot disagree with the
   * picture sitting on it.
   */
  plateTone?: string | null;
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
  /**
   * Where a listing's *shape or content* was informed by, when that is
   * neither "Harvous invented this" (`official`) nor "a Harvous account
   * submitted this" (`authorDisplayName` on the listing itself).
   *
   * Distinct from `DiscoverSource` on purpose — that is the whole identity of
   * a curated `resource` row (its picture, its licence, its CTA). This is
   * much smaller: a template or note whose content Harvous wrote, crediting
   * where the structure came from. The six sermon-outline templates are the
   * first use — real Harvous template content, adapted from frameworks
   * surveyed at an outside article, so neither "Included" nor a fabricated
   * submitter byline would be honest.
   */
  sourceName?: string | null;
  sourceUrl?: string | null;
  /**
   * The publisher lockup, carried by the export once the app seeds a curated
   * reference itself.
   *
   * Nested, and named for the type it becomes, precisely so it cannot be
   * confused with the two flat fields above. `sourceName`/`sourceUrl` mean "a
   * Harvous-written thing that credits an outside structure"; this means "the
   * whole listing belongs to somebody else." `readCatalog` lifts it onto the
   * listing, which is why a seeded reference needs no curated entry to keep its
   * chrome.
   */
  source?: DiscoverSource | null;
  resourceType?: DiscoverResourceType | null;
  video?: DiscoverVideo | null;
  /** Ours, not theirs — the sentence that makes the listing page not a stub. */
  note?: string | null;
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

/**
 * A presentation override for one curated reference, matched to a synced row
 * by slug.
 *
 * This used to be a full listing an author hand-wrote and `expandCurated`
 * turned into one — title, description, note, category, the whole publisher
 * lockup. The app owns all of that now: `src/data/curated-resources.ts`
 * authors it, `discover-seed-curated-resources.ts` publishes it, and
 * `GET /api/discover/export` delivers it nested under `preview.source` for
 * `hydrateSynced` to lift onto the row. What is left here is only what the
 * app's database cannot hold — a path on *this* disk.
 *
 * Both fields are themselves optional overrides, not requirements: most
 * entries need neither. `resolveDiscoverImage` and `deriveSourceLogo` already
 * find a mirrored file by convention (`/images/discover-sources/<slug>.webp`,
 * `/images/discover-sources/logos/<source-slug>.webp`); an entry only needs
 * to appear here when the convention is wrong for it — the seven Harvous
 * guides, whose poster is an existing blog thumbnail rather than something to
 * mirror, and whose mark is the site's own icon rather than a publisher's.
 */
type CuratedPresentation = {
  slug: string;
  /** A path already on this disk — an existing blog thumbnail, most often —
   *  not a URL for the mirror script to fetch. `resolveDiscoverImage` still
   *  checks the by-convention mirror path first, so this is only reached when
   *  that lookup misses. */
  image?: string;
  /** Overrides `deriveSourceLogo`'s by-convention mirror path — a mark that
   *  is not the publisher's own, and so is never something to mirror or
   *  refetch. Harvous's own icon is the only current use. */
  logo?: string;
};

const CATALOG_PATH = join(process.cwd(), "data/discover-listings.json");
const CURATED_PATH = join(process.cwd(), "data/discover-curated.json");

/** The shape `sanitizeSignupSlug` accepts — a slug it would reject is a dead URL. */
const CURATED_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

let cache: CatalogFile | null = null;

function readSyncedFile(): CatalogFile {
  const raw = readFileSync(CATALOG_PATH, "utf-8");
  const parsed = JSON.parse(raw) as CatalogFile;
  if (!Array.isArray(parsed.listings) || !Array.isArray(parsed.categories)) {
    throw new Error(
      "data/discover-listings.json is missing `listings` or `categories`. It is written by " +
        "sync-discover-catalog.yml in the app repo from GET /api/discover/export.",
    );
  }
  return parsed;
}

/**
 * The curated file is optional, and strict when it is there.
 *
 * Absent-is-legal is not laziness — it is the endgame this already reached
 * once: the app-side seed publishes every reference itself now, and this file
 * holds only what its database cannot. Emptying it further, and eventually
 * deleting it, costs no reader change and no build break in between.
 */
function readCuratedFile(): { listings: CuratedPresentation[] } {
  let raw: string;
  try {
    raw = readFileSync(CURATED_PATH, "utf-8");
  } catch {
    return { listings: [] };
  }
  const parsed = JSON.parse(raw) as { listings?: unknown };
  if (!Array.isArray(parsed.listings)) {
    throw new Error("data/discover-curated.json is missing `listings`.");
  }
  return { listings: parsed.listings as CuratedPresentation[] };
}

function bad(slug: string, why: string): never {
  throw new Error(`data/discover-curated.json — "${slug}": ${why}`);
}

/**
 * Fail loud, name the slug.
 *
 * A slug the app would reject is a URL nobody can reach; a slug the synced
 * catalog has never heard of is an override with nothing to override — most
 * often a reference renamed or delisted in `curated-resources.ts` with this
 * file's entry never cleaned up behind it.
 */
function validatePresentation(entry: CuratedPresentation, syncedSlugs: Set<string>): void {
  const slug = entry?.slug ?? "(missing slug)";
  if (!entry?.slug || !CURATED_SLUG_RE.test(entry.slug)) bad(slug, "slug must be kebab-case");
  if (!syncedSlugs.has(entry.slug)) {
    bad(
      slug,
      "no synced listing exists for this slug — add it to the app's " +
        "src/data/curated-resources.ts and seed, or remove this entry",
    );
  }
}

/**
 * The local mirror if it is there, the authored path otherwise.
 *
 * Same posture as `OptimizedImage` and the compare OG images: check the disk at
 * build time and degrade to what the author wrote. A forgotten
 * `npm run discover:sources` therefore costs a hot-linked image, not a build.
 */
function resolveDiscoverImage(slug: string, authored: string | null): string | null {
  const local = `/images/discover-sources/${slug}.webp`;
  if (existsSync(join(process.cwd(), "public", local.slice(1)))) return local;
  return authored;
}

/**
 * The plate tones, written alongside the mirrored posters.
 *
 * Absent is fine and silent — the card falls back to the topic wash, which is
 * what it did before tones existed. Read once, like the catalogs.
 */
let toneCache: Record<string, string> | null = null;

function discoverPlateTone(slug: string): string | null {
  if (!toneCache) {
    const path = join(process.cwd(), "public/images/discover-sources/manifest.json");
    try {
      toneCache = (JSON.parse(readFileSync(path, "utf-8")).tones ?? {}) as Record<string, string>;
    } catch {
      toneCache = {};
    }
  }
  return toneCache[slug] ?? null;
}

/**
 * A publisher's mark, found by convention or handed an exception.
 *
 * `npm run discover:sources` mirrors every publisher's mark to
 * `/images/discover-sources/logos/<source-slug>.webp`, named by
 * `discoverSourceSlug` — the same function this calls, so neither side has to
 * tell the other the filename. A presentation override's `logo` matters only
 * when that convention is wrong for this source: Harvous is not a publisher
 * to mirror, and points here at the site's own icon instead.
 *
 * Checked against disk either way, same posture as `resolveDiscoverImage` — a
 * mark that failed to fetch, or an override typo'd to a path that never
 * shipped, costs a plainer initial tile rather than a broken image.
 */
function deriveSourceLogo(source: DiscoverSource, override: string | null): DiscoverSource {
  const onDisk = (path: string) => existsSync(join(process.cwd(), "public", path.slice(1)));
  if (override && onDisk(override)) return { ...source, logo: override };
  const bySlug = `/images/discover-sources/logos/${discoverSourceSlug(source)}.webp`;
  return { ...source, logo: onDisk(bySlug) ? bySlug : null };
}

/**
 * Bring one of our own URLs back to a site-relative path.
 *
 * The app stores every source URL absolute, because `validateResourceUrl` — the
 * rule that governs what may be saved to a library — needs a real https URL
 * with a dotted host, and `/blog/…` is not one. That is right for the seven
 * Harvous guides *as library links*, and wrong for them as links on this page:
 * absolute would open harvous.com in a new tab from harvous.com.
 */
function localizeSourceUrl(url: string): string {
  if (!url.startsWith("https://harvous.com/")) return url;
  return url.slice("https://harvous.com".length);
}

/**
 * Lift a seeded reference's publisher chrome out of `preview` and onto the
 * row, then layer this disk's presentation on top.
 *
 * `GET /api/discover/export` emits `preview` as whatever the seeder wrote, so
 * a curated reference arrives with its whole lockup nested inside it. Lifting
 * it here means every consumer — the card, the listing page, the JSON-LD —
 * reads `listing.source` the same way regardless of where a row came from.
 */
function hydrateSynced(row: DiscoverListing, presentation?: CuratedPresentation): DiscoverListing {
  const preview = row.preview;
  if (!preview?.source) return row;
  const source = {
    ...preview.source,
    url: localizeSourceUrl(preview.source.url),
    homeUrl: localizeSourceUrl(preview.source.homeUrl),
  };
  return {
    ...row,
    source: deriveSourceLogo(source, presentation?.logo ?? null),
    resourceType: preview.resourceType ?? row.resourceType ?? null,
    video: preview.video ?? row.video ?? null,
    note: preview.note ?? row.note ?? null,
    plateTone: discoverPlateTone(row.slug),
    preview: {
      ...preview,
      sourceImage: preview.sourceImage ?? resolveDiscoverImage(row.slug, presentation?.image ?? null),
    },
  };
}

function readCatalog(): CatalogFile {
  if (cache) return cache;

  const synced = readSyncedFile();
  const curated = readCuratedFile();
  const bySlug = new Set(synced.listings.map((row) => row.slug));

  const seen = new Set<string>();
  const presentationBySlug = new Map<string, CuratedPresentation>();
  for (const entry of curated.listings) {
    validatePresentation(entry, bySlug);
    if (seen.has(entry.slug)) bad(entry.slug, "listed twice in this file");
    seen.add(entry.slug);
    presentationBySlug.set(entry.slug, entry);
  }

  const listings: DiscoverListing[] = synced.listings.map((row) =>
    hydrateSynced(
      { ...row, origin: "catalog" as const, installable: true },
      presentationBySlug.get(row.slug),
    ),
  );

  cache = { categories: synced.categories, listings };
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

/** The glyph a curated `resourceType` wears — everything past the kind-level
 *  default. `mini` and the OG badge have room for exactly one, so this is the
 *  one place that has to pick. */
const RESOURCE_TYPE_ICON: Partial<Record<DiscoverResourceType, string>> = {
  video: "fa7-solid:play",
  /** A lexicon or an index — something you look something up *in*. */
  tool: "fa7-solid:magnifying-glass",
  /** A full-length work, distinct from `note`'s plain "fa7-solid:book" so a
      curated classic and a scripture note never draw the same glyph. */
  book: "fa7-solid:book-open",
  /** A curriculum worked through over weeks — a stack, not a single page. */
  series: "fa7-solid:layer-group",
};

export function discoverListingIcon(listing: DiscoverListing): string {
  if (listing.kind === "note" && listing.preview?.noteType === "scripture") {
    return "fa7-solid:book";
  }
  if (listing.resourceType && RESOURCE_TYPE_ICON[listing.resourceType]) {
    return RESOURCE_TYPE_ICON[listing.resourceType]!;
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

export function isCuratedListing(listing: DiscoverListing): boolean {
  return listing.origin === "curated";
}

/** "BibleProject" → "bibleproject", which is what `/discover/?from=` carries. */
export function discoverSourceSlug(source: DiscoverSource): string {
  return source.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Where a card goes — always a page of ours.
 *
 * References used to link straight out, on the reasoning that a page about
 * somebody else's page is a stub. That stopped being true once a reference
 * could be added to your own Harvous: the page is where that happens, and a
 * card that skips it skips the only thing Discover is for.
 */
export function discoverListingHref(listing: DiscoverListing): string {
  return `/discover/${listing.slug}/`;
}

export type DiscoverCta = {
  href: string;
  label: string;
  external: boolean;
};

/**
 * What the page offers: one button, and — for a reference — the way out to the
 * publisher underneath it.
 *
 * The secondary is not a nicety. Before the app seeds a reference there is
 * nothing to install and the publisher link *is* the primary; after it, the
 * install takes the lead and the publisher link has to survive the promotion.
 * A single-CTA version silently dropped it at exactly that moment, which for
 * the nine BibleProject videos would have removed the credit link their terms
 * require. Returning a pair makes that impossible to do by accident.
 */
export type DiscoverCtaPair = {
  primary: DiscoverCta;
  secondary: DiscoverCta | null;
  /**
   * One line under the pair, or none. Deliberately on the pair rather than on
   * each button: a note per button meant two stacked paragraphs of grey small
   * print under two buttons, which is more apparatus than the choice deserves.
   *
   * Where there is a publisher, the line worth keeping is theirs — whether it
   * is free, and whether it needs an account, which is the one thing a reader
   * cannot guess. "Add to my Harvous" needs no gloss.
   */
  note: string | null;
};

/** "Read on STEP Bible" is the wrong verb for an interlinear you consult and
 *  close again — it wants the same "Open" a course library gets. Defaults to
 *  "Read", which is right for `article`, `book` and `guide`. */
const CTA_VERB: Partial<Record<DiscoverResourceType, string>> = {
  video: "Watch",
  series: "Open",
  tool: "Open",
};

/** The way out to the publisher, identical whether it leads or follows. */
function sourceCta(listing: DiscoverListing, source: DiscoverSource): DiscoverCta {
  const verb = (listing.resourceType && CTA_VERB[listing.resourceType]) || "Read";
  /* Ours. "Read on Harvous" is a strange thing to say to somebody already on
     harvous.com, so name the thing instead of the place. */
  const ours = source.url.startsWith("/");
  const noun = listing.resourceType
    ? DISCOVER_RESOURCE_TYPE_NOUN[listing.resourceType].toLowerCase()
    : "page";
  return {
    href: source.url,
    label: ours ? `${verb} the ${noun}` : `${verb} on ${source.name}`,
    external: !ours,
  };
}

/**
 * The one place the CTA stories live.
 *
 * They had drifted into a single hardcoded button that said "Save this to my
 * Harvous" under a kicker reading "A template included with Harvous" — an
 * invitation to add something the reader already has. The cases are genuinely
 * different:
 *
 *   reference, seeded    the link is yours to keep; the publisher link follows
 *   reference, not yet   nothing of ours to install; the publisher link leads
 *   official             already in every account; the button starts a note
 *   shared               someone gave this away; the button takes a copy
 *
 * The first two are the same listing on either side of the app-side seed, which
 * is why nothing here reads `origin`: a reference becomes installable the day
 * its row reaches the synced catalog, and this function is what notices.
 */
export function discoverListingCta(listing: DiscoverListing): DiscoverCtaPair {
  const source = listing.source;

  if (source) {
    const out = sourceCta(listing, source);
    /* The publisher's terms, not ours. Whether it is free and whether it needs
       an account is the one thing a reader cannot work out from the buttons —
       "Add to my Harvous" explains itself, and glossing it cost a second line
       of small print saying what the button already said. */
    const note = source.licence ?? null;
    if (!listing.installable) return { primary: out, secondary: null, note };
    return {
      primary: { href: buildInstallUrl(listing.slug), label: "Add to my Harvous", external: true },
      secondary: out,
      note,
    };
  }

  if (listing.preview?.official) {
    return {
      primary: {
        href: buildInstallUrl(listing.slug),
        label: `Start a note from this ${DISCOVER_KIND_NOUN[listing.kind].toLowerCase()}`,
        external: true,
      },
      secondary: null,
      note: "Free, and already in your templates — this opens it in Harvous.",
    };
  }

  return {
    primary: {
      href: buildInstallUrl(listing.slug),
      label: "Save this to my Harvous",
      external: true,
    },
    secondary: null,
    note: `Free. ${DISCOVER_KIND_BLURB[listing.kind]}`,
  };
}

/**
 * Newest first, then dealt out by kind so the first screen shows the catalog.
 *
 * Newest-first alone was right while the catalog was six templates listed on
 * one day. It broke the moment references arrived: every curated row carries
 * the day it was listed, so twenty-three of them sorted above six templates
 * that were three days older, and the first page of a hub whose own lead
 * begins "Templates to write into" contained no templates at all.
 *
 * Dealing round-robin across kinds fixes that without inventing a rank nobody
 * asked for. Within a kind the order is still newest-first, so the newest
 * template and the newest resource both surface; it is only the interleave
 * that is imposed. A single-kind catalog is unaffected — one bucket deals back
 * exactly what went in, which is what this did before.
 */
export function sortedDiscoverListings(): DiscoverListing[] {
  const byRecency = [...getDiscoverListings()].sort((a, b) => {
    const at = a.listedAt ? Date.parse(a.listedAt) : 0;
    const bt = b.listedAt ? Date.parse(b.listedAt) : 0;
    return bt - at;
  });

  /* Insertion-ordered, so the kind holding the newest thing deals first. */
  const buckets = new Map<DiscoverKind, DiscoverListing[]>();
  for (const listing of byRecency) {
    const bucket = buckets.get(listing.kind);
    if (bucket) bucket.push(listing);
    else buckets.set(listing.kind, [listing]);
  }

  const dealt: DiscoverListing[] = [];
  const hands = [...buckets.values()];
  for (let round = 0; dealt.length < byRecency.length; round++) {
    for (const hand of hands) {
      const next = hand[round];
      if (next) dealt.push(next);
    }
  }
  return dealt;
}
