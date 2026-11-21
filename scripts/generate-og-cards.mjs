#!/usr/bin/env node
/**
 * Page OG cards — 1200×630 photographs of each page's own hero, taken by
 * headless Chrome (scripts/lib/chrome.mjs) from the built site, with the nav
 * and the floating Try pill hidden. No templates: what a link shows is what
 * the page shows, so a card can't fall behind the page it stands for.
 *
 *   npm run build
 *   npm run og:cards -- --force
 *   npm run og:cards -- --force --only=home,addon-child-notebooks
 *
 * Which pages: every page in dist/ whose og:image is /og/<name>.jpg (pages
 * pick theirs with ogCard("<name>") from src/lib/og-card.ts). Where several
 * pages share a name — every release note uses release-notes — the shortest
 * path is the one photographed. Home also writes public/og.png, the
 * site-wide default.
 *
 * The cards live in public/, so a build after this run ships them.
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, relative, sep } from "node:path";
import sharp from "sharp";
import { launchChrome, ROOT } from "./lib/chrome.mjs";

const W = 1200;
const H = 630;
/* The page is laid out this wide, then scaled up to 1200: type reads a size
   larger than at desktop width, still above the heroes' 56rem breakpoints. */
const CW = 1040;
const heightAt = (cw) => Math.round((cw * H) / W);
/* Room left above the hero's first line once the nav is gone. */
const HEADROOM = 44;
/* A hero taller than the card is shrunk to fit, its side margins extended —
   but not past this many card heights, where its type would get too small. */
const MAX_SHRINK = 1.95;

const FORCE = process.argv.includes("--force");
const ONLY = process.argv.find((a) => a.startsWith("--only="))?.slice(7).split(",");
const DIST = join(ROOT, "dist");
const OUT = join(ROOT, "public/og");

/**
 * Per-card overrides. Home's app picture is taller than any card, so it is
 * laid out narrow and cropped from the top, the app running off the bottom,
 * as it does in a browser; its walkthrough pill only works on the live page.
 */
const OVERRIDES = { home: { width: 920, crop: "top", hide: [".hero__watch"] } };

/* ── Pages ───────────────────────────────────────────────────────────────── */

if (!existsSync(join(DIST, "index.html"))) {
  console.error("No dist/ — run `npm run build` first.");
  process.exit(1);
}

function* htmlFiles(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) yield* htmlFiles(p);
    else if (f === "index.html") yield p;
  }
}

/** name → path, shortest path wins. */
const byName = new Map();
for (const file of htmlFiles(DIST)) {
  const name = readFileSync(file, "utf8").match(/<meta property="og:image" content="[^"]*\/og\/([\w-]+)\.jpg(?:\?[^"]*)?"/)?.[1];
  if (!name) continue;
  const path = "/" + relative(DIST, file).split(sep).slice(0, -1).map((s) => s + "/").join("");
  const had = byName.get(name);
  if (!had || path.length < had.length) byName.set(name, path);
}

const TARGETS = [...byName]
  .map(([name, path]) => ({ name, path }))
  .filter((t) => !ONLY || ONLY.includes(t.name))
  .sort((a, b) => a.path.localeCompare(b.path));

/* ── A static server over dist/ ──────────────────────────────────────────── */

const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".webp": "image/webp", ".avif": "image/avif", ".gif": "image/gif", ".ico": "image/x-icon", ".woff2": "font/woff2",
  ".mp4": "video/mp4", ".webm": "video/webm", ".vtt": "text/vtt", ".txt": "text/plain", ".xml": "application/xml",
};

const server = createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  let f = join(DIST, p);
  if (!f.startsWith(DIST)) return res.writeHead(403).end();
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, "index.html");
  else if (!existsSync(f)) f = join(f, "index.html");
  if (!existsSync(f)) return res.writeHead(404).end();
  res.writeHead(200, { "content-type": TYPES[extname(f)] ?? "application/octet-stream" });
  res.end(readFileSync(f));
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const BASE = `http://127.0.0.1:${server.address().port}`;

