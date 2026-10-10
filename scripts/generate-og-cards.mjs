#!/usr/bin/env node
/**
 * Page OG cards — 1200×630, set in Google Sans Flex by headless Chrome
 * (scripts/lib/chrome.mjs) at 2×. Three looks, all kept simple:
 *
 *  - Home keeps its own card: the hero as it stands, photographed from the
 *    running site, with the app icon in place of the nav.
 *  - Pages with content of their own (use cases, audiences, compare pages and
 *    guides, features, add-ons, Discover listings, blog topics and posts) get
 *    one frame: the Harvous lockup, the kicker and heading, and
 *    harvous.com/<path> on white to the left; on the right a rounded panel of
 *    sky with one object at its centre — the page's icon on a white tile, a
 *    compare page's two app icons, the apps a guide ranks. It's the shape the
 *    use-case, audience and compare pages already open with. The sky is the
 *    page's own where it has one, otherwise a light sky picked by name.
 *  - Every other page (About, FAQ, the legal pages…) gets the plain default:
 *    the homepage hero's sky with the app icon large at its centre.
 *
 * The home capture wants a production build (no Astro dev toolbar, final CSS):
 *
 *   npm run build && npm run preview -- --port 4322
 *   npm run og:cards -- --force --base=http://localhost:4322
 *
 * With nothing answering at --base, home is left as it is.
 *
 * Usage:
 *   npm run og:cards
 *   npm run og:cards -- --force
 *   npm run og:cards -- --force --only=about,vs-logos
 *
 * Output: public/og/<name>.jpg, plus public/og.png (the site-wide default).
 * Pages pick theirs up with ogCard("<name>") from src/lib/og-card.ts.
 *
 * Names: <page> for the static pages; blog-<topic>; compare-<guide>;
 * vs-<app> (compare detail); feature-<slug>; addon-<slug>; use-case-<slug>;
 * for-<slug>; discover-<slug>; post-<slug>.
 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import "./_register-env-hook.mjs";
import { launchChrome, publicUrl } from "./lib/chrome.mjs";

const { getCompareSeoPagesForBuild } = await import("../src/lib/compare-seo-pages.ts");
const { getCompareEntries, compareIconPng } = await import("../src/lib/compare-data.ts");
const { getFeatureCategories } = await import("../src/lib/feature-categories-data.ts");
const { getAddonPages } = await import("../src/lib/addons-data.ts");
const { getUseCases, getUseCaseDisplayTitle } = await import("../src/lib/use-cases-data.ts");
const { getAudiences } = await import("../src/lib/for-audiences-data.ts");
const { getDiscoverListings, discoverListingIcon, discoverListingInk, discoverTopicArt, DISCOVER_KIND_NOUN } = await import("../src/lib/discover-data.ts");
const { BLOG_CATEGORY_LABELS, BLOG_CATEGORY_ICONS } = await import("../src/lib/blog.ts");
const { backdropForImage } = await import("../src/lib/next/icon-backdrop.ts");

const ROOT = join(import.meta.dirname, "..");
const FORCE = process.argv.includes("--force");
const W = 1200;
const H = 630;
const INK = "#0d0e12";
const SOFT = "#585c66";
const FAINT = "#6b6f78";
const FONT = "Google Sans Flex";

/* The light skies (docs/BRAND_KIT.md); 053 is the homepage hero's. */
const SKIES = ["044", "045", "047", "050", "051", "053", "058", "072", "075", "076", "077"];
const HERO_SKY = "053";
const sky = (id) => `/images/auth-hero/ai_bg_${id}.webp`;
const pick = (list, key) => list[createHash("sha1").update(key).digest().readUInt32BE(0) % list.length];

/* The app's accent inks (src/styles/study-highlight-accent-colors.css), light
   theme (the first definition of each), for `var(--study-dock-accent-*)` values. */
