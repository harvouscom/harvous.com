#!/usr/bin/env node
/**
 * Page OG images — auth-hero (or feature tint) + centered icon badge at 1200×630.
 *
 * Mirrors the use-case / for / product hero art on detail pages.
 *
 * Usage:
 *   npm run og:pages
 *   npm run og:pages -- --force
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, basename } from "node:path";
import sharp from "sharp";
import { icons as fa7Solid } from "@iconify-json/fa7-solid";
import { icons as fa7Regular } from "@iconify-json/fa7-regular";
import { icons as fa7Brands } from "@iconify-json/fa7-brands";

const ROOT = join(import.meta.dirname, "..");
const FORCE = process.argv.includes("--force");
const W = 1200;
const H = 630;

const INK_HEX = {
  "--study-dock-accent-neutral": "#9e9e9e",
  "--study-dock-accent-warmAmber": "#f2cf13",
  "--study-dock-accent-skyBlue": "#30a8db",
  "--study-dock-accent-violet": "#9d5ac7",
  "--study-dock-accent-mintGreen": "#2bc71e",
  "--study-dock-accent-coralRose": "#eb598e",
  "--study-dock-accent-teal": "#1a9e96",
};

const ICON_SETS = {
  "fa7-solid": fa7Solid,
  "fa7-regular": fa7Regular,
  "fa7-brands": fa7Brands,
};

/** @type {{ kind: string; slug: string; image?: string; icon: string; ink: string; tint?: boolean; outRel: string }[]} */
const targets = [];

function resolveInk(ink) {
  const m = ink.match(/var\((--study-dock-accent-[a-zA-Z]+)\)/);
  if (m && INK_HEX[m[1]]) return INK_HEX[m[1]];
  if (ink.startsWith("#")) return ink;
  return "#30a8db";
}

