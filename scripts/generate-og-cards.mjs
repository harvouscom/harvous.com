#!/usr/bin/env node
/**
 * Page OG cards — one 1200×630 card per page that doesn't have a more specific
 * image of its own (a feature, a compare detail, a Discover listing already do).
 *
 * Two looks, both set in Google Sans Flex by headless Chrome (scripts/lib/
 * chrome.mjs) at 2× — so the type has the site's axes, tracking and balanced
 * line breaks, which sharp/pango drawing it never did:
 *
 *  - Pages with UI to show (a `path` below) are photographed from the running
 *    site. Home is its hero as it stands; the rest get their own kicker and
 *    heading with their first UI visual (scene, plans, tiles, sky frame…)
 *    rising beneath, the homepage hero's shape. Copy comes off the live page,
 *    so it can't drift from it.
 *  - Everything else is the closing card's look: an auth-hero sky with a soft
 *    white glow, a small label and the title centred, and the Harvous mark with
 *    harvous.com underneath. A compare detail leads with Harvous's icon beside
 *    the other app's. The sky is chosen from the page name.
 *
 * Captures want a production build (no Astro dev toolbar, final CSS):
 *
 *   npm run build && npm run preview -- --port 4322
 *   npm run og:cards -- --force --base=http://localhost:4322
 *
 * With no site answering at --base (default http://localhost:4321), the UI
 * pages fall back to sky cards. The output is committed, like blog:thumbs.
 *
 * Usage:
 *   npm run og:cards
 *   npm run og:cards -- --force
 *   npm run og:cards -- --force --only=home,pricing
 *
 * Output: public/og/<name>.jpg, plus public/og.png (the site-wide default).
 * Pages pick theirs up with ogCard("<name>") from src/lib/og-card.ts.
 *
 * Names: <page> for the static pages; blog-<topic>; compare-<guide>;
 * vs-<app> (compare detail, badge = the app's own icon); feature-<slug>;
 * addon-<slug>; use-case-<slug>; for-<slug>; discover-<slug>; post-<slug>.
 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { readFileSync } from "node:fs";
import "./_register-env-hook.mjs";
import { launchChrome, publicUrl } from "./lib/chrome.mjs";

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
  { name: "home", kicker: "Bible study notes", title: "A study Bible that remembers.", icon: "book-open", asDefault: true, path: "/", hero: true, hide: [".hero__watch"] },
  { name: "about", kicker: "About", title: "Made by one person with a Bible and too many notes.", icon: "user" },
  { name: "tour", kicker: "Tour", title: "How Harvous works.", icon: "compass", path: "/tour/" },
  { name: "now", kicker: "Now", title: "What I'm working on right now.", icon: "pen-nib" },
  { name: "support", kicker: "Support", title: "Help, from the person who built it.", icon: "life-ring" },
  { name: "open-source", kicker: "Open source", title: "Made in the open.", icon: "code-branch" },
  { name: "faq", kicker: "FAQ", title: "Guaranteed questions, short answers.", icon: "circle-question" },
  { name: "privacy", kicker: "Legal", title: "Privacy Policy", icon: "shield-halved" },
  { name: "terms", kicker: "Legal", title: "Terms of Service", icon: "file-contract" },
  { name: "use-cases", kicker: "Use cases", title: "However you study.", icon: "layer-group", path: "/use-cases/" },
  { name: "for", kicker: "Who it's for", title: "Who Harvous is for.", icon: "users" },
  { name: "compare", kicker: "Compare", title: "Harvous next to the apps you already use.", icon: "scale-balanced", path: "/compare/" },
  { name: "release-notes", kicker: "Release notes", title: "What's new in Harvous.", icon: "clock-rotate-left" },
  { name: "pricing", kicker: "Pricing", title: "Free to study. Plus to keep going.", icon: "tag", path: "/pricing/" },
  { name: "v3", kicker: "Harvous 3", title: "Study you can follow and return to.", icon: "star", path: "/3/" },
  { name: "discover", kicker: "Discover", title: "Bible study templates and resources.", icon: "compass", path: "/discover/" },
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
    path: `/features/${c.slug}/`,
  })),
  ...readdirSync(join(ROOT, "src/content/features"))
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => {
      const fm = readFileSync(join(ROOT, "src/content/features", f), "utf8").match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
      if (/^draft:\s*true/m.test(fm)) return null;
      const tagline = fm.match(/^tagline:\s*"([^"]+)"/m)?.[1];
      const icon = fm.match(/^icon:\s*"([^"]+)"/m)?.[1];
      const slug = f.replace(/\.mdx$/, "");
      return tagline && icon ? { name: `feature-${slug}`, kicker: "Feature", title: tagline, icon, path: `/features/${slug}/` } : null;
    })
    .filter(Boolean),
];

const addons = getAddonPages()
  .filter((a) => !a.draft)
  .map((a) => ({ name: `addon-${a.slug}`, kicker: "Harvous Plus", title: a.title, icon: a.icon, path: `/add-ons/${a.slug}/` }));

const useCases = getUseCases().map((u) => ({
  name: `use-case-${u.slug}`,
  kicker: "Use case",
  title: getUseCaseDisplayTitle(u),
  icon: u.icon,
  path: `/use-cases/${u.slug}/`,
}));

const audiences = getAudiences().map((a) => ({ name: `for-${a.slug}`, kicker: "Harvous for", title: a.title, icon: a.icon, path: `/for/${a.slug}/` }));

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

/* --only=home,pricing renders just those (by name); handy while adjusting a template. */
const ONLY = process.argv.find((a) => a.startsWith("--only="))?.slice(7).split(",");

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
].filter((t) => !ONLY || ONLY.includes(t.name));

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

