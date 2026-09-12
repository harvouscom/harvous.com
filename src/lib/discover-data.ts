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
 * One hand-written reference, before the reader expands it.
 *
 * Flat on purpose: an author writes `source.domain` once, and `expandCurated`
 * projects it into `preview.sourceDomain` so every existing code path — the
 * card's `hasPanel`, the listing page's `.dlink` treatment — keeps working with
 * no change at all. The publisher chrome then layers on top of that.
 */
type CuratedEntry = {
  slug: string;
  title: string;
  description: string;
  /** Ours, not theirs. Required — it is what makes a listing page not a stub. */
  note: string;
  category: string;
  listedAt: string;
  resourceType: DiscoverResourceType;
  source: DiscoverSource;
  video?: DiscoverVideo;
  /** Poster or OG image. A local path, or a remote URL for the mirror script. */
  image?: string;
  imageAlt?: string;
};

const CATALOG_PATH = join(process.cwd(), "data/discover-listings.json");
const CURATED_PATH = join(process.cwd(), "data/discover-curated.json");

/** The shape `sanitizeSignupSlug` accepts — a slug it would reject is a dead URL. */
const CURATED_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const YOUTUBE_ID_RE = /^[A-Za-z0-9_-]{11}$/;

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
 * Absent-is-legal is not laziness — it is the endgame. When the app-side seed
 * publishes these references itself, retiring this layer is emptying the file
 * and then deleting it, with no reader change and no build break in between.
 */
function readCuratedFile(): { listings: CuratedEntry[] } {
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
  return { listings: parsed.listings as CuratedEntry[] };
}

function bad(slug: string, why: string): never {
  throw new Error(`data/discover-curated.json — "${slug}": ${why}`);
}

/**
 * Fail loud, name the slug.
 *
 * Every check here guards something that would otherwise go quietly wrong
 * rather than loudly: a slug the app would reject is a URL nobody can reach, an
 * unknown category is a card the topic filter never matches, and a pasted watch
 * URL where an id belongs is a player that renders and never plays.
 */