const ACCENTS = Object.fromEntries(
  [...readFileSync(join(ROOT, "src/styles/study-highlight-accent-colors.css"), "utf8").matchAll(/--(study-dock-accent-[\w-]+):\s*(#[0-9a-f]{3,8})/gi)]
    .reverse()
    .map((m) => [m[1], m[2]]),
);
const inkOf = (v) => (v?.startsWith("var(") ? ACCENTS[v.slice(6, -1)] : v) || INK;

/** Static pages: the plain default, except home's own hero. */
const PAGES = [
  { name: "home", path: "/", asDefault: true, hero: true, hide: [".hero__watch"] },
  ...["about", "tour", "now", "support", "open-source", "faq", "privacy", "terms", "use-cases", "for", "compare", "release-notes", "pricing", "v3", "discover", "blog"].map(
    (name) => ({ name, plain: true }),
  ),
];

/** "Best Notion alternative for Bible study notes — Harvous" → the part before the dash. */
const stripBrand = (t) => t.replace(/\s+[—–-]\s+Harvous$/i, "").trim();
const competitors = new Map(getCompareEntries().map((e) => [e.slug, e]));
const iconFile = (slug) => join(ROOT, "public", compareIconPng(slug));

/** Guides: an alternative faces its target like a compare page; a shortlist shows the apps it ranks. */
const guides = await Promise.all(
  getCompareSeoPagesForBuild().map(async (p) => {
    const target = p.kind === "alternative" && competitors.has(p.targetSlug) ? p.targetSlug : null;
    const apps = p.pickSlugs.filter((s) => s !== "harvous" && competitors.has(s)).slice(0, 3);
    return {
      name: `compare-${p.slug}`,
      kicker: "Compare",
      title: stripBrand(p.seoTitle),
      path: `/compare/${p.slug}/`,
      ...(target
        ? { object: "pair", other: iconFile(target), sky: await backdropForImage(compareIconPng(target)) }
        : { object: "apps", apps: apps.map(iconFile) }),
    };
  }),
);

const blogTopics = Object.entries(BLOG_CATEGORY_LABELS).map(([slug, label]) => ({
  name: `blog-${slug}`,
  kicker: "Bright Enough",
  title: label,
  icon: BLOG_CATEGORY_ICONS[slug],
  path: `/blog/${slug}/`,
}));

/** Compare detail: the two icons on the sky the page itself uses. */
const vs = await Promise.all(
  getCompareEntries().map(async (e) => ({
    name: `vs-${e.slug}`,
    kicker: "Compare",
    title: `Harvous vs ${e.name}`,
    path: `/compare/${e.slug}/`,
    object: "pair",
    other: iconFile(e.slug),
    sky: await backdropForImage(compareIconPng(e.slug)),
  })),
);

const features = [
  ...getFeatureCategories().map((c) => ({ name: `feature-${c.slug}`, kicker: "Features", title: c.title, icon: c.icon, path: `/features/${c.slug}/` })),
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

/** Add-ons: their own sky and ink, like the home bento card each one matches. */
const addons = getAddonPages()
  .filter((a) => !a.draft)
  .map((a) => ({
    name: `addon-${a.slug}`,
    kicker: "Harvous Plus",
    title: a.title,
    icon: a.icon,
    ink: inkOf(a.ink),
    skyPath: a.image,
    path: `/add-ons/${a.slug}/`,
  }));

/** Use cases and audiences: their own sky and ink, as their pages open. */
const useCases = getUseCases().map((u) => ({
  name: `use-case-${u.slug}`,
  kicker: "Use case",
  title: getUseCaseDisplayTitle(u),
  icon: u.icon,
  ink: inkOf(u.ink),
  skyPath: u.image,
  path: `/use-cases/${u.slug}/`,
}));

const audiences = getAudiences().map((a) => ({
  name: `for-${a.slug}`,
  kicker: "Harvous for",
  title: a.title,
  icon: a.icon,
  ink: inkOf(a.ink),
  skyPath: a.image,
  path: `/for/${a.slug}/`,
}));

const discover = getDiscoverListings().map((l) => ({
  name: `discover-${l.slug}`,
  kicker: `Discover · ${DISCOVER_KIND_NOUN[l.kind] ?? "Listing"}`,
  title: l.title,
  icon: discoverListingIcon(l),
  ink: inkOf(discoverListingInk(l)),
  skyPath: discoverTopicArt(l.category) ?? undefined,
  path: `/discover/${l.slug}/`,
}));

/** Blog posts: the topic's icon on the post's own art. */
const posts = readdirSync(join(ROOT, "src/content/blog"))
  .filter((f) => /\.mdx?$/.test(f))
  .map((f) => {
    const fm = readFileSync(join(ROOT, "src/content/blog", f), "utf8").match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
    if (/^draft:\s*true/m.test(fm)) return null;
    const title = fm.match(/^title:\s*"((?:[^"\\]|\\.)*)"/m)?.[1]?.replace(/\\"/g, '"');
    const cat = fm.match(/^category:\s*([a-z-]+)/m)?.[1];
    if (!title || !cat) return null;
    const slug = f.replace(/\.mdx?$/, "");
    const art = `/blog-thumbs/${slug}-feat.webp`;
    return {
      name: `post-${slug}`,
      kicker: BLOG_CATEGORY_LABELS[cat] ?? "Bright Enough",
      title,
      icon: BLOG_CATEGORY_ICONS[cat] ?? "fa7-solid:feather-pointed",
      skyPath: existsSync(join(ROOT, "public", art)) ? art : undefined,
      path: `/blog/${slug}/`,
    };
  })
  .filter(Boolean);

/* --only=about,vs-logos renders just those (by name); handy while adjusting a template. */
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

/* ── Templates ───────────────────────────────────────────────────────────── */

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const dataUrl = (buf, type = "image/png") => `data:${type};base64,${buf.toString("base64")}`;
const file = (rel) => publicUrl(rel);
const MARK = file("/images/harvous-2-icon.png");

/** An fa7 icon as inline SVG ("fa7-solid:book-open", "fa7-regular:x" or a bare solid name). */
const iconSets = {};
function iconSvg(name, size, color) {
  const [set, id] = name.includes(":") ? name.split(":") : ["fa7-solid", name];
  iconSets[set] ??= JSON.parse(readFileSync(join(ROOT, "node_modules/@iconify-json", set, "icons.json"), "utf8"));
  const json = iconSets[set];
  const icon = json.icons[id] ?? json.icons[json.aliases?.[id]?.parent];
  if (!icon) return "";
  const w = icon.width ?? json.width ?? 512;
  const h = icon.height ?? json.height ?? 512;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${size}" height="${size}" style="color:${color};display:block">${icon.body}</svg>`;
}

/* The site's own type: Google Sans Flex from public/fonts, with the axes the
   pages set. This is the whole reason the cards go through Chrome. */
const CSS = `
  @font-face {
    font-family: "${FONT}";
    src: url("${publicUrl("/fonts/google-sans-flex/GoogleSansFlex-Variable.woff2")}") format("woff2-variations");
    font-weight: 100 1000;
    font-stretch: 25% 151%;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: #fff; }
  body {
    position: relative;
    font-family: "${FONT}", sans-serif;
    font-variation-settings: "wdth" 100, "ROND" 0;
    color: ${INK};
    -webkit-font-smoothing: antialiased;
    text-rendering: geometricPrecision;
  }
  /* The icon files are full squares; the app's own corners are drawn here. */
  .app { display: block; border-radius: 24%; }
  .lift { box-shadow: 0 2px 4px rgba(15,23,42,.06), 0 26px 50px -22px rgba(15,23,42,.45); }
  .sky { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }

  .lockup { position: absolute; left: 72px; top: 64px; display: flex; align-items: center; gap: 11px;
    font-size: 29px; font-weight: 600; letter-spacing: -0.03em; }
  .lockup .app { width: 34px; height: 34px; }
  .col { position: absolute; left: 72px; width: 476px; top: 128px; bottom: 112px;
    display: flex; flex-direction: column; justify-content: center; gap: 18px; }
  .kicker { font-size: 15px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: ${SOFT};
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  h1 { font-weight: 600; letter-spacing: -0.035em; line-height: 1.03; text-wrap: balance; }
  .url { position: absolute; left: 72px; bottom: 60px; font-size: 19px; font-weight: 500; color: ${FAINT}; }
  .url b { color: ${INK}; font-weight: 600; }

  .panel { position: absolute; left: 600px; top: 40px; width: 560px; height: 550px; border-radius: 30px; overflow: hidden;
    box-shadow: inset 0 0 0 1px rgba(15,23,42,.06); display: grid; place-items: center; }
  .obj { position: relative; display: flex; align-items: center; gap: 22px; }
  .tile { width: 132px; height: 132px; border-radius: 32px; background: #fff; display: grid; place-items: center; }
  .pair .app { width: 128px; height: 128px; }
  .vs { width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,.92); display: grid; place-items: center;
    font-size: 16px; font-weight: 600; color: ${SOFT}; }
  .apps { gap: 18px; }
  .apps .app { width: 92px; height: 92px; }
  .apps .app:first-child { width: 112px; height: 112px; }
`;

const titleSize = (t) => (t.length <= 18 ? 74 : t.length <= 34 ? 64 : t.length <= 54 ? 54 : t.length <= 74 ? 46 : 40);

function objectHtml(t) {
  switch (t.object) {
    case "pair":
      return `<div class="obj pair"><img class="app lift" src="${MARK}" alt=""><span class="vs lift">vs</span><img class="app lift" src="${dataUrl(readFileSync(t.other))}" alt=""></div>`;
    case "apps":
      return `<div class="obj apps"><img class="app lift" src="${MARK}" alt="">${t.apps.map((a) => `<img class="app lift" src="${dataUrl(readFileSync(a))}" alt="">`).join("")}</div>`;
    default:
      return `<div class="obj"><div class="tile lift">${iconSvg(t.icon, 60, t.ink ?? INK)}</div></div>`;
  }
}

/** A page with content of its own: words on the left, its object on a sky to the right. */
function cardHtml(t) {
  const ground = t.skyPath ?? sky(t.sky ?? pick(SKIES, t.name));
  const p = t.path.replace(/\/$/, "");
  return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}
    h1 { font-size: ${titleSize(t.title)}px; }
  </style></head><body>
    <div class="lockup"><img class="app" src="${MARK}" alt="">Harvous</div>
    <div class="col">
      <p class="kicker">${esc(t.kicker)}</p>
      <h1>${esc(t.title)}</h1>
    </div>
    <div class="url">harvous.com<b>${esc(p)}</b></div>
    <div class="panel"><img class="sky" src="${file(ground)}" alt="">${objectHtml(t)}</div>
  </body></html>`;
}

/** Everything else: the homepage hero's sky, the app icon large at its centre. */
function plainHtml() {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}
    body { display: grid; place-items: center; }
    .big { position: relative; width: 208px; height: 208px;
      box-shadow: 0 3px 6px rgba(15,23,42,.08), 0 40px 80px -30px rgba(15,23,42,.5); }
  </style></head><body>
    <img class="sky" src="${file(sky(HERO_SKY))}" alt="">
    <img class="app big" src="${MARK}" alt="">
  </body></html>`;
}