/* ── Templates ───────────────────────────────────────────────────────────── */

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const dataUrl = (buf, type = "image/png") => `data:${type};base64,${buf.toString("base64")}`;

/* The site's own type: Google Sans Flex from public/fonts, with the axes the
   pages set. This is the whole reason the cards go through Chrome. */
const BASE_CSS = `
  @font-face {
    font-family: "${FONT}";
    src: url("${publicUrl("/fonts/google-sans-flex/GoogleSansFlex-Variable.woff2")}") format("woff2-variations");
    font-weight: 100 1000;
    font-stretch: 25% 151%;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: ${W}px; height: ${H}px; overflow: hidden; }
  body {
    position: relative;
    font-family: "${FONT}", sans-serif;
    font-variation-settings: "wdth" 100, "ROND" 0;
    color: ${INK};
    -webkit-font-smoothing: antialiased;
    text-rendering: geometricPrecision;
  }
  .kicker {
    font-size: 17px;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: ${SOFT};
  }
  h1 {
    font-weight: 560;
    letter-spacing: -0.03em;
    line-height: 1.02;
    text-wrap: balance;
  }
`;

const titleSize = (t) => (t.length <= 24 ? 96 : t.length <= 44 ? 80 : t.length <= 64 ? 66 : 58);

/** The closing card's look: a sky, a soft white glow, the title, and the mark with harvous.com. */
function skyCard(target, sky, mark) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${BASE_CSS}
  .sky { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .glow { position: absolute; inset: 0; background: radial-gradient(62% 62% at 50% 48%, rgba(255,255,255,0.86), rgba(255,255,255,0.12)); }
  .body {
    position: absolute; inset: 0 0 92px;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 0 ${PAD}px; text-align: center; gap: 22px;
  }
  h1 { max-width: 980px; font-size: ${titleSize(target.title)}px; }
  .pair { display: flex; gap: 18px; margin-bottom: 6px; }
  .pair img, .foot img { display: block; border-radius: 24%; box-shadow: 0 0 0 1px rgba(15,23,42,0.08); }
  .pair img { width: 76px; height: 76px; }
  .foot {
    position: absolute; left: 0; right: 0; bottom: 48px;
    display: flex; align-items: center; justify-content: center; gap: 12px;
    font-size: 26px; font-weight: 500; letter-spacing: -0.01em;
  }
  .foot img { width: 44px; height: 44px; }
</style></head><body>
  <img class="sky" src="${publicUrl(`/images/auth-hero/${sky}`)}" alt="">
  <div class="glow"></div>
  <div class="body">
    ${target.logo ? `<div class="pair"><img src="${mark}" alt=""><img src="${dataUrl(readFileSync(target.logo))}" alt=""></div>` : ""}
    <p class="kicker">${esc(target.kicker)}</p>
    <h1>${esc(target.title)}</h1>
  </div>
  <div class="foot"><img src="${mark}" alt="">harvous.com</div>
</body></html>`;
}

/**
 * A page's own heading with its own UI rising beneath it — the homepage hero's
 * shape, for pages that have something to show. `title` keeps the page's line
 * breaks; `visual` is a 2× capture of the element, `vw` its CSS width.
 */
function stageCard({ kicker, title, visual, vw, bg }) {
  const width = Math.min(vw, 1040);
  const size = titleSize(title.replace(/\n/g, " ")) - 8;
  return `<!doctype html><html><head><meta charset="utf-8"><style>${BASE_CSS}
  body { background: ${bg}; display: flex; flex-direction: column; align-items: center; text-align: center; }
  .kicker { margin-top: 60px; }
  h1 { margin-top: 16px; max-width: 1040px; font-size: ${size}px; }
  .visual { margin-top: 44px; width: ${width}px; flex: none; }
  .visual img { display: block; width: 100%; height: auto; }
</style></head><body>
  ${kicker ? `<p class="kicker">${esc(kicker)}</p>` : `<div style="height:${60 - 16}px"></div>`}
  <h1>${title.split("\n").map(esc).join("<br>")}</h1>
  <div class="visual"><img src="${visual}" alt=""></div>
</body></html>`;
}

/* ── Live pages ──────────────────────────────────────────────────────────── */

/** What a capture never shows: the nav, the sticky Try pill, Astro's dev toolbar, entrance animations. */
const PAGE_CLEANUP = `
  astro-dev-toolbar, .nxh, [data-sticky-try] { display: none !important; }
  [data-reveal], [data-reveal] > * { opacity: 1 !important; transform: none !important; transition: none !important; }
`;

/** First element on a page that is the page's UI picture, in priority order. */
const VISUALS = [
  ".price-plans", ".chs__stage", ".cs__stage", ".sv", ".sapp", ".dx-grid", ".cmp-grid", ".uc-grid",
  /* Use-case and audience pages: the sky frame with its icon, under the title. */
  ".ud-sky__frame", ".fa-sky__frame",
];
/** The small label over a heading — a kicker, or the badge the detail pages use instead. */
const KICKERS = ".nx-kicker, .ud-badge, .fa-badge";

async function openPage(page, path) {
  const res = await fetch(BASE + path).catch(() => null);
  if (!res?.ok) return false;
  await page.viewport(1200, H, 2);
  await page.goto(BASE + path);
  if (await page.eval(`!!document.querySelector("vite-error-overlay")`)) return false;
  await page.css(PAGE_CLEANUP);
  return true;
}

/** Home: the hero itself, as it stands — headline, then the app rising beneath it. */
async function heroShot(page, path, hide = []) {
  if (!(await openPage(page, path))) return null;
  /* Hidden but its top margin kept: the headline keeps its room, so the app
     doesn't ride up into the "actually" note, without pushing the app (and the
     Suggestion card) off the bottom of the card. */
  if (hide.length) await page.css(`${hide.join(", ")} { visibility: hidden !important; height: 1.75rem !important; overflow: hidden !important; }`);
  /* A 920px-wide slice, scaled up to 1200: the type reads a size larger than
     at desktop width, still above the hero's 56rem breakpoint. */
  const cw = 920;
  await page.viewport(cw, Math.round((cw * H) / W), (W * 2) / cw);
  /* The nav is hidden (PAGE_CLEANUP); the Harvous app icon stands in for it,
     centred above the headline. */
  const top = await page.eval(`(async () => {
    const h = document.querySelector("h1");
    const mark = new Image();
    mark.src = "/images/harvous-2-icon.webp";
    mark.alt = "";
    mark.style.cssText = "display:block;width:44px;height:44px;margin:0 auto 14px;border-radius:11px;box-shadow:0 6px 16px -8px rgba(15,23,42,.35)";
    h.parentElement.insertBefore(mark, h);
    await mark.decode().catch(() => {});
    return mark.getBoundingClientRect().top + scrollY;
  })()`);
  const png = await page.screenshot({ x: 0, y: Math.max(0, top - 28), width: cw, height: Math.round((cw * H) / W) });
  return sharp(png).resize(W, H, { kernel: "lanczos3" });
}

/** Any other page: its kicker and heading, plus a capture of its first UI visual. */
async function stageShot(page, target, chrome) {
  if (!(await openPage(page, target.path))) return null;
  const found = await page.eval(`(() => {
    const h1 = document.querySelector("main h1, h1");
    const el = ${JSON.stringify(target.visual ? [target.visual] : VISUALS)}
      .map((s) => document.querySelector(s)).find((e) => e && e.getBoundingClientRect().height > 80);
    if (!h1 || !el) return null;
    const scope = h1.closest("header, section") ?? h1.parentElement;
    const k = scope.querySelector(${JSON.stringify(KICKERS)});
    const r = el.getBoundingClientRect();
    return {
      kicker: k && k.compareDocumentPosition(h1) & Node.DOCUMENT_POSITION_FOLLOWING ? k.innerText.trim() : null,
      title: h1.innerText.trim(),
      bg: getComputedStyle(document.body).backgroundColor,
      rect: { x: r.left, y: r.top + scrollY, width: r.width, height: Math.min(r.height, 900) },
    };
  })()`);
  if (!found) return null;
  /* Narrow visuals (the 4:5 scenes) would sit small under the title: shoot
     them at a higher scale so they can be shown larger and stay sharp. */
  const zoom = Math.max(1, Math.min(2, 720 / found.rect.width));
  const visual = await page.screenshot(found.rect, zoom);
  await chrome.page.setContent(
    stageCard({ ...found, kicker: found.kicker ?? target.kicker, visual: dataUrl(visual), vw: found.rect.width * zoom }),
  );
  return sharp(await chrome.page.screenshot()).resize(W, H, { kernel: "lanczos3" });
}

/* ── Render ──────────────────────────────────────────────────────────────── */

const BASE = (process.argv.find((a) => a.startsWith("--base="))?.slice(7) ?? "http://localhost:4321").replace(/\/$/, "");

async function siteUp() {
  try {
    const res = await fetch(BASE + "/", { signal: AbortSignal.timeout(5000) });
    return res.ok;
  } catch {
    return false;
  }
}

async function write(target, img) {
  mkdirSync(join(ROOT, "public/og"), { recursive: true });
  /* 4:4:4 keeps colour edges on type sharp; the default 4:2:0 smears them. */
  const jpg = await img.clone().jpeg({ quality: 90, mozjpeg: true, chromaSubsampling: "4:4:4" }).toBuffer();
  writeFileSync(join(ROOT, "public/og", `${target.name}.jpg`), jpg);
  if (target.asDefault) await img.clone().png({ compressionLevel: 9 }).toFile(join(ROOT, "public/og.png"));
}

const skies = await lightSkies();
const mark = dataUrl(await sharp(join(ROOT, "public/images/harvous-2-icon.png")).resize(152, 152).png().toBuffer());
const live = await siteUp();
if (!live) {
  console.warn(
    `! ${BASE} isn't answering — pages with UI get sky cards this run.\n` +
      `  For the real thing: npm run build && npm run preview, then npm run og:cards -- --force`,
  );
}

const chrome = await launchChrome();
await chrome.page.viewport(W, H, 2);
const site = live ? await launchChrome() : null;
if (site) await site.page.reducedMotion();

let made = 0;
try {
  for (const t of TARGETS) {
    const dest = join(ROOT, "public/og", `${t.name}.jpg`);
    if (!FORCE && existsSync(dest) && (!t.asDefault || existsSync(join(ROOT, "public/og.png")))) continue;

    let img = null;
    let how = "";
    if (site && t.path) {
      img = t.hero ? await heroShot(site.page, t.path, t.hide) : await stageShot(site.page, t, chrome);
      how = img ? (t.hero ? `hero ${t.path}` : `stage ${t.path}`) : "";
    }
    if (!img) {
      const sky = pick(skies, t.name);
      await chrome.page.setContent(skyCard(t, sky, mark));
      img = sharp(await chrome.page.screenshot()).resize(W, H, { kernel: "lanczos3" });
      how = sky;
    }
    await write(t, img);
    made++;
    console.log(`· ${t.name} ← ${how}`);
  }
} finally {
  await chrome.close();
  await site?.close();
}
console.log(`${made} card(s) written, ${TARGETS.length - made} up to date (${skies.length} light skies).`);
