#!/usr/bin/env node
/**
 * Compare OG images — recreate the on-page duel hero (grid + icon cards + “vs”).
 *
 * Downloads missing competitor icons from compare.csv, then writes
 * public/images/compare/og/{slug}.png at 1200×630.
 *
 * Usage:
 *   npm run og:compare
 *   npm run og:compare -- --force
 */

import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, extname } from "node:path";
import { pipeline } from "node:stream/promises";
import { get as httpsGet } from "node:https";
import { get as httpGet } from "node:http";
import sharp from "sharp";

const ROOT = join(import.meta.dirname, "..");
const CSV_PATH = join(ROOT, "data/compare.csv");
const OUT_DIR = join(ROOT, "public/images/compare/og");
const ICON_DIR = join(ROOT, "public/images/compare/icons");
const HARVOUS_ICON = join(ROOT, "public/images/harvous-2-icon.png");
const FORCE = process.argv.includes("--force");

const W = 1200;
const H = 630;
const GRID = 24;
const RULE = "#e8e9ed";
const INK_FAINT = "#8c8f99";
const WRAP = 200;
const ICON = 148;
const GAP = 48;
const VS_W = 56;

function parseCsvRows(text) {
  const rows = [];
  let row = [];
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

    if (ch === '"') inQuotes = true;
    else if (ch === ",") {
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

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? httpsGet : httpGet;
    lib(url, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchUrl(res.headers.location).then(resolve, reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`${url} → HTTP ${res.statusCode}`));
        return;
      }
      resolve(res);
    }).on("error", reject);
  });
}

function extFromUrl(url, contentType = "") {
  const pathExt = extname(new URL(url).pathname).toLowerCase();
  if ([".png", ".jpg", ".jpeg", ".webp", ".gif"].includes(pathExt)) return pathExt;
  if (contentType.includes("png")) return ".png";
  if (contentType.includes("webp")) return ".webp";
  if (contentType.includes("gif")) return ".gif";
  return ".jpg";
}

async function ensureCompetitorIcon(slug, imageRef) {
  if (!imageRef) throw new Error(`No competitor image for ${slug}`);

  if (imageRef.startsWith("/")) {
    const local = join(ROOT, "public", imageRef.slice(1));
    if (!existsSync(local)) throw new Error(`Missing local icon: ${imageRef}`);
    return local;
  }

  // Prefer any existing mirrored icon for this slug.
  for (const ext of [".png", ".jpg", ".jpeg", ".webp"]) {
    const candidate = join(ICON_DIR, `${slug}${ext}`);
    if (existsSync(candidate)) return candidate;
  }

  mkdirSync(ICON_DIR, { recursive: true });
  const res = await fetchUrl(imageRef);
  const chunks = [];
  for await (const chunk of res) chunks.push(chunk);
  const buf = Buffer.concat(chunks);
  const ext = extFromUrl(imageRef, res.headers["content-type"] ?? "");
  const dest = join(ICON_DIR, `${slug}${ext}`);
  // Normalize to PNG for consistent compositing.
  const pngDest = join(ICON_DIR, `${slug}.png`);
  await sharp(buf).resize(400, 400, { fit: "cover" }).png().toFile(pngDest);
  if (dest !== pngDest && existsSync(dest)) {
    // keep only png
  }
  return pngDest;
}

function gridSvg() {
  const line = "rgba(232,233,237,0.38)";
  return Buffer.from(
    `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <defs>
    <pattern id="g" width="${GRID}" height="${GRID}" patternUnits="userSpaceOnUse">
      <path d="M ${GRID} 0 L 0 0 0 ${GRID}" fill="none" stroke="${line}" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
</svg>`,
  );
}

