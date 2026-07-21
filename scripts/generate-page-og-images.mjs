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
import { icons as fa6Solid } from "@iconify-json/fa6-solid";
import { icons as fa6Regular } from "@iconify-json/fa6-regular";
import { icons as fa6Brands } from "@iconify-json/fa6-brands";

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
  "fa6-solid": fa6Solid,
  "fa6-regular": fa6Regular,
  "fa6-brands": fa6Brands,
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
      const icon = fm.match(/^icon:\s*"([^"]+)"/m)?.[1] ?? "fa6-solid:note-sticky";
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
