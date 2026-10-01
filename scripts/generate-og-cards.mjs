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
 *
 * Names: <page> for the static pages; blog-<topic>; compare-<guide>;
 * vs-<app> (compare detail, badge = the app's own icon); feature-<slug>;
 * addon-<slug>; use-case-<slug>; for-<slug>; discover-<slug>; post-<slug>.
 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { readFileSync } from "node:fs";
import { icons as fa7Solid } from "@iconify-json/fa7-solid";
import { icons as fa7Regular } from "@iconify-json/fa7-regular";
import { icons as fa7Brands } from "@iconify-json/fa7-brands";
import "./_register-env-hook.mjs";

const { getCompareSeoPagesForBuild } = await import("../src/lib/compare-seo-pages.ts");
const { getCompareEntries } = await import("../src/lib/compare-data.ts");
const { getFeatureCategories } = await import("../src/lib/feature-categories-data.ts");
const { getAddonPages } = await import("../src/lib/addons-data.ts");
const { getUseCases, getUseCaseDisplayTitle } = await import("../src/lib/use-cases-data.ts");
const { getAudiences } = await import("../src/lib/for-audiences-data.ts");
const { getDiscoverListings, discoverListingIcon, DISCOVER_KIND_NOUN } = await import("../src/lib/discover-data.ts");
const { BLOG_CATEGORY_LABELS, BLOG_CATEGORY_ICONS } = await import("../src/lib/blog.ts");

const ICON_SETS = { "fa7-solid": fa7Solid, "fa7-regular": fa7Regular, "fa7-brands": fa7Brands };

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
  { name: "pricing", kicker: "Pricing", title: "Free to start. Plus when you want more.", icon: "tag" },
  { name: "v3", kicker: "Harvous 3", title: "Study you can follow and return to.", icon: "star" },
  { name: "discover", kicker: "Discover", title: "Bible study templates and resources.", icon: "compass" },
  { name: "blog", kicker: "Bright Enough", title: "Notes, habits, and teaching that show up after Sunday.", icon: "feather-pointed" },
];

/** "Best Notion alternative for Bible study notes — Harvous" → the part before the dash. */
const stripBrand = (t) => t.replace(/\s+[—–-]\s+Harvous$/i, "").trim();

const guides = getCompareSeoPagesForBuild().map((p) => ({
  name: `compare-${p.slug}`,
  kicker: "Compare",
  title: stripBrand(p.seoTitle),
  icon: "scale-balanced",
}));

const blogTopics = Object.entries(BLOG_CATEGORY_LABELS).map(([slug, label]) => ({
  name: `blog-${slug}`,
  kicker: "Bright Enough",
  title: label,
  icon: BLOG_CATEGORY_ICONS[slug],
}));

/** Compare detail: "Harvous vs Abide", with Abide's own icon in the badge. */
const vs = getCompareEntries().map((e) => ({
  name: `vs-${e.slug}`,
  kicker: "Compare",
  title: `Harvous vs ${e.name}`,
  icon: "fa7-solid:scale-balanced",
  logo: join(ROOT, "public/images/compare/icons", `${e.slug}.png`),
}));

const features = [
  ...getFeatureCategories().map((c) => ({
    name: `feature-${c.slug}`,
    kicker: "Features",
    title: c.title,
    icon: c.icon,
  })),
  ...readdirSync(join(ROOT, "src/content/features"))
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => {
      const fm = readFileSync(join(ROOT, "src/content/features", f), "utf8").match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
      if (/^draft:\s*true/m.test(fm)) return null;
      const tagline = fm.match(/^tagline:\s*"([^"]+)"/m)?.[1];
      const icon = fm.match(/^icon:\s*"([^"]+)"/m)?.[1];
      return tagline && icon ? { name: `feature-${f.replace(/\.mdx$/, "")}`, kicker: "Feature", title: tagline, icon } : null;
    })
    .filter(Boolean),
];

const addons = getAddonPages()
  .filter((a) => !a.draft)
  .map((a) => ({ name: `addon-${a.slug}`, kicker: "Harvous Plus", title: a.title, icon: a.icon }));

const useCases = getUseCases().map((u) => ({
  name: `use-case-${u.slug}`,
  kicker: "Use case",
  title: getUseCaseDisplayTitle(u),
  icon: u.icon,
}));

const audiences = getAudiences().map((a) => ({ name: `for-${a.slug}`, kicker: "Harvous for", title: a.title, icon: a.icon }));

const discover = getDiscoverListings().map((l) => ({
  name: `discover-${l.slug}`,
  kicker: `Discover · ${DISCOVER_KIND_NOUN[l.kind] ?? "Listing"}`,
  title: l.title,
  icon: discoverListingIcon(l),
}));

/** Blog posts: title on the sky, topic as the kicker. */
const posts = readdirSync(join(ROOT, "src/content/blog"))
  .filter((f) => /\.mdx?$/.test(f))
  .map((f) => {
    const fm = readFileSync(join(ROOT, "src/content/blog", f), "utf8").match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
    if (/^draft:\s*true/m.test(fm)) return null;
    const title = fm.match(/^title:\s*"((?:[^"\\]|\\.)*)"/m)?.[1]?.replace(/\\"/g, '"');
    const cat = fm.match(/^category:\s*([a-z-]+)/m)?.[1];
    if (!title || !cat) return null;
    return {
      name: `post-${f.replace(/\.mdx?$/, "")}`,
      kicker: BLOG_CATEGORY_LABELS[cat] ?? "Bright Enough",
      title,
      icon: BLOG_CATEGORY_ICONS[cat] ?? "fa7-solid:feather-pointed",
    };
  })
  .filter(Boolean);

const TARGETS = [
  ...PAGES,
  ...blogTopics,
  ...guides,
  ...vs,
  ...features,
  ...addons,
  ...useCases,
  ...audiences,
  ...discover,
  ...posts,
];

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

function badge(iconName, withGlyph = true) {
  const [set, name] = iconName.includes(":") ? iconName.split(":") : ["fa7-solid", iconName];
  const collection = ICON_SETS[set];
  const icon = collection?.icons?.[name];
  if (!icon) throw new Error(`Unknown icon: ${iconName}`);
  const size = 168;
  const glyph = 76;
  const unit = collection.width ?? 640;
  const body = withGlyph ? icon.body.replace(/currentColor/g, "#1f6fdb") : "";
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

/** White badge carrying an app's own icon (compare details), corners rounded to match. */
async function logoBadge(target) {
  const inner = 104;
  const logo = await sharp(target.logo)
    .resize(inner, inner, { fit: "cover" })
    .composite([
      {
        input: Buffer.from(`<svg width="${inner}" height="${inner}"><rect width="${inner}" height="${inner}" rx="26" fill="#fff"/></svg>`),
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();
  const pad = 24 + (168 - inner) / 2;
  return sharp(badge(target.icon, false)).composite([{ input: logo, left: pad, top: pad }]).png().toBuffer();
}

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
      { input: target.logo ? await logoBadge(target) : badge(target.icon), left: W - PAD - bs + 24, top: Math.round((H - bs) / 2) },
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