/* ── Home: the hero itself ───────────────────────────────────────────────── */

/** What a capture never shows: the nav, the sticky Try pill, Astro's dev toolbar, entrance animations. */
const PAGE_CLEANUP = `
  astro-dev-toolbar, .nxh, [data-sticky-try] { display: none !important; }
  [data-reveal], [data-reveal] > * { opacity: 1 !important; transform: none !important; transition: none !important; }
`;

async function heroShot(page, path, hide = []) {
  const res = await fetch(BASE + path).catch(() => null);
  if (!res?.ok) return null;
  await page.viewport(1200, H, 2);
  await page.goto(BASE + path);
  await page.css(PAGE_CLEANUP);
  /* Hidden but its top margin kept: the headline keeps its room, so the app
     doesn't ride up into the "actually" note, without pushing the app (and the
     Suggestion card) off the bottom of the card. */
  if (hide.length) await page.css(`${hide.join(", ")} { visibility: hidden !important; height: 1.75rem !important; overflow: hidden !important; }`);
  /* A 920px-wide slice, scaled up to 1200: the type reads a size larger than
     at desktop width, still above the hero's 56rem breakpoint. */
  const cw = 920;
  await page.viewport(cw, Math.round((cw * H) / W), (W * 2) / cw);
  /* The nav is hidden; the Harvous app icon stands in for it, centred above the headline. */
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

/* ── Render ──────────────────────────────────────────────────────────────── */

const BASE = (process.argv.find((a) => a.startsWith("--base="))?.slice(7) ?? "http://localhost:4321").replace(/\/$/, "");

async function write(target, img) {
  mkdirSync(join(ROOT, "public/og"), { recursive: true });
  /* 4:4:4 keeps colour edges on type sharp; the default 4:2:0 smears them. */
  const jpg = await img.clone().jpeg({ quality: 90, mozjpeg: true, chromaSubsampling: "4:4:4" }).toBuffer();
  writeFileSync(join(ROOT, "public/og", `${target.name}.jpg`), jpg);
  if (target.asDefault) await img.clone().png({ compressionLevel: 9 }).toFile(join(ROOT, "public/og.png"));
}

const chrome = await launchChrome();
await chrome.page.viewport(W, H, 2);
let site = null;
let plain = null;

let made = 0;
try {
  for (const t of TARGETS) {
    const dest = join(ROOT, "public/og", `${t.name}.jpg`);
    if (!FORCE && existsSync(dest) && (!t.asDefault || existsSync(join(ROOT, "public/og.png")))) continue;

    let img;
    if (t.hero) {
      if (!site) {
        site = await launchChrome();
        await site.page.reducedMotion();
      }
      img = await heroShot(site.page, t.path, t.hide);
      if (!img) {
        console.warn(`! ${BASE} isn't answering — ${t.name} left as it is.`);
        continue;
      }
    } else if (t.plain) {
      /* One picture for all of them; rendered once. */
      if (!plain) {
        await chrome.page.setContent(plainHtml());
        plain = await chrome.page.screenshot();
      }
      img = sharp(plain).resize(W, H, { kernel: "lanczos3" });
    } else {
      await chrome.page.setContent(cardHtml(t));
      img = sharp(await chrome.page.screenshot()).resize(W, H, { kernel: "lanczos3" });
    }
    await write(t, img);
    made++;
    console.log(`· ${t.name}`);
  }
} finally {
  await chrome.close();
  await site?.close();
}
console.log(`${made} card(s) written, ${TARGETS.length - made} up to date.`);