/* ── The photograph ──────────────────────────────────────────────────────── */

/** What a card never shows: the nav, the sticky Try pill, Astro's dev toolbar, entrance animations. */
const CLEANUP = `
  astro-dev-toolbar, .nxh, [data-sticky-try] { display: none !important; }
  [data-reveal], [data-reveal] > * { opacity: 1 !important; transform: none !important; transition: none !important; }
  /* A Discover listing's publisher artwork (video poster, page image): never on
     a card, which would put their picture on our URL in somebody else's feed. */
  .dvideo__poster, .dl-ref__image, .dl-link__image { visibility: hidden !important; }
`;

/**
 * The hero, measured in document pixels:
 *
 *  - top: the highest visible thing at or above the h1 — a crumb, a kicker,
 *    the blog's row of icons — ignoring anything full-bleed (skies, washes),
 *    which starts at the top of the page whatever the hero does.
 *  - text: the bottom of the hero's words and buttons.
 *  - pic: the hero's picture, if it has one near the words — the first large,
 *    not-full-bleed image or painted panel below the h1 (the compare pair's
 *    sky, a use case's panel, the child notebook's stage), before any h2/h3.
 *  - The hero's end is tagged data-og-cut so a card can leave out what
 *    follows: the picture, or else the section that starts at the next h2/h3
 *    (climbed to the outermost box that doesn't hold the h1, so its kicker
 *    goes with it).
 */
const MEASURE = `(() => {
  const h1 = document.querySelector("main h1, h1");
  if (!h1) return { top: 0, text: 0, pic: null, cut: false };
  const visible = (el, r) => {
    if (r.width < 2 || r.height < 2) return false;
    const s = getComputedStyle(el);
    return s.visibility !== "hidden" && +s.opacity !== 0 && s.position !== "fixed" && s.display !== "none";
  };
  const doc = (r) => ({ top: r.top + scrollY, bottom: r.bottom + scrollY });
  const h = doc(h1.getBoundingClientRect());

  let pic = null;
  let end = null;
  for (const el of document.body.querySelectorAll("main *")) {
    if (!(h1.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) || h1.contains(el)) continue;
    const r = el.getBoundingClientRect();
    /* A heading after the h1 starts the next section: the hero had no picture. */
    if (el.matches("h2, h3") && visible(el, r)) {
      end = el;
      while (end.parentElement && end.parentElement !== document.body && !end.parentElement.contains(h1)) end = end.parentElement;
      break;
    }
    if (r.height < 120 || r.width < 200 || r.width > innerWidth * 0.98 || !visible(el, r)) continue;
    const s = getComputedStyle(el);
    const painted = s.backgroundImage !== "none" || s.boxShadow !== "none" || !/^(transparent|rgba\\(.*,\\s*0\\))$/.test(s.backgroundColor);
    if (!el.matches("img, svg, picture, video, canvas") && !painted) continue;
    pic = { el, ...doc(r) };
    break;
  }
  /* Not the hero's if it starts more than a card's height below the h1. */
  if (pic && pic.top - h.bottom > innerHeight) pic = null;
  const cut = pic ? pic.el : end;
  const stop = cut ? cut.getBoundingClientRect().top + scrollY : Infinity;

  let top = h.top;
  let text = h.bottom;
  for (const el of document.body.querySelectorAll("*")) {
    if (el.children.length && !el.matches("img, svg, picture, video, button, a")) continue;
    if (el.closest("svg") && !el.matches("svg")) continue;
    if (cut && (cut.contains(el) || el.contains(cut))) continue;
    const r = el.getBoundingClientRect();
    if (r.width > innerWidth * 0.9 || !visible(el, r)) continue;
    const d = doc(r);
    if (d.top >= 0 && d.top < top) top = d.top;
    if (d.top >= h.bottom && d.bottom > text && d.bottom <= stop && d.top < h.bottom + innerHeight / 2) text = d.bottom;
  }
  cut?.setAttribute("data-og-cut", "");
  return { top, text, pic: pic && { top: pic.top, bottom: pic.bottom }, cut: !!cut };
})()`;

