#!/usr/bin/env node
/**
 * Page OG cards — one 1200×630 card per page that doesn't have a more specific
 * image of its own (a feature, a compare detail, a Discover listing already do).
 *
 * Each card is a pale auth-hero sky, the Harvous mark, the page's own title set
 * large in Google Sans Flex, and a white badge carrying the section's icon. The
 * sky is chosen from the page name, so neighbouring pages don't share one.
 *
 * Needs Google Sans Flex installed locally (the text is drawn by sharp/pango),
 * so this runs on a machine, and the output is committed — like blog:thumbs.
 *
 * Usage:
 *   npm run og:cards
 *   npm run og:cards -- --force
 *
 * Output: public/og/<name>.jpg, plus public/og.png (the site-wide default).
 * Pages pick theirs up with ogCard("<name>") from src/lib/og-card.ts.
 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { icons as fa7Solid } from "@iconify-json/fa7-solid";
import { getCompareSeoPagesForBuild } from "../src/lib/compare-seo-pages.ts";

const ROOT = join(import.meta.dirname, "..");
const FORCE = process.argv.includes("--force");
const W = 1200;
const H = 630;
const PAD = 72;
const INK = "#0d0e12";
const SOFT = "#4b4f5c";
const FONT = "Google Sans Flex";

/** Static pages. `icon` is an fa7-solid name. */
const PAGES = [
  { name: "home", kicker: "Bible study notes", title: "A study Bible that remembers.", icon: "book-open", asDefault: true },
  { name: "about", kicker: "About", title: "Made by one person with a Bible and too many notes.", icon: "user" },
  { name: "tour", kicker: "Tour", title: "How Harvous works.", icon: "compass" },
  { name: "now", kicker: "Now", title: "What I'm working on right now.", icon: "pen-nib" },
  { name: "support", kicker: "Support", title: "Help, from the person who built it.", icon: "life-ring" },
  { name: "privacy", kicker: "Legal", title: "Privacy Policy", icon: "shield-halved" },
  { name: "terms", kicker: "Legal", title: "Terms of Service", icon: "file-contract" },
  { name: "use-cases", kicker: "Use cases", title: "However you study.", icon: "layer-group" },
  { name: "for", kicker: "Who it's for", title: "Who Harvous is for.", icon: "users" },
  { name: "compare", kicker: "Compare", title: "Harvous next to the apps you already use.", icon: "scale-balanced" },
  { name: "release-notes", kicker: "Release notes", title: "What's new in Harvous.", icon: "clock-rotate-left" },
  { name: "blog", kicker: "Bright Enough", title: "Notes, habits, and teaching that show up after Sunday.", icon: "feather-pointed" },
  // One per blog topic (labels and icons mirror src/lib/blog.ts).
  { name: "blog-study-habits", kicker: "Bright Enough", title: "Study habits", icon: "lines-leaning" },
  { name: "blog-how-we-think", kicker: "Bright Enough", title: "How I think", icon: "lightbulb" },
  { name: "blog-scripture-study", kicker: "Bright Enough", title: "Scripture study", icon: "book-bible" },
  { name: "blog-using-harvous", kicker: "Bright Enough", title: "Using Harvous", icon: "compass" },
  { name: "blog-teaching", kicker: "Bright Enough", title: "Teaching", icon: "chalkboard-user" },
  { name: "blog-retention", kicker: "Bright Enough", title: "Retention", icon: "arrows-rotate" },
  { name: "blog-equipping", kicker: "Bright Enough", title: "Equipping", icon: "seedling" },
];

/** "Best Notion alternative for Bible study notes — Harvous" → the part before the dash. */
const stripBrand = (t) => t.replace(/\s+[—–-]\s+Harvous$/i, "").trim();

const guides = getCompareSeoPagesForBuild().map((p) => ({
  name: `compare-${p.slug}`,
  kicker: "Compare",
  title: stripBrand(p.seoTitle),
  icon: "scale-balanced",
}));

const TARGETS = [...PAGES, ...guides];

/* ── Skies ───────────────────────────────────────────────────────────────── */

async function lightSkies() {
  const dir = join(ROOT, "public/images/auth-hero");
  const files = readdirSync(dir).filter((f) => /^ai_bg_\d+\.webp$/.test(f)).sort();
  const out = [];
  for (const f of files) {
    const { channels } = await sharp(join(dir, f)).resize(64, 64).stats();
    const lum = 0.2126 * channels[0].mean + 0.7152 * channels[1].mean + 0.0722 * channels[2].mean;
    if (lum > 178) out.push(f);
  }
  return out;
}