function validateCuratedEntry(entry: CuratedEntry, categoryIds: Set<string>): void {
  const slug = entry?.slug ?? "(missing slug)";
  if (!entry?.slug || !CURATED_SLUG_RE.test(entry.slug)) bad(slug, "slug must be kebab-case");
  if (!entry.title?.trim()) bad(slug, "title is required");
  if (!entry.description?.trim()) bad(slug, "description is required");
  if (!entry.note?.trim()) bad(slug, "note is required — it is what makes the page ours");
  if (!categoryIds.has(entry.category)) {
    bad(slug, `category "${entry.category}" is not one the catalog knows`);
  }
  if (!(entry.resourceType in DISCOVER_RESOURCE_TYPE_NOUN)) {
    bad(slug, `resourceType "${entry.resourceType}" is not one Discover knows`);
  }
  if (!Number.isFinite(Date.parse(entry.listedAt))) bad(slug, "listedAt is not a date");

  const source = entry.source;
  if (!source?.name?.trim()) bad(slug, "source.name is required");
  if (!source.domain?.trim()) bad(slug, "source.domain is required");
  if (!source.attribution?.trim()) bad(slug, "source.attribution is required");
  for (const field of ["url", "homeUrl"] as const) {
    const value = source[field];
    if (!value || !(value.startsWith("https://") || value.startsWith("/"))) {
      bad(slug, `source.${field} must be an https:// URL or a site-relative path`);
    }
  }

  if (entry.resourceType === "video") {
    if (entry.video?.provider !== "youtube") bad(slug, "a video needs video.provider 'youtube'");
    if (!YOUTUBE_ID_RE.test(entry.video.id)) {
      bad(slug, `video.id "${entry.video.id}" is not an 11-character YouTube id`);
    }
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
 * A publisher's mark, but only if it is actually on disk.
 *
 * `npm run discover:sources` fetches these from the publisher's own domain and
 * any one of them can fail — a blocked favicon, a site that answers a build
 * agent differently. Resolving to null here is what makes the card draw its
 * initial tile instead of a broken image, so a missed fetch is a slightly
 * plainer card rather than a visible defect.
 */
function resolveSourceLogo(source: DiscoverSource): DiscoverSource {
  const logo = source.logo;
  if (!logo) return source;
  if (existsSync(join(process.cwd(), "public", logo.slice(1)))) return source;
  return { ...source, logo: null };
}

function expandCurated(entry: CuratedEntry): DiscoverListing {
  return {
    slug: entry.slug,
    kind: "resource",
    title: entry.title,
    description: entry.description,
    category: entry.category,
    /* The publisher *is* the author. This also drops their name into the card's
       `data-search` for free, so "bibleproject" finds these without the hub
       growing a third control it has no room for. */
    authorDisplayName: entry.source.name,
    installCount: 0,
    listedAt: new Date(entry.listedAt).toISOString(),
    preview: {
      official: false,
      sourceDomain: entry.source.domain,
      sourceSiteName: entry.source.name,
      sourceImage: resolveDiscoverImage(entry.slug, entry.image ?? null),
    },
    origin: "curated",
    installable: false,
    source: resolveSourceLogo(entry.source),
    resourceType: entry.resourceType,
    video: entry.video ?? null,
    note: entry.note,
    plateTone: discoverPlateTone(entry.slug),
  };
}

/**
 * Lift a seeded reference's publisher chrome out of `preview` and onto the row.
 *
 * `GET /api/discover/export` emits `preview` as whatever the seeder wrote, so a
 * curated reference the app now owns arrives with its whole lockup nested
 * inside it. Lifting it here means every consumer — the card, the listing page,
 * the JSON-LD — keeps reading `listing.source` and cannot tell the difference
 * between a row the app seeded and one `data/discover-curated.json` expanded.
 *
 * That equivalence is the point: it is what lets the curated file shrink to
 * mirrored artwork, and eventually to nothing, without a component edit.
 */
/**
 * Bring one of our own URLs back to a site-relative path.
 *
 * The app stores every source URL absolute, because `validateResourceUrl` — the
 * rule that governs what may be saved to a library — needs a real https URL
 * with a dotted host, and `/blog/…` is not one. That is right for the seven
 * Harvous guides *as library links*, and wrong for them as links on this page:
 * absolute would open harvous.com in a new tab from harvous.com, and would read
 * as drift against the curated file that still writes them relative.
 */
function localizeSourceUrl(url: string): string {
  if (!url.startsWith("https://harvous.com/")) return url;
  return url.slice("https://harvous.com".length);
}

function hydrateSynced(row: DiscoverListing): DiscoverListing {
  const preview = row.preview;
  if (!preview?.source) return row;
  const source = {
    ...preview.source,
    url: localizeSourceUrl(preview.source.url),
    homeUrl: localizeSourceUrl(preview.source.homeUrl),
  };
  return {
    ...row,
    source: resolveSourceLogo(source),
    resourceType: preview.resourceType ?? row.resourceType ?? null,
    video: preview.video ?? row.video ?? null,
    note: preview.note ?? row.note ?? null,
    plateTone: row.plateTone ?? discoverPlateTone(row.slug),
  };
}

function readCatalog(): CatalogFile {
  if (cache) return cache;

  const synced = readSyncedFile();
  const curated = readCuratedFile();
  const categoryIds = new Set(synced.categories.map((category) => category.id));

  const listings: DiscoverListing[] = synced.listings.map((row) =>
    hydrateSynced({ ...row, origin: "catalog" as const, installable: true }),
  );
  const bySlug = new Map(listings.map((listing) => [listing.slug, listing]));
  const seen = new Set<string>();

  for (const entry of curated.listings) {
    validateCuratedEntry(entry, categoryIds);
    if (seen.has(entry.slug)) bad(entry.slug, "listed twice in this file");
    seen.add(entry.slug);

    const existing = bySlug.get(entry.slug);
    if (existing) {
      /*
        The app-side seed has landed at this slug, which is the intended end
        state rather than an accident — so this path is quiet by default. The
        catalog row is the real one: it is installable, and the sync keeps it in
        step. The curated entry demotes to what the app cannot know, which is
        artwork living on this disk — the mirrored publisher mark, the mirrored
        poster, and the tone taken from that poster.

        What *is* worth saying out loud is a divergence: an author editing a
        title here, expecting it to show, when the synced row now wins. That
        edit belongs in the app's `curated-resources.ts`. Warned, never thrown —
        the synced file is rewritten by a bot every six hours and must not be
        able to break a build nobody started.
      */
      const owned = [
        ["title", entry.title, existing.title],
        ["description", entry.description, existing.description],
        ["category", entry.category, existing.category],
        ["note", entry.note, existing.note],
        ["source.url", entry.source.url, existing.source?.url],
      ] as const;
      const drifted = owned.filter(([, mine, theirs]) => theirs != null && mine !== theirs);
      if (drifted.length > 0) {
        console.warn(
          `[discover] "${entry.slug}" is in the synced catalog, so the app owns it now. ` +
            `These differ and the synced value wins: ${drifted.map(([f]) => f).join(", ")}. ` +
            "Edit src/data/curated-resources.ts in the app repo and re-seed.",
        );
      }

      const logo = resolveSourceLogo(entry.source).logo;
      if (existing.source && logo) existing.source = { ...existing.source, logo };
      else if (!existing.source) existing.source = resolveSourceLogo(entry.source);
      existing.resourceType = existing.resourceType ?? entry.resourceType;
      existing.video = existing.video ?? entry.video ?? null;
      existing.note = existing.note ?? entry.note;
      existing.plateTone = discoverPlateTone(entry.slug);
      existing.preview = {
        ...(existing.preview ?? {}),
        sourceImage:
          existing.preview?.sourceImage ?? resolveDiscoverImage(entry.slug, entry.image ?? null),
      };
      continue;
    }

    const expanded = expandCurated(entry);
    listings.push(expanded);
    bySlug.set(expanded.slug, expanded);
  }

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
  note: string;
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
    note: source.licence ?? `Free to ${verb.toLowerCase()}, and no account needed.`,
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
    if (!listing.installable) return { primary: out, secondary: null };
    return {
      primary: {
        href: buildInstallUrl(listing.slug),
        label: "Add to my Harvous",
        external: true,
        /* What actually happens, said plainly: the link is filed in your own
           library. Nothing of the publisher's is copied, which is both true and
           the thing their terms care about. */
        note: "Free. Saves the link to your library, ready when you are.",
      },
      secondary: out,
    };
  }

  if (listing.preview?.official) {
    return {
      primary: {
        href: buildInstallUrl(listing.slug),
        label: `Start a note from this ${DISCOVER_KIND_NOUN[listing.kind].toLowerCase()}`,
        external: true,
        note: "Free, and already in your templates — this opens it in Harvous.",
      },
      secondary: null,
    };
  }

  return {
    primary: {
      href: buildInstallUrl(listing.slug),
      label: "Save this to my Harvous",
      external: true,
      note: `Free. ${DISCOVER_KIND_BLURB[listing.kind]}`,
    },
    secondary: null,
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
