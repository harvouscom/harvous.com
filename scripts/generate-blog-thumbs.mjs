#!/usr/bin/env node
/**
 * Blog thumbnail generator — atmospheric shaders from auth-hero only.
 *
 * Takes the same pool as use-case / audience cards (`public/images/auth-hero`)
 * and rebuilds each post thumb with gradients, blur layers, duotone, and grain.
 * Each category has a preferred source tone pack (plus grade colors); mood still
 * prefers light, with darker sources when fade/loss/retention fits.
 * No app screenshots. Not a straight photo crop.
 *
 * Usage:
 *   npm run blog:thumbs
 *   npm run blog:thumbs -- --force
 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, basename } from "node:path";
import sharp from "sharp";

const ROOT = join(import.meta.dirname, "..");
const BLOG_DIR = join(ROOT, "src/content/blog");
const AUTH_HERO_DIR = join(ROOT, "public/images/auth-hero");
const OUT_DIR = join(ROOT, "public/blog-thumbs");
const MANIFEST_PATH = join(OUT_DIR, "manifest.json");
const RECIPE_VERSION = "shader-v14";

/** Form motifs — bold enough to read at 360×360 spots; all directional / geometric. */
const SHAPE_KINDS = [
  "streak",
  "arc",
  "wedge",
  "bars",
  "rings",
  "slash",
  "corner",
  "split",
  "plume",
];

/**
 * Hard pins when a post should always get a specific motif.
 * Prefer meaning over randomness (e.g. highlight posts → bars/rectangles).
 */
const SHAPE_BY_SLUG = {
  "highlights-you-can-find": "bars",
  "start-with-scripture-pills": "rings",
  "start-with-threads": "streak",
  "the-five-minute-capture": "bars",
  "the-monday-retention-loop": "rings",
  "why-church-education-evaporates-by-monday": "plume",
  "why-bible-study-thoughts-disappear": "plume",
  "asking-better-questions-in-class-and-group": "wedge",
  "when-pdfs-arent-a-trail": "split",
  "notes-first-vs-ai-that-studies-for-you": "slash",
  "the-lesson-prep-stack": "corner",
  "prep-a-lesson-that-leaves-a-trail": "streak",
  "one-place-for-the-trail": "streak",
  "handoff-without-amnesia": "arc",
  "what-church-education-systems-need": "split",
  "teaching-through-a-book": "arc",
  "sermon-series-to-small-group-follow-up": "plume",
  "what-proverbs-25-2-taught-me": "arc",
  "tools-help-humans-teach": "wedge",
};

/** Category fallback pools when no slug/keyword rule hits. */
const SHAPE_BY_CATEGORY = {
  teaching: ["corner", "wedge", "streak"],
  retention: ["rings", "plume", "arc"],
  equipping: ["split", "arc", "corner"],
  "study-habits": ["bars", "streak", "rings"],
  "using-harvous": ["bars", "rings", "streak"],
  "how-we-think": ["slash", "arc", "wedge"],
  "scripture-study": ["rings", "arc", "streak"],
};

const FORCE = process.argv.includes("--force");

/** Category duotone pairs (deep → mid → highlight). Keep deep tones rich, never near-black. */
const CATEGORY_GRADE = {
  "study-habits": { a: "#3d6b38", b: "#c9e3b8", c: "#f6ecd6" },
  "how-we-think": { a: "#2a5a9e", b: "#c2dcf8", c: "#ffffff" },
  "scripture-study": { a: "#6b3a8e", b: "#dec5ed", c: "#f3c8e0" },
  "using-harvous": { a: "#3a4a6e", b: "#c2dcf8", c: "#e8e9ed" },
  teaching: { a: "#5a3a8e", b: "#d4c2f8", c: "#f0eaf8" },
  retention: { a: "#3d6b38", b: "#c9e3b8", c: "#c2dcf8" },
  equipping: { a: "#a84528", b: "#fbc8ad", c: "#dec5ed" },
};

/**
 * Preferred auth-hero basenames per category — a tone pack that loves that grade.
 * Pool is mostly warm photography; cool packs lean light/green fields that take blue/mint washes.
 * Mood (light/dark) still filters inside the pack.
 */
