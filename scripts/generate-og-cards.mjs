#!/usr/bin/env node
/**
 * Page OG cards — one 1200×630 card per page that doesn't have a more specific
 * image of its own (a feature, a compare detail, a Discover listing already do).
 *
 * Each card is the closing card's look: an auth-hero sky with a soft white glow,
 * a small label and the page's own title centred in Google Sans Flex at the
 * site's heading weight, and the Harvous mark with harvous.com underneath. A
 * compare detail leads with Harvous's icon beside the other app's. The sky is
 * chosen from the page name, so neighbouring pages don't share one.
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
import "./_register-env-hook.mjs";

const { getCompareSeoPagesForBuild } = await import("../src/lib/compare-seo-pages.ts");
const { getCompareEntries } = await import("../src/lib/compare-data.ts");
const { getFeatureCategories } = await import("../src/lib/feature-categories-data.ts");
const { getAddonPages } = await import("../src/lib/addons-data.ts");
const { getUseCases, getUseCaseDisplayTitle } = await import("../src/lib/use-cases-data.ts");
const { getAudiences } = await import("../src/lib/for-audiences-data.ts");
const { getDiscoverListings, discoverListingIcon, DISCOVER_KIND_NOUN } = await import("../src/lib/discover-data.ts");
const { BLOG_CATEGORY_LABELS, BLOG_CATEGORY_ICONS } = await import("../src/lib/blog.ts");


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
    if (lum > 165) out.push(f);
  }
  return out;
}

const pick = (list, key) => list[createHash("sha1").update(key).digest().readUInt32BE(0) % list.length];

/* ── Pieces ──────────────────────────────────────────────────────────────── */

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function text(markup, font, width) {
  const { data, info } = await sharp({
    text: { text: markup, font, width, rgba: true, dpi: 72, wrap: "word", align: "centre" },
  })
    .png()
    .toBuffer({ resolveWithObject: true });
  return { input: data, width: info.width, height: info.height };
}

/* The closing card's light: a soft white glow in the middle of the sky. */
const glow = Buffer.from(
  `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"><defs>
  <radialGradient id="g" cx="50%" cy="48%" r="62%"><stop offset="0" stop-color="#fff" stop-opacity="0.86"/><stop offset="1" stop-color="#fff" stop-opacity="0.12"/></radialGradient>
  </defs><rect width="${W}" height="${H}" fill="url(#g)"/></svg>`,
);

/** An app icon with rounded corners and a hairline, for the "Harvous vs X" pair. */
async function roundIcon(path, size) {
  const r = Math.round(size * 0.24);
  return sharp(path)
    .resize(size, size, { fit: "cover" })
    .composite([
      { input: Buffer.from(`<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${r}" fill="#fff"/></svg>`), blend: "dest-in" },
      { input: Buffer.from(`<svg width="${size}" height="${size}"><rect x="0.5" y="0.5" width="${size - 1}" height="${size - 1}" rx="${r}" fill="none" stroke="#0f172a" stroke-opacity="0.08"/></svg>`) },
    ])
    .png()
    .toBuffer();
}

const titleSize = (t) => (t.length <= 24 ? 92 : t.length <= 44 ? 76 : t.length <= 64 ? 64 : 56);

async function render(target, skies, assets) {
  const dest = target.asDefault ? join(ROOT, "public/og.png") : join(ROOT, "public/og", `${target.name}.jpg`);
  const extra = target.asDefault ? [join(ROOT, "public/og", `${target.name}.jpg`)] : [];
  if (!FORCE && [dest, ...extra].every((p) => existsSync(p))) return "skip";

  const sky = pick(skies, target.name);
  /* About -0.022em, like the site's headings: pango counts in 1/1024 pt. */
  const size = titleSize(target.title);
  const title = await text(
    `<span foreground="${INK}" letter_spacing="${Math.round(-size * 0.022 * 1024)}">${esc(target.title)}</span>`,
    `${FONT} SemiBold ${size}`,
    920,
  );
  const kicker = await text(
    `<span foreground="${SOFT}" letter_spacing="4000">${esc(target.kicker.toUpperCase())}</span>`,
    `${FONT} SemiBold 22`,
    920,
  );

  /* Compare details lead with the two apps side by side. */
  const pair = target.logo ? [assets.pairMark, await roundIcon(target.logo, 76)] : null;
  const pairH = pair ? 76 + 28 : 0;

  const block = pairH + kicker.height + 22 + title.height;
  let y = Math.round((H - block) / 2) - 24;
  const layers = [{ input: glow }];
  if (pair) {
    const gap = 18;
    const x0 = Math.round((W - (76 * 2 + gap)) / 2);
    layers.push({ input: pair[0], left: x0, top: y }, { input: pair[1], left: x0 + 76 + gap, top: y });
    y += pairH;
  }
  layers.push({ input: kicker.input, left: Math.round((W - kicker.width) / 2), top: y });
  y += kicker.height + 22;
  layers.push({ input: title.input, left: Math.round((W - title.width) / 2), top: y });

  /* Footer: the mark and the address, centred. */
  const footW = 44 + 12 + assets.domain.width;
  const fx = Math.round((W - footW) / 2);
  const fy = H - 44 - 48;
  layers.push(
    { input: assets.mark, left: fx, top: fy },
    { input: assets.domain.input, left: fx + 56, top: fy + Math.round((44 - assets.domain.height) / 2) },
  );

  const card = sharp(join(ROOT, "public/images/auth-hero", sky)).resize(W, H, { fit: "cover", position: "centre" }).composite(layers);

  mkdirSync(join(ROOT, "public/og"), { recursive: true });
  const jpg = await card.clone().jpeg({ quality: 86, mozjpeg: true }).toBuffer();
  await sharp(jpg).toFile(join(ROOT, "public/og", `${target.name}.jpg`));
  if (target.asDefault) await sharp(jpg).png({ compressionLevel: 9 }).toFile(dest);
  return `${sky}`;
}

const skies = await lightSkies();
const appIcon = join(ROOT, "public/images/app-icon.webp");
const assets = {
  mark: await roundIcon(appIcon, 44),
  pairMark: await roundIcon(appIcon, 76),
  domain: await text(`<span foreground="${INK}" letter_spacing="-300">harvous.com</span>`, `${FONT} Medium 26`, 400),
};

let made = 0;
for (const t of TARGETS) {
  const r = await render(t, skies, assets);
  if (r !== "skip") {
    made++;
    console.log(`· ${t.name} ← ${r}`);
  }
}
console.log(`${made} card(s) written, ${TARGETS.length - made} up to date (${skies.length} light skies).`);