async function load(page, t, cw) {
  await page.viewport(cw, heightAt(cw), (W * 2) / cw);
  await page.goto(BASE + t.path);
  await page.css(CLEANUP);
  /* Hidden but its room kept, so the hero below it doesn't ride up. */
  const hide = OVERRIDES[t.name]?.hide;
  if (hide) await page.css(`${hide.join(", ")} { visibility: hidden !important; }`);
  await page.eval("new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))");
  return page.eval(MEASURE);
}

/**
 * The whole hero — words and picture — on the card:
 *
 *  - no picture: the words centred alone, the next section left out;
 *  - a picture that fits: words and picture centred together;
 *  - one up to MAX_SHRINK cards tall: the hero shrunk to the card's height,
 *    the page's own side margins stretched out to fill its width;
 *  - taller still: the picture left out and the words centred alone, rather
 *    than a sliver of it running off the bottom.
 */
async function shoot(page, t) {
  const o = OVERRIDES[t.name] ?? {};
  const cw = o.width ?? CW;
  const ch = heightAt(cw);
  const m = await load(page, t, cw);
  const shot = (y, h = ch) => page.screenshot({ x: 0, y: Math.max(0, Math.round(y)), width: cw, height: Math.round(h) });
  const card = (png) => sharp(png).resize(W, H, { kernel: "lanczos3" });

  if (o.crop === "top" || (!m.pic && !m.cut)) return card(await shot(m.top - HEADROOM));

  if (m.pic) {
    const tall = m.pic.bottom - m.top + 2 * HEADROOM;
    t.fit = (tall / ch).toFixed(2);
    if (tall <= ch) return card(await shot((m.top + m.pic.bottom) / 2 - ch / 2));

    if (tall <= ch * MAX_SHRINK) {
      const fitted = await sharp(await shot(m.top - HEADROOM, tall)).resize({ height: H * 2, kernel: "lanczos3" }).toBuffer();
      const { width } = await sharp(fitted).metadata();
      const side = (W * 2 - width) / 2;
      const wide = await sharp(fitted).extend({ left: Math.floor(side), right: Math.ceil(side), extendWith: "copy" }).toBuffer();
      return card(wide);
    }
  }

  /* The cut and everything after it, so nothing below the words is left in half. */
  await page.eval(`(() => {
    for (let el = document.querySelector("[data-og-cut]"); el && el !== document.body; el = el.parentElement) {
      if (el.contains(document.querySelector("h1"))) break;
      for (let n = el; n; n = n.nextElementSibling) n.style.setProperty("visibility", "hidden", "important");
    }
  })()`);
  return card(await shot(Math.min(m.top - HEADROOM, (m.top + m.text) / 2 - ch / 2)));
}

async function write(t, img) {
  mkdirSync(OUT, { recursive: true });
  /* 4:4:4 keeps colour edges on type sharp; the default 4:2:0 smears them. */
  writeFileSync(join(OUT, `${t.name}.jpg`), await img.clone().jpeg({ quality: 90, mozjpeg: true, chromaSubsampling: "4:4:4" }).toBuffer());
  if (t.name === "home") await img.clone().png({ compressionLevel: 9 }).toFile(join(ROOT, "public/og.png"));
}

const chrome = await launchChrome();
await chrome.page.reducedMotion();
let made = 0;
try {
  for (const t of TARGETS) {
    if (!FORCE && existsSync(join(OUT, `${t.name}.jpg`))) continue;
    await write(t, await shoot(chrome.page, t));
    made++;
    console.log(`· ${t.name}  ${t.path}${t.fit ? `  (hero ${t.fit}× a card)` : ""}`);
  }
} finally {
  await chrome.close();
  server.close();
}
console.log(`${made} card(s) written, ${TARGETS.length - made} up to date.`);