const CATEGORY_SOURCE_PACK = {
  "how-we-think": [
    // cool / airy — blue grade reads clean
    "ai_bg_053.webp",
    "ai_bg_051.webp",
    "ai_bg_058.webp",
    "ai_bg_044.webp",
    "ai_bg_045.webp",
  ],
  teaching: [
    // lilac / purple-friendly lights
    "ai_bg_053.webp",
    "ai_bg_051.webp",
    "ai_bg_058.webp",
    "ai_bg_044.webp",
    "ai_bg_045.webp",
  ],
  retention: [
    // deeper + green-leaning for fade / return
    "ai_bg_052.webp",
    "ai_bg_058.webp",
    "ai_bg_046.webp",
    "ai_bg_074.webp",
    "ai_bg_060.webp",
    "ai_bg_061.webp",
  ],
  equipping: [
    // warm peach / clay
    "ai_bg_045.webp",
    "ai_bg_047.webp",
    "ai_bg_059.webp",
    "ai_bg_072.webp",
    "ai_bg_050.webp",
    "ai_bg_073.webp",
  ],
  "study-habits": [
    // mint / soft green
    "ai_bg_058.webp",
    "ai_bg_052.webp",
    "ai_bg_044.webp",
    "ai_bg_053.webp",
    "ai_bg_061.webp",
  ],
  "using-harvous": [
    // soft slate-sky companions
    "ai_bg_053.webp",
    "ai_bg_051.webp",
    "ai_bg_045.webp",
    "ai_bg_072.webp",
    "ai_bg_050.webp",
  ],
  "scripture-study": [
    // lilac-friendly lights
    "ai_bg_053.webp",
    "ai_bg_051.webp",
    "ai_bg_058.webp",
    "ai_bg_044.webp",
    "ai_bg_045.webp",
  ],
};

const SIZES = {
  spot: { width: 360, height: 360 },
  feat: { width: 1400, height: 780 },
};

function hash32(input) {
  const hex = createHash("sha256").update(input).digest("hex").slice(0, 8);
  return Number.parseInt(hex, 16) >>> 0;
}

function pick(rng, list) {
  return list[rng % list.length];
}

function fmString(block, key) {
  const m = block.match(new RegExp(`^${key}:\\s*["']?(.*?)["']?\\s*$`, "m"));
  return m?.[1]?.trim() || "";
}

function collectSources() {
  if (!existsSync(AUTH_HERO_DIR)) {
    throw new Error(`Missing auth-hero pool: ${AUTH_HERO_DIR}`);
  }
  const files = readdirSync(AUTH_HERO_DIR)
    .filter((name) => /\.(webp|png|jpe?g)$/i.test(name))
    .map((name) => join(AUTH_HERO_DIR, name))
    .sort();
  if (files.length === 0) {
    throw new Error("No images in public/images/auth-hero");
  }
  return files;
}

/** Brightest-first ranking of auth-hero images. */
async function rankSources(paths) {
  const ranked = [];
  for (const path of paths) {
    const { channels } = await sharp(path).stats();
    const mean = channels.slice(0, 3).reduce((s, c) => s + c.mean, 0) / 3;
    ranked.push({ path, mean, name: basename(path) });
  }
  ranked.sort((a, b) => b.mean - a.mean);
  return ranked;
}