function mixTint(hex, amount = 0.18) {
  const n = hex.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  const mix = (c) => Math.round(c * amount + 255 * (1 - amount));
  return `#${[mix(r), mix(g), mix(b)].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function parseDataObjects(filePath) {
  const text = readFileSync(filePath, "utf8");
  const blocks = text.split(/\n\s*\{\s*\n/).slice(1);
  const items = [];
  for (const block of blocks) {
    const end = block.indexOf("\n  },");
    const body = end === -1 ? block : block.slice(0, end);
    const slug = body.match(/slug:\s*"([^"]+)"/)?.[1];
    const image = body.match(/image:\s*"([^"]+)"/)?.[1];
    const icon = body.match(/icon:\s*"([^"]+)"/)?.[1];
    const ink = body.match(/ink:\s*"([^"]+)"/)?.[1];
    if (slug && icon && ink) items.push({ slug, image, icon, ink });
  }
  return items;
}

function parseFeatureMdx() {
  const dir = join(ROOT, "src/content/features");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((file) => {
      const text = readFileSync(join(dir, file), "utf8");
      const fm = text.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
      if (/draft:\s*true/.test(fm)) return null;
      const slug = basename(file, ".mdx");
      const image = fm.match(/^image:\s*"([^"]+)"/m)?.[1];
      const icon = fm.match(/^icon:\s*"([^"]+)"/m)?.[1] ?? "fa7-solid:note-sticky";
      const ink = fm.match(/^ink:\s*"([^"]+)"/m)?.[1] ?? "var(--study-dock-accent-skyBlue)";
      return { slug, image, icon, ink, tint: true };
    })
    .filter(Boolean);
}

function iconSvg(iconName, color) {
  const [set, name] = iconName.split(":");
  const collection = ICON_SETS[set];
  const icon = collection?.icons?.[name];
  if (!icon) throw new Error(`Unknown icon: ${iconName}`);
  const size = collection.width ?? 512;
  const body = icon.body.replace(/currentColor/g, color);
  // Badge: 136px square, 28px radius, white card; icon ~64px inside.
  const badge = 136;
  const iconPx = 64;
  const pad = (badge - iconPx) / 2;
  const scale = iconPx / size;
  return Buffer.from(
    `<svg width="${badge}" height="${badge}" viewBox="0 0 ${badge} ${badge}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="s" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="6" flood-color="#0f172a" flood-opacity="0.12"/>
    </filter>
  </defs>
  <rect x="0" y="0" width="${badge}" height="${badge}" rx="28" ry="28" fill="#ffffff" filter="url(#s)"/>
  <g transform="translate(${pad} ${pad}) scale(${scale})">${body}</g>
</svg>`,
  );
}

async function renderTarget(t) {
  const outAbs = join(ROOT, "public", t.outRel.replace(/^\//, ""));
  mkdirSync(join(outAbs, ".."), { recursive: true });
  if (!FORCE && existsSync(outAbs)) return { slug: t.slug, skipped: true };

  const ink = resolveInk(t.ink ?? "var(--study-dock-accent-skyBlue)");

  let base;
  if (t.tint || !t.image) {
    base = sharp({
      create: {
        width: W,
        height: H,
        channels: 3,
        background: mixTint(ink, 0.18),
      },
    });
  } else {
    const src = join(ROOT, "public", t.image.replace(/^\//, ""));
    if (!existsSync(src)) throw new Error(`Missing image for ${t.slug}: ${t.image}`);
    base = sharp(src).resize(W, H, { fit: "cover", position: "centre" });
  }

  // Soft vignette like the on-page hero overlay.
  const overlay = Buffer.from(
    `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#0d0e12" stop-opacity="0.08"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
</svg>`,
  );

  const layers = [{ input: overlay, top: 0, left: 0 }];
  if (t.icon) {
    const badge = iconSvg(t.icon, ink);
    layers.push({
      input: await sharp(badge).png().toBuffer(),
      top: Math.round((H - 136) / 2),
      left: Math.round((W - 136) / 2),
    });
  }

  await base
    .composite(layers)
    .webp({ quality: 86 })
    .toFile(outAbs);

  return { slug: t.slug, out: t.outRel };
}

// Use cases
for (const item of parseDataObjects(join(ROOT, "src/lib/use-cases-data.ts"))) {
  if (!item.image) continue;
  targets.push({
    ...item,
    kind: "use-case",
    outRel: `/images/use-cases/og/${item.slug}.webp`,
  });
}

// For audiences
for (const item of parseDataObjects(join(ROOT, "src/lib/for-audiences-data.ts"))) {
  if (!item.image) continue;
  targets.push({
    ...item,
    kind: "for",
    outRel: `/images/for/og/${item.slug}.webp`,
  });
}

// Add-ons (photo + badge when image exists; otherwise tint + badge like features)
for (const item of parseDataObjects(join(ROOT, "src/lib/addons-data.ts"))) {
  targets.push({
    ...item,
    kind: "addon",
    tint: !item.image,
    outRel: `/images/add-ons/og/${item.slug}.webp`,
  });
}

// Features (tint + icon, matching on-page hero)
// Feature categories share the features OG folder — same tint + badge treatment,
// and the same shape (slug/image/icon/ink) the other data files use.
for (const item of parseDataObjects(join(ROOT, "src/lib/feature-categories-data.ts"))) {
  targets.push({
    kind: "feature",
    ...item,
    tint: true,
    outRel: `/images/features/og/${item.slug}.webp`,
  });
}

for (const item of parseFeatureMdx()) {
  targets.push({
    ...item,
    kind: "feature",
    outRel: `/images/features/og/${item.slug}.webp`,
  });
}

// Pricing hub — hero photo only (no icon badge on that page)
targets.push({
  kind: "pricing",
  slug: "pricing",
  image: "/images/auth-hero/ai_bg_072.webp",
  ink: "var(--study-dock-accent-skyBlue)",
  outRel: "/images/pricing/og.webp",
});

// Harvous 3 release page — Activity's own ink, since that's the release's headline change
targets.push({
  kind: "release",
  slug: "3",
  image: "/images/auth-hero/ai_bg_053.webp",
  ink: "var(--pill-note)",
  outRel: "/images/3/og.webp",
});

/*
 * Discover — the hub and a card per listing.
 *
 * Every one of these fell back to the site-wide /og.png, which is the least
 * useful thing to hand a share of a specific study method.
 *
 * A listing's art is its **topic's**, never the publisher's. Category ids are
 * use-case slugs (`discover-categories.ts` says so), so the wash and ink come
 * from the same use-case page the on-page card borrows them from. Putting a
 * BibleProject frame on a harvous.com OG card would be our URL wearing their
 * artwork in somebody else's feed — a claim about authorship we do not want to
 * make, and the one case where matching the on-page treatment would be wrong.
 *
 * The three overrides below mirror `TOPIC_ART_FALLBACK` / `TOPIC_INK_FALLBACK`
 * in `src/lib/discover-data.ts`. Duplicated rather than imported because this
 * is a plain node script and cannot read the .ts module — the same trade
 * `INK_HEX` above already makes against the CSS.
 */
const DISCOVER_TOPIC_ART = {
  "teaching-prep": "/images/auth-hero/ai_bg_060.webp",
  "deep-study": "/images/auth-hero/ai_bg_076.webp",
  /* The one place this deliberately parts from `TOPIC_ART_FALLBACK`, where
     Reference is null. On the hub that null is the point — a grey card among
     coloured ones reads as a shelf. Alone in a feed at 1200×630 it is a nearly
     white rectangle that reads as an image that failed to load. So Reference
     borrows a `DOCUMENT_ART` plate, which is already this codebase's answer to
     "a resource with no picture of its own", and keeps its neutral ink. */
  reference: "/images/auth-hero/ai_bg_059.webp",
};
const DISCOVER_TOPIC_INK = {
  "teaching-prep": "var(--study-dock-accent-warmAmber)",
  reference: "var(--study-dock-accent-neutral)",
  "deep-study": "var(--study-dock-accent-violet)",
};
const DISCOVER_KIND_ICON = {
  template: "fa7-solid:list-check",
  note: "fa7-solid:note-sticky",
  pack: "fa7-solid:arrow-right-arrow-left",
  resource: "fa7-solid:newspaper",
};
/* Mirrors `RESOURCE_TYPE_ICON` in `src/lib/discover-data.ts` — this is a plain
   node script and cannot import that .ts module, so the two are kept in step
   by hand. Update both when a resourceType's glyph changes. */
const DISCOVER_RESOURCE_TYPE_ICON = {
  video: "fa7-solid:play",
  tool: "fa7-solid:magnifying-glass",
  book: "fa7-solid:book-open",
  series: "fa7-solid:layer-group",
};

{
  const useCases = new Map(
    parseDataObjects(join(ROOT, "src/lib/use-cases-data.ts")).map((item) => [item.slug, item]),
  );

  const readListings = (path) => {
    if (!existsSync(join(ROOT, path))) return [];
    return JSON.parse(readFileSync(join(ROOT, path), "utf8")).listings ?? [];
  };

  targets.push({
    kind: "discover",
    slug: "discover",
    image: "/images/auth-hero/ai_bg_046.webp",
    icon: "fa7-solid:layer-group",
    ink: "var(--study-dock-accent-skyBlue)",
    outRel: "/images/discover/og.webp",
  });

  const synced = readListings("data/discover-listings.json");
  const curated = readListings("data/discover-curated.json");
  const seen = new Set();

  /* Synced first: once the app seeds a reference it owns the category, and the
     curated file is only still listing it to supply artwork. */
  for (const listing of [...synced, ...curated]) {
    if (seen.has(listing.slug)) continue;
    seen.add(listing.slug);

    const topic = listing.category;
    const art =
      topic && topic in DISCOVER_TOPIC_ART
        ? DISCOVER_TOPIC_ART[topic]
        : (useCases.get(topic)?.image ?? null);
    const ink =
      (topic && DISCOVER_TOPIC_INK[topic]) ||
      useCases.get(topic)?.ink ||
      "var(--study-dock-accent-neutral)";

    /* A curated resource's icon follows its resourceType, the way its card
       does. `resourceType` only exists on curated rows; a synced one falls
       through to its kind. */
    const icon =
      DISCOVER_RESOURCE_TYPE_ICON[listing.resourceType] ??
      DISCOVER_KIND_ICON[listing.kind] ??
      DISCOVER_KIND_ICON.note;

    targets.push({
      kind: "discover",
      slug: listing.slug,
      image: art ?? undefined,
      /* Reference has no artwork on purpose — the grey shelf. Tint carries it. */
      tint: !art,
      icon,
      ink,
      outRel: `/images/discover/og/${listing.slug}.webp`,
    });
  }
}

const results = [];
for (const t of targets) {
  results.push(await renderTarget(t));
}

const written = results.filter((r) => r.out);
const skipped = results.filter((r) => r.skipped);

writeFileSync(
  join(ROOT, "public/images/page-og-manifest.json"),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      size: `${W}x${H}`,
      count: targets.length,
      targets: targets.map((t) => ({ kind: t.kind, slug: t.slug, out: t.outRel })),
    },
    null,
    2,
  ),
);

console.log(
  `Page OG images: ${written.length} written, ${skipped.length} skipped (use --force to rebuild). Total ${targets.length}.`,
);