const pick = (list, key) => list[createHash("sha1").update(key).digest().readUInt32BE(0) % list.length];

/* ── Pieces ──────────────────────────────────────────────────────────────── */

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function text(markup, font, width) {
  const { data, info } = await sharp({
    text: { text: markup, font, width, rgba: true, dpi: 72, wrap: "word" },
  })
    .png()
    .toBuffer({ resolveWithObject: true });
  return { input: data, width: info.width, height: info.height };
}

function badge(iconName) {
  const icon = fa7Solid.icons[iconName];
  if (!icon) throw new Error(`Unknown fa7-solid icon: ${iconName}`);
  const size = 168;
  const glyph = 76;
  const unit = fa7Solid.width ?? 640;
  const body = icon.body.replace(/currentColor/g, "#1f6fdb");
  const pad = (size - glyph) / 2;
  return Buffer.from(
    `<svg width="${size + 48}" height="${size + 48}" viewBox="0 0 ${size + 48} ${size + 48}" xmlns="http://www.w3.org/2000/svg">
  <defs><filter id="s" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="8" stdDeviation="14" flood-color="#0f172a" flood-opacity="0.16"/></filter></defs>
  <rect x="24" y="24" width="${size}" height="${size}" rx="42" fill="#ffffff" filter="url(#s)"/>
  <g transform="translate(${24 + pad} ${24 + pad}) scale(${glyph / unit})">${body}</g>
</svg>`,
  );
}

const scrim = Buffer.from(
  `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"><defs>
  <linearGradient id="g" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0.9"/><stop offset="0.55" stop-color="#fff" stop-opacity="0.55"/><stop offset="1" stop-color="#fff" stop-opacity="0.12"/></linearGradient>
  </defs><rect width="${W}" height="${H}" fill="url(#g)"/></svg>`,
);

const titleSize = (t) => (t.length <= 26 ? 104 : t.length <= 44 ? 84 : t.length <= 64 ? 70 : 60);

async function render(target, skies, mark) {
  const dest = target.asDefault ? join(ROOT, "public/og.png") : join(ROOT, "public/og", `${target.name}.jpg`);
  const extra = target.asDefault ? [join(ROOT, "public/og", `${target.name}.jpg`)] : [];
  if (!FORCE && [dest, ...extra].every((p) => existsSync(p))) return "skip";

  const sky = pick(skies, target.name);
  const maxW = 780;

  const size = titleSize(target.title);
  const title = await text(
    `<span foreground="${INK}" letter_spacing="-1500">${esc(target.title)}</span>`,
    `${FONT} Bold ${size}`,
    maxW,
  );
  const kicker = await text(
    `<span foreground="${SOFT}" letter_spacing="3500">${esc(target.kicker.toUpperCase())}</span>`,
    `${FONT} SemiBold 26`,
    maxW,
  );
  const word = await text(`<span foreground="${INK}" letter_spacing="-400">Harvous</span>`, `${FONT} Bold 34`, 400);

  const bottom = H - PAD;
  const titleTop = Math.max(170, bottom - title.height);
  const kickerTop = titleTop - kicker.height - 22;
  const bs = 168 + 48;

  const card = sharp(join(ROOT, "public/images/auth-hero", sky))
    .resize(W, H, { fit: "cover", position: "centre" })
    .composite([
      { input: scrim },
      { input: mark, left: PAD, top: PAD - 4 },
      { input: word.input, left: PAD + 68, top: PAD + 2 },
      { input: kicker.input, left: PAD, top: kickerTop },
      { input: title.input, left: PAD, top: titleTop },
      { input: badge(target.icon), left: W - PAD - bs + 24, top: Math.round((H - bs) / 2) },
    ]);

  mkdirSync(join(ROOT, "public/og"), { recursive: true });
  const jpg = await card.clone().jpeg({ quality: 86, mozjpeg: true }).toBuffer();
  await sharp(jpg).toFile(join(ROOT, "public/og", `${target.name}.jpg`));
  if (target.asDefault) await sharp(jpg).png({ compressionLevel: 9, palette: false }).toFile(dest);
  return `${sky}`;
}

const skies = await lightSkies();
const mark = await sharp(join(ROOT, "public/images/app-icon.webp")).resize(56, 56).png().toBuffer();

let made = 0;
for (const t of TARGETS) {
  const r = await render(t, skies, mark);
  if (r !== "skip") {
    made++;
    console.log(`· ${t.name} ← ${r}`);
  }
}
console.log(`${made} card(s) written, ${TARGETS.length - made} up to date (${skies.length} light skies).`);