function listBlogPosts() {
  return readdirSync(BLOG_DIR)
    .filter((f) => /\.mdx?$/.test(f))
    .map((file) => {
      const raw = readFileSync(join(BLOG_DIR, file), "utf8");
      const fm = raw.match(/^---\n([\s\S]*?)\n---/);
      if (!fm) return null;
      const block = fm[1];
      const category = block.match(/^category:\s*["']?([a-z0-9-]+)/m)?.[1];
      const slug = file.replace(/\.mdx?$/, "");
      return {
        slug,
        category: category || "using-harvous",
        title: fmString(block, "title"),
        description: fmString(block, "description"),
        file,
      };
    })
    .filter(Boolean);
}

/**
 * Prefer light. Dark only when the post’s main subject is fade / loss / retention
 * (slug or title) — not a passing word in the description.
 */
function moodForPost(post) {
  if (post.category === "retention") return "dark";
  const slug = post.slug.toLowerCase();
  const title = post.title.toLowerCase();
  if (/evaporat|disappear|vanish|retention-loop|monday/.test(slug)) return "dark";
  if (/evaporat|disappear|keep disappearing|fade by monday/.test(title)) return "dark";
  return "light";
}

/**
 * Restrict ranked sources to a category tone pack (when available), then
 * Light mood → weighted toward brightest (top ~65%).
 * Dark mood → darker half, still avoids the absolute blackest when possible.
 */
function pickSource(rng, ranked, mood, packNames) {
  let rankedPool = ranked;
  if (packNames?.length) {
    const allow = new Set(packNames);
    const filtered = ranked.filter((r) => allow.has(r.name));
    if (filtered.length > 0) rankedPool = filtered;
  }

  const n = rankedPool.length;
  if (mood === "dark") {
    // Within a small pack, prefer the darker half but keep at least 2 options
    const start = n <= 3 ? 0 : Math.floor(n * 0.35);
    const pool = rankedPool.slice(start);
    return pick(rng, pool);
  }

  const lightCount = Math.max(2, Math.ceil(n * 0.7));
  const pool = rankedPool.slice(0, lightCount);
  // Weight: brightest gets the most tickets
  const weighted = [];
  for (let i = 0; i < pool.length; i++) {
    const tickets = pool.length - i;
    for (let t = 0; t < tickets; t++) weighted.push(pool[i]);
  }
  return pick(rng, weighted);
}

/**
 * Pick a form motif from post meaning — slug pin → keywords → category pool.
 */
function shapeForPost(post, rng) {
  const pinned = SHAPE_BY_SLUG[post.slug];
  if (pinned && SHAPE_KINDS.includes(pinned)) return pinned;

  const text = `${post.slug} ${post.title} ${post.description}`.toLowerCase();

  if (/highlight/.test(text)) return "bars";
  if (/pill|scripture chip|reference chip/.test(text)) return "rings";
  if (/\bthreads?\b/.test(text)) return "streak";
  if (/evaporat|disappear|vanish|fade\b/.test(text)) return "plume";
  if (/question/.test(text)) return "wedge";
  if (/\bpdf|\bfiles?\b|chms|systems? need/.test(text)) return "split";
  if (/retention|monday|loop|recall/.test(text)) return "rings";
  if (/capture|five-minute|three.line/.test(text)) return "bars";
  if (/\bai\b|notes-first|studies for you/.test(text)) return "slash";
  if (/prep|stack|framework/.test(text)) return "corner";
  if (/handoff|hand-off|continuity/.test(text)) return "arc";
  if (/trail|one place/.test(text)) return "streak";
  if (/sermon|series|follow-up/.test(text)) return "plume";
  if (/proverb|search out|glory of/.test(text)) return "arc";
  if (/teach(ing|ers)? through|book of the bible/.test(text)) return "arc";

  const pool = SHAPE_BY_CATEGORY[post.category] || SHAPE_KINDS;
  return pick(rng, pool);
}

function recipeFor(post, ranked) {
  const { slug, category } = post;
  const h = hash32(`${slug}|${category}|${RECIPE_VERSION}`);
  const h2 = hash32(`${slug}|${RECIPE_VERSION}|b`);
  const h3 = hash32(`${slug}|${RECIPE_VERSION}|shape`);
  const grade = CATEGORY_GRADE[category] || CATEGORY_GRADE.teaching;
  const mood = moodForPost(post);
  const pack = CATEGORY_SOURCE_PACK[category] || null;
  const chosen = pickSource(h, ranked, mood, pack);
  const shape = shapeForPost(post, h3);
  return {
    source: chosen.path,
    sourceName: chosen.name,
    sourceMean: chosen.mean,
    mood,
    pack: pack || [],
    shape,
    leftPct: ((h >>> 8) % 70) / 100,
    topPct: ((h2 >>> 4) % 70) / 100,
    window: 0.28 + ((h >>> 16) % 50) / 100,
    // Lighter base blur so form layers can still read at spot size
    blurSoft: 18 + (h % 22),
    blurMid: 5 + (h2 % 10),
    angle: h % 360,
    cx: 18 + (h2 % 64),
    cy: 14 + (h % 62),
    cx2: 15 + ((h3 >>> 6) % 70),
    cy2: 20 + ((h3 >>> 12) % 60),
    streakX: ((h >> 5) % 40) - 10,
    streakY: ((h2 >> 3) % 40) - 10,
    bandThick: 0.14 + ((h3 >>> 18) % 14) / 100,
    ellipseRx: 32 + ((h3 >>> 8) % 36),
    ellipseRy: 28 + ((h3 >>> 14) % 32),
    cornerQuad: (h3 >>> 20) % 4,
    grade,
    grain: mood === "light" ? 0.1 + ((h >> 10) % 8) / 100 : 0.14 + ((h >> 10) % 10) / 100,
    glowOpacity: mood === "light" ? 0.55 + ((h2 >> 8) % 28) / 100 : 0.4 + ((h2 >> 8) % 24) / 100,
    shadeOpacity: mood === "light" ? 0.62 : 0.88,
    lift: mood === "light" ? 1.05 : 1.0,
  };
}

/** Form motifs — returns SVG inner markup (defs + shapes). */
function lightMotifMarkup(width, height, recipe) {
  const {
    shape,
    grade,
    cx,
    cy,
    cx2,
    cy2,
    angle,
    streakX,
    streakY,
    glowOpacity,
    bandThick,
    ellipseRx,
    ellipseRy,
    cornerQuad,
  } = recipe;
  const g = Math.min(0.95, glowOpacity + 0.12);
  // Spot thumbs need chunkier geometry or everything collapses to a glow
  const spotBoost = width <= 400 ? 1.55 : 1;
  const rot = angle % 360;
  const thick = Math.max(height * 0.12 * spotBoost, height * bandThick * spotBoost);
  const px = (cx / 100) * width;
  const py = (cy / 100) * height;
  const px2 = (cx2 / 100) * width;
  const py2 = (cy2 / 100) * height;

  switch (shape) {
    case "arc": {
      const r = Math.min(width, height) * 0.62;
      return {
        defs: `
          <linearGradient id="arcStroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${grade.b}" stop-opacity="${g}"/>
            <stop offset="100%" stop-color="${grade.c}" stop-opacity="${g * 0.5}"/>
          </linearGradient>`,
        body: `
          <circle cx="${px}" cy="${height * 1.05}" r="${r}" fill="none" stroke="url(#arcStroke)" stroke-width="${height * 0.22 * spotBoost}"/>
          <circle cx="${px}" cy="${height * 1.05}" r="${r * 0.72}" fill="none" stroke="${grade.a}" stroke-opacity="${g * 0.35}" stroke-width="${height * 0.1 * spotBoost}"/>`,
      };
    }
    case "wedge": {
      const spread = width * (0.7 * spotBoost);
      const tipX = width * (0.15 + (cx % 40) / 100);
      const tipY = height * (0.08 + (cy % 30) / 100);
      return {
        defs: `
          <linearGradient id="wedge" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${grade.c}" stop-opacity="${g}"/>
            <stop offset="55%" stop-color="${grade.b}" stop-opacity="${g * 0.75}"/>
            <stop offset="100%" stop-color="${grade.a}" stop-opacity="${g * 0.45}"/>
          </linearGradient>`,
        body: `<g transform="rotate(${rot} ${width / 2} ${height / 2})">
          <polygon points="${tipX},${tipY} ${tipX + spread},${height * 1.15} ${tipX - spread * 0.45},${height * 1.15}" fill="url(#wedge)"/>
        </g>`,
      };
    }
    case "bars": {
      const gap = height * 0.2;
      const y0 = height * (0.16 + (cy % 25) / 100);
      const barH = thick * 1.15;
      return {
        defs: `
          <linearGradient id="bar" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="${grade.a}" stop-opacity="${g * 0.55}"/>
            <stop offset="45%" stop-color="${grade.b}" stop-opacity="${g}"/>
            <stop offset="100%" stop-color="${grade.c}" stop-opacity="${g * 0.4}"/>
          </linearGradient>`,
        body: `<g transform="rotate(${(angle % 18) - 9} ${width / 2} ${height / 2})">
          <rect x="${-width * 0.15}" y="${y0}" width="${width * 1.3}" height="${barH}" fill="url(#bar)" rx="${barH / 2}"/>
          <rect x="${-width * 0.15}" y="${y0 + gap}" width="${width * 1.3}" height="${barH * 0.75}" fill="url(#bar)" opacity="0.8" rx="${barH / 2}"/>
          <rect x="${-width * 0.15}" y="${y0 + gap * 2}" width="${width * 1.3}" height="${barH * 0.5}" fill="${grade.b}" fill-opacity="${g * 0.65}" rx="${barH / 2}"/>
        </g>`,
      };
    }
    case "rings": {
      const c = Math.min(width, height);
      return {
        defs: "",
        body: `
          <circle cx="${px}" cy="${py}" r="${c * 0.18}" fill="none" stroke="${grade.c}" stroke-opacity="${g}" stroke-width="${c * 0.07 * spotBoost}"/>
          <circle cx="${px}" cy="${py}" r="${c * 0.32}" fill="none" stroke="${grade.b}" stroke-opacity="${g * 0.85}" stroke-width="${c * 0.09 * spotBoost}"/>
          <circle cx="${px}" cy="${py}" r="${c * 0.48}" fill="none" stroke="${grade.a}" stroke-opacity="${g * 0.55}" stroke-width="${c * 0.06 * spotBoost}"/>`,
      };
    }
    case "slash":
      return {
        defs: `
          <linearGradient id="slash" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="${grade.a}" stop-opacity="0"/>
            <stop offset="35%" stop-color="${grade.b}" stop-opacity="${g}"/>
            <stop offset="65%" stop-color="${grade.c}" stop-opacity="${g}"/>
            <stop offset="100%" stop-color="${grade.a}" stop-opacity="0"/>
          </linearGradient>`,
        body: `<g transform="translate(${streakX} ${streakY}) rotate(${35 + (angle % 50)} ${width / 2} ${height / 2})">
          <rect x="${-width * 0.25}" y="${height * 0.22}" width="${width * 1.5}" height="${thick * 0.55}" fill="url(#slash)" rx="${thick}"/>
          <rect x="${-width * 0.25}" y="${height * 0.4}" width="${width * 1.5}" height="${thick * 1.2}" fill="url(#slash)" rx="${thick}"/>
          <rect x="${-width * 0.25}" y="${height * 0.62}" width="${width * 1.5}" height="${thick * 0.45}" fill="${grade.b}" fill-opacity="${g * 0.7}" rx="${thick}"/>
        </g>`,
      };
    case "corner": {
      const origins = [
        { cx: "0%", cy: "0%" },
        { cx: "100%", cy: "0%" },
        { cx: "100%", cy: "100%" },
        { cx: "0%", cy: "100%" },
      ];
      const o = origins[cornerQuad] || origins[0];
      return {
        defs: `
          <radialGradient id="corner" cx="${o.cx}" cy="${o.cy}" r="95%">
            <stop offset="0%" stop-color="${grade.c}" stop-opacity="${g}"/>
            <stop offset="35%" stop-color="${grade.b}" stop-opacity="${g * 0.8}"/>
            <stop offset="70%" stop-color="${grade.a}" stop-opacity="${g * 0.35}"/>
            <stop offset="100%" stop-color="${grade.a}" stop-opacity="0"/>
          </radialGradient>`,
        body: `<rect width="100%" height="100%" fill="url(#corner)"/>`,
      };
    }
    case "split": {
      const cut = 38 + (angle % 24);
      return {
        defs: `
          <linearGradient id="split" gradientTransform="rotate(${(angle % 70) - 20})">
            <stop offset="0%" stop-color="${grade.a}" stop-opacity="${g * 0.85}"/>
            <stop offset="${cut - 4}%" stop-color="${grade.b}" stop-opacity="${g * 0.75}"/>
            <stop offset="${cut}%" stop-color="${grade.c}" stop-opacity="${g * 0.15}"/>
            <stop offset="100%" stop-color="${grade.c}" stop-opacity="0"/>
          </linearGradient>`,
        body: `<rect width="100%" height="100%" fill="url(#split)"/>`,
      };
    }
    case "plume":
      return {
        defs: `
          <linearGradient id="plume" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stop-color="${grade.a}" stop-opacity="${g * 0.2}"/>
            <stop offset="45%" stop-color="${grade.b}" stop-opacity="${g}"/>
            <stop offset="100%" stop-color="${grade.c}" stop-opacity="${g * 0.55}"/>
          </linearGradient>`,
        body: `
          <path d="M ${width * -0.05} ${height * 1.1} Q ${px} ${height * 0.15}, ${width * 1.05} ${height * -0.08}" fill="none" stroke="url(#plume)" stroke-width="${height * 0.28 * spotBoost}" stroke-linecap="round"/>
          <path d="M ${width * 0.05} ${height * 1.15} Q ${px2} ${height * 0.4}, ${width * 0.95} ${height * 0.05}" fill="none" stroke="${grade.b}" stroke-opacity="${g * 0.65}" stroke-width="${height * 0.14 * spotBoost}" stroke-linecap="round"/>`,
      };
    case "streak":
    default:
      return {
        defs: `
          <linearGradient id="streak" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="${grade.a}" stop-opacity="0"/>
            <stop offset="40%" stop-color="${grade.b}" stop-opacity="${g}"/>
            <stop offset="60%" stop-color="${grade.c}" stop-opacity="${g}"/>
            <stop offset="100%" stop-color="${grade.a}" stop-opacity="0"/>
          </linearGradient>`,
        body: `
          <g transform="translate(${streakX} ${streakY}) rotate(${25 + (angle % 55)} ${width / 2} ${height / 2})">
            <rect x="${-width * 0.3}" y="${height * 0.38}" width="${width * 1.6}" height="${thick * 1.35}" fill="url(#streak)" rx="${thick}"/>
          </g>
          <circle cx="${px}" cy="${py}" r="${Math.min(width, height) * 0.12}" fill="${grade.c}" fill-opacity="${g * 0.35}"/>`,
      };
  }
}

function shaderSvg(width, height, recipe) {
  const { grade, angle, grain } = recipe;
  // Deterministic pseudo-noise via many tiny circles (cheap film grain)
  const dots = [];
  const seed = hash32(`${recipe.sourceName}|grain`);
  for (let i = 0; i < 220; i++) {
    const n = hash32(`${seed}|${i}`);
    const x = n % width;
    const y = (n >>> 10) % height;
    const r = 0.4 + ((n >>> 20) % 12) / 10;
    const o = 0.04 + ((n >>> 24) % 10) / 100;
    dots.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="#0d0e12" fill-opacity="${o}"/>`);
  }

  const motif = lightMotifMarkup(width, height, recipe);

  return {
    grade: Buffer.from(`
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="duo" gradientTransform="rotate(${angle})">
      <stop offset="0%" stop-color="${grade.a}"/>
      <stop offset="50%" stop-color="${grade.b}"/>
      <stop offset="100%" stop-color="${grade.c}"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#duo)"/>
</svg>`),
    light: Buffer.from(`
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>${motif.defs}</defs>
  ${motif.body}
</svg>`),
    shade: Buffer.from(`
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="vignette" cx="50%" cy="45%" r="76%">
      <stop offset="40%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#12141a" stop-opacity="${recipe.mood === "light" ? 0.38 : 0.55}"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#vignette)"/>
  <g opacity="${grain}">${dots.join("")}</g>
</svg>`),
  };
}

async function cropCover(source, width, height, recipe) {
  const meta = await sharp(source).rotate().metadata();
  const sw = meta.width || 1200;
  const sh = meta.height || 800;
  const base = Math.min(sw, sh);
  const win = Math.max(200, Math.floor(base * recipe.window));
  let extractW = Math.min(sw, Math.floor(win * (width / height)));
  let extractH = Math.min(sh, Math.floor(extractW * (height / width)));
  extractW = Math.min(extractW, sw);
  extractH = Math.min(extractH, sh);
  const left = Math.floor(Math.max(0, sw - extractW) * recipe.leftPct);
  const top = Math.floor(Math.max(0, sh - extractH) * recipe.topPct);

  return sharp(source)
    .rotate()
    .extract({ left, top, width: extractW, height: extractH })
    .resize(width, height, { fit: "cover" })
    .toBuffer();
}

async function preparedBase(source, width, height, recipe) {
  const cover = await cropCover(source, width, height, recipe);

  // Atmosphere from the auth image — heavy blur so it reads as light/form, not photo
  const soft = await sharp(cover)
    .blur(recipe.blurSoft)
    .modulate({ brightness: recipe.lift, saturation: 0.35 })
    .toBuffer();

  const mid = await sharp(cover)
    .blur(recipe.blurMid)
    .greyscale()
    .modulate({ brightness: recipe.mood === "light" ? 1.1 : 1.02 })
    .toBuffer();

  const structure = await sharp(cover)
    .modulate({ saturation: 0.1, brightness: 1.0 })
    .blur(2)
    .toBuffer();

  const structureFaded = await sharp(structure)
    .ensureAlpha()
    .composite([
      {
        input: Buffer.from(
          `<svg width="${width}" height="${height}"><rect width="100%" height="100%" fill="#fff" fill-opacity="0.32"/></svg>`,
        ),
        blend: "dest-in",
      },
    ])
    .toBuffer();

  return sharp(soft)
    .composite([
      { input: mid, blend: "soft-light" },
      { input: structureFaded, blend: "overlay" },
    ])
    .toBuffer();
}

async function fadeSvg(svg, width, height, opacity) {
  return sharp(svg)
    .ensureAlpha()
    .composite([
      {
        input: Buffer.from(
          `<svg width="${width}" height="${height}"><rect width="100%" height="100%" fill="#fff" fill-opacity="${opacity}"/></svg>`,
        ),
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();
}

async function renderVariant(slug, kind, recipe) {
  const { width, height } = SIZES[kind];
  const outPath = join(OUT_DIR, `${slug}-${kind}.webp`);
  if (!FORCE && existsSync(outPath)) return { outPath, skipped: true };

  const base = await preparedBase(recipe.source, width, height, recipe);
  const layers = shaderSvg(width, height, recipe);
  const grade = await fadeSvg(layers.grade, width, height, recipe.mood === "light" ? 0.62 : 0.68);
  const light = await fadeSvg(
    layers.light,
    width,
    height,
    recipe.mood === "light" ? 0.92 : 0.85,
  );
  const shade = await fadeSvg(layers.shade, width, height, recipe.shadeOpacity);

  await sharp(base)
    .composite([
      { input: grade, blend: "soft-light" },
      { input: light, blend: "over" },
      { input: shade, blend: "multiply" },
    ])
    .modulate({ saturation: 1.12, brightness: recipe.mood === "light" ? 1.02 : 1.0 })
    .webp({ quality: 86, effort: 4 })
    .toFile(outPath);

  return { outPath, skipped: false };
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const sources = collectSources();
  const ranked = await rankSources(sources);
  const posts = listBlogPosts();
  const manifest = {
    generatedAt: new Date().toISOString(),
    version: RECIPE_VERSION,
    pool: "public/images/auth-hero only",
    policy: "category tone packs + light/dark mood; content-shaped forms",
    sourceBrightness: ranked.map((r) => ({ name: r.name, mean: Math.round(r.mean) })),
    categoryPacks: CATEGORY_SOURCE_PACK,
    posts: {},
  };

  console.log(`Auth-hero sources: ${ranked.length} · Posts: ${posts.length} · ${RECIPE_VERSION}`);
  console.log(
    `Brightness: ${ranked[0].name} (${ranked[0].mean.toFixed(0)}) → ${ranked[ranked.length - 1].name} (${ranked[ranked.length - 1].mean.toFixed(0)})`,
  );

  for (const post of posts) {
    const recipe = recipeFor(post, ranked);
    const spot = await renderVariant(post.slug, "spot", recipe);
    const feat = await renderVariant(post.slug, "feat", recipe);
    manifest.posts[post.slug] = {
      category: post.category,
      mood: recipe.mood,
      shape: recipe.shape,
      source: recipe.sourceName,
      sourceMean: Math.round(recipe.sourceMean),
      pack: recipe.pack,
      grade: recipe.grade,
      spot: `/blog-thumbs/${post.slug}-spot.webp`,
      feat: `/blog-thumbs/${post.slug}-feat.webp`,
      skipped: spot.skipped && feat.skipped,
    };
    const mark = spot.skipped && feat.skipped ? "·" : "✓";
    console.log(
      `${mark} ${post.slug} [${post.category}/${recipe.mood}/${recipe.shape}] ← ${recipe.sourceName} (μ${recipe.sourceMean.toFixed(0)})`,
    );
  }

  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`Wrote ${MANIFEST_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