function cardShadowSvg(size) {
  // Approximate --shadow-card under the white wrap.
  return Buffer.from(
    `<svg width="${size + 40}" height="${size + 40}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="s" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="#0f172a" flood-opacity="0.04"/>
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#0f172a" flood-opacity="0.10"/>
    </filter>
  </defs>
  <rect x="20" y="20" width="${size}" height="${size}" rx="20" ry="20" fill="#ffffff" filter="url(#s)"/>
</svg>`,
  );
}

function vsSvg() {
  return Buffer.from(
    `<svg width="${VS_W}" height="48" xmlns="http://www.w3.org/2000/svg">
  <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle"
    font-family="ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
    font-size="28" font-weight="600" letter-spacing="2.2"
    fill="${INK_FAINT}">vs</text>
</svg>`,
  );
}

async function roundedIcon(srcPath, size, radius) {
  const r = radius;
  const mask = Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="#fff"/>
</svg>`,
  );
  return sharp(srcPath)
    .resize(size, size, { fit: "cover" })
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();
}

async function iconCard(srcPath) {
  const shadow = await sharp(cardShadowSvg(WRAP)).png().toBuffer();
  const icon = await roundedIcon(srcPath, ICON, 14);
  const pad = Math.round((WRAP - ICON) / 2);
  // Shadow canvas is WRAP+40; place icon inside the white card area (offset 20 + pad).
  return sharp(shadow)
    .composite([{ input: icon, top: 20 + pad, left: 20 + pad }])
    .png()
    .toBuffer();
}

async function renderOg(slug, competitorIconPath) {
  const out = join(OUT_DIR, `${slug}.png`);
  if (!FORCE && existsSync(out)) return { slug, skipped: true };

  const harvousCard = await iconCard(HARVOUS_ICON);
  const competitorCard = await iconCard(competitorIconPath);
  const vs = await sharp(vsSvg()).png().toBuffer();

  const cardCanvas = WRAP + 40;
  const totalW = cardCanvas + GAP + VS_W + GAP + cardCanvas;
  const left0 = Math.round((W - totalW) / 2);
  const top0 = Math.round((H - cardCanvas) / 2);
  const vsLeft = left0 + cardCanvas + GAP;
  const vsTop = Math.round((H - 48) / 2);
  const rightLeft = vsLeft + VS_W + GAP;

  await sharp(gridSvg())
    .composite([
      { input: harvousCard, top: top0, left: left0 },
      { input: vs, top: vsTop, left: vsLeft },
      { input: competitorCard, top: top0, left: rightLeft },
    ])
    .png({ compressionLevel: 9 })
    .toFile(out);

  return { slug, out };
}

if (!existsSync(HARVOUS_ICON)) {
  console.error(`Missing Harvous icon: ${HARVOUS_ICON}`);
  process.exit(1);
}

const rows = parseCsvRows(readFileSync(CSV_PATH, "utf-8"));
const [headers, ...dataRows] = rows;
const slugIdx = headers.indexOf("Slug");
const imgIdx = headers.indexOf("Competitor app image");

mkdirSync(OUT_DIR, { recursive: true });

const results = [];
let failed = 0;

for (const row of dataRows) {
  const slug = row[slugIdx]?.trim();
  const imageRef = row[imgIdx]?.trim();
  if (!slug) continue;

  try {
    const iconPath = await ensureCompetitorIcon(slug, imageRef);
    results.push(await renderOg(slug, iconPath));
    const last = results[results.length - 1];
    console.log(last.skipped ? `· ${slug} (skipped)` : `✓ ${slug}`);
  } catch (err) {
    failed++;
    console.warn(`✗ ${slug}: ${err.message}`);
  }
}

const written = results.filter((r) => r.out).length;
const skipped = results.filter((r) => r.skipped).length;

writeFileSync(
  join(OUT_DIR, "manifest.json"),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      size: `${W}x${H}`,
      written,
      skipped,
      failed,
      style: "compare-hero-duel-v1",
    },
    null,
    2,
  ),
);

console.log(`\nCompare OG: ${written} written, ${skipped} skipped, ${failed} failed → ${OUT_DIR}`);
