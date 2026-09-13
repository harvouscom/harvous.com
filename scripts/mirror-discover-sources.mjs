#!/usr/bin/env node
/**
 * Mirror the artwork behind curated Discover references.
 *
 * Two kinds of file, both written into `public/images/discover-sources/`:
 * a poster per listing (`<slug>.webp`) and a mark per publisher
 * (`logos/<source>.webp`).
 *
 * **Why mirror rather than hot-link.** `preview.sourceImage` ends up in
 * `background-image: url(...)` and in an `<img>` on the listing page. Pointing
 * either at `i.ytimg.com` means every visitor to `/discover/` fires a request
 * to a Google host, with a Referer, *before anyone presses play* — which undoes
 * the entire point of the click-to-play facade and `youtube-nocookie` behind
 * it. This site makes exactly one third-party request today (Fathom, chosen for
 * that reason), and mirroring is what keeps that true.
 *
 * Two smaller reasons: a fetched file has real dimensions, so the poster can
 * carry honest `width`/`height` and shift nothing; and a reference's own row
 * is never re-fetched the way a page render is, so a rotted remote URL would
 * decay silently to a grey box on a page nobody rebuilds.
 *
 * **Where the source/video/resource-type data comes from.** It used to live
 * in `data/discover-curated.json`, hand-authored here. The app owns the
 * catalog now — `src/data/curated-resources.ts`, published through
 * `discover-seed-curated-resources.ts` — and delivers it back through the
 * very file this repo already reads for everything else,
 * `data/discover-listings.json`, under each resource's `preview.source` /
 * `preview.video`. This script reads *that* file for what to fetch, and
 * `discover-curated.json` for the much smaller thing this disk still knows
 * that the app's database cannot: a path already sitting here, for the rare
 * entry the mirroring convention is wrong for (see `deriveSourceLogo` and
 * `resolveDiscoverImage` in `src/lib/discover-data.ts`, which read the same
 * two files by the same convention at build time).
 *
 * `source.embedOnly` governs *media* — we never host anyone's video, only a
 * poster frame that credits and links back, which is what every link preview
 * on the web does.
 *
 * Nothing here is required for a correct build: `resolveDiscoverImage` checks
 * the disk and degrades to whatever the row authored, so a forgotten run
 * costs a hot-linked image rather than a broken page. Same operating model as
 * `npm run og:pages` — generated locally, committed, not run in CI.
 *
 * Usage:
 *   npm run discover:sources
 *   npm run discover:sources -- --force
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const ROOT = join(import.meta.dirname, "..");
const CATALOG_PATH = join(ROOT, "data/discover-listings.json");
const CURATED_PATH = join(ROOT, "data/discover-curated.json");
const OUT_DIR = join(ROOT, "public/images/discover-sources");
const LOGO_DIR = join(OUT_DIR, "logos");
const MANIFEST = join(OUT_DIR, "manifest.json");
const FORCE = process.argv.includes("--force");

/** The page poster, and the card's smaller crop of it, in one pass. */
const POSTER_W = 1280;
const POSTER_H = 720;
const LOGO = 128;

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0 Safari/537.36";

async function fetchBuffer(url) {
  const res = await fetch(url, { headers: { "user-agent": UA }, redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

/**
 * YouTube publishes several thumbnail sizes and not every video has every one —
 * `maxresdefault` is absent on older uploads, and asking for it there returns a
 * 404 rather than a smaller image. Walk down until one answers.
 */
async function fetchYouTubePoster(id) {
  for (const name of ["maxresdefault", "sddefault", "hqdefault"]) {
    try {
      return await fetchBuffer(`https://i.ytimg.com/vi/${id}/${name}.jpg`);
    } catch {
      /* try the next size down */
    }
  }
  throw new Error("no thumbnail available");
}

/**
 * Turn a `.ico` into something `sharp` will take.
 *
 * Plenty of good sites still serve only a favicon.ico — STEP Bible and
 * OpenBible.info both do — and `sharp` cannot read the container at all, so
 * those publishers were drawing an initial-letter tile while their logo sat
 * one parse away.
 *
 * An ICO is a directory of images, each either a PNG (hand it straight over)
 * or a headerless BMP whose stored height is doubled to make room for an AND
 * mask that 32bpp images do not use. Unpacking the 32bpp case is enough for
 * every icon this has met: read the largest entry, flip its bottom-up BGRA
 * rows into top-down RGBA, and hand `sharp` raw pixels.
 *
 * Returns null for anything else — a paletted 8bpp icon, a malformed file —
 * so the caller falls through to the next candidate rather than throwing.
 */
function icoToRaw(buf) {
  if (buf.length < 6 || buf.readUInt16LE(0) !== 0 || buf.readUInt16LE(2) !== 1) return null;
  const count = buf.readUInt16LE(4);
  if (!count) return null;

  let best = null;
  for (let i = 0; i < count; i++) {
    const dir = 6 + i * 16;
    if (dir + 16 > buf.length) return null;
    const width = buf.readUInt8(dir) || 256;
    const height = buf.readUInt8(dir + 1) || 256;
    const offset = buf.readUInt32LE(dir + 12);
    if (!best || width * height > best.width * best.height) best = { width, height, offset };
  }
  if (!best || best.offset >= buf.length) return null;

  /* A PNG-in-ICO needs no unpacking. */
  if (buf.subarray(best.offset, best.offset + 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]))) {
    return { png: buf.subarray(best.offset) };
  }

  const headerSize = buf.readUInt32LE(best.offset);
  const bpp = buf.readUInt16LE(best.offset + 14);
  if (headerSize !== 40 || bpp !== 32) return null;

  const width = buf.readInt32LE(best.offset + 4);
  /* Stored doubled: the XOR image then the AND mask. */
  const height = Math.abs(buf.readInt32LE(best.offset + 8)) / 2;
  const pixels = best.offset + headerSize;
  if (pixels + width * height * 4 > buf.length) return null;

  const rgba = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    /* BMP rows run bottom-up. */
    const from = pixels + (height - 1 - y) * width * 4;
    for (let x = 0; x < width; x++) {
      const s = from + x * 4;
      const t = (y * width + x) * 4;
      rgba[t] = buf[s + 2];
      rgba[t + 1] = buf[s + 1];
      rgba[t + 2] = buf[s];
      rgba[t + 3] = buf[s + 3];
    }
  }
  return { raw: rgba, width, height };
}

/** `sharp` over whatever a mark turned out to be. */
function sharpFromMark(buf) {
  const ico = icoToRaw(buf);
  if (ico?.png) return sharp(ico.png);
  if (ico?.raw) return sharp(ico.raw, { raw: { width: ico.width, height: ico.height, channels: 4 } });
  return sharp(buf);
}

/**
 * A publisher's own mark, from their own domain.
 *
 * Their `apple-touch-icon` first because it is square, large and meant to be
 * seen at this size; `favicon.ico` is the fallback and is often 32px, which
 * `sharp` will upscale rather than fail on. Deliberately not a favicon-proxy
 * service: this is one build-time request to the publisher we are already
 * crediting, and it keeps the provenance obvious.
 */
async function fetchSourceMark(homeUrl) {
  const origin = new URL(homeUrl, "https://harvous.com").origin;
  let html = "";
  try {
    const res = await fetch(origin, { headers: { "user-agent": UA }, redirect: "follow" });
    html = await res.text();
  } catch {
    /* fall through to the well-known path */
  }

  const candidates = [];
  const linkRe = /<link[^>]+rel=["']([^"']*icon[^"']*)["'][^>]*>/gi;
  for (const [tag] of html.matchAll(linkRe)) {
    const href = /href=["']([^"']+)["']/i.exec(tag)?.[1];
    if (!href) continue;
    const url = new URL(href, origin).toString();
    /* `.ico` last, whatever a site declares. sharp cannot read it, and plenty
       of sites still list it first out of habit — ranking by what we can
       actually decode beats ranking by what they recommend. */
    const ico = /\.ico(\?|$)/i.test(url);
    const apple = /apple-touch-icon/i.test(tag);
    candidates.push({ url, rank: ico ? 3 : apple ? 0 : 1 });
  }
  /* The well-known paths, for sites whose declared icons 404 — Ligonier
     advertises `/icon.svg` and `/apple-touch-icon.png` and serves neither, but
     has `/favicon-32x32.png` sitting right there. */
  for (const path of [
    "/apple-touch-icon.png",
    "/favicon-96x96.png",
    "/favicon-32x32.png",
    "/icon.png",
    "/favicon.png",
  ]) {
    candidates.push({ url: `${origin}${path}`, rank: 2 });
  }

  /* An og:image is a poor mark — wide, not square — but a site with no usable
     icon at all draws a bare letter otherwise, and their logo is usually in it.
     Matched loosely because the tag is often malformed: Ligonier writes
     `<meta og:image="…">` with no `property` or `content` at all. */
  const og =
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i.exec(html)?.[1] ??
    /<meta[^>]+og:image["']?\s*=\s*["']([^"']+)["']/i.exec(html)?.[1];
  if (og) candidates.push({ url: new URL(og, origin).toString(), rank: 4 });
  candidates.push({ url: `${origin}/favicon.ico`, rank: 5 });
  candidates.sort((a, b) => a.rank - b.rank);

  /* Fetch *and* decode inside the loop. Doing the decode after it meant one
     unreadable .ico ended the search instead of falling through to the PNG
     sitting next to it. */
  for (const candidate of candidates) {
    try {
      const buf = await fetchBuffer(candidate.url);
      await sharpFromMark(buf).metadata();
      return buf;
    } catch {
      /* try the next candidate */
    }
  }
  throw new Error(`no readable mark at ${origin}`);
}

function sourceSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * The poster's own colour, for the plate behind it.
 *
 * A curated card used to sit its picture on the *topic's* wash, and the two
 * disagree more often than not: a guide's blog thumb is graded to its blog
 * category (`plan-the-quarter-not-the-week` is `equipping`, so green) while its
 * Discover topic is `teaching-prep`, which is amber. Green picture, orange
 * ground, on one card.
 *
 * Neither taxonomy is wrong — they are just different taxonomies. So a
 * reference stops borrowing either and takes the colour of the thing itself,
 * which is the only palette that cannot disagree with the picture.
 *
 * Neither `stats().dominant` nor a channel mean works here. The mean muds out
 * on any picture with contrast in it, and `dominant` returns the *most
 * frequent* bucket — which on a guide thumb is the pale paper the motif is
 * painted on, so three different guides all came back #f8f8f8. What the ground
 * wants is the colour a person would name if you asked them what colour the
 * picture is, which is the most saturated colour that covers a real area.
 *
 * So: shrink to 32×32, bucket coarsely, and score each bucket by how much of
 * the picture it covers *times* how colourful it is. Paper loses on chroma,
 * a one-pixel accent loses on coverage, and the motif wins.
 */
async function toneOf(buf) {
  const size = 32;
  const { data } = await sharp(buf)
    .resize(size, size, { fit: "cover" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const buckets = new Map();
  for (let i = 0; i < data.length; i += 3) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    /* 5 bits per channel — fine enough to keep two nearby hues apart, coarse
       enough that a gradient counts as one colour rather than a hundred. */
    const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
    const hit = buckets.get(key);
    if (hit) {
      hit.n += 1;
      hit.r += r;
      hit.g += g;
      hit.b += b;
    } else {
      buckets.set(key, { n: 1, r, g, b });
    }
  }

  let best = null;
  let bestScore = -1;
  for (const bucket of buckets.values()) {
    const r = bucket.r / bucket.n;
    const g = bucket.g / bucket.n;
    const b = bucket.b / bucket.n;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const chroma = max === 0 ? 0 : (max - min) / max;
    /* Coverage alone picks the paper; chroma alone picks a stray pixel. The
       square on chroma is what stops a faintly warm white from winning on
       sheer area. */
    const score = (bucket.n / (size * size)) * chroma * chroma;
    if (score > bestScore) {
      bestScore = score;
      best = { r, g, b };
    }
  }
  if (!best) return null;
  return normalizeTone(best);
}

/**
 * Pull a tone into the band a card ground can actually wear.
 *
 * The colour a picture is *made of* is not the colour it can be *sat on*. A
 * mark gives back whatever it happens to be — CCEL's is #feff24, Blue Letter
 * Bible's is near-black, Ligonier's is a dark brown — and mixing any of those
 * straight into paper gives a card that shouts or a card that looks bruised.
 *
 * So the hue survives and nothing else does: saturation is capped, and
 * lightness is pulled into a mid band. Two publishers with very different marks
 * end up with grounds of the same weight, which is what keeps a grid of them
 * looking like one shelf.
 */
function normalizeTone({ r, g, b }) {
  const [rf, gf, bf] = [r / 255, g / 255, b / 255];
  const max = Math.max(rf, gf, bf);
  const min = Math.min(rf, gf, bf);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rf) h = ((gf - bf) / d + (gf < bf ? 6 : 0)) / 6;
    else if (max === gf) h = ((bf - rf) / d + 2) / 6;
    else h = ((rf - gf) / d + 4) / 6;
  }

  /* A near-greyscale mark has no hue worth keeping, and stretching one out of
     it invents a brand colour from rounding noise: Blue Letter Bible's mark is
     #000101, whose blue channel leads by one unit, and clamping that to a
     usable lightness produced a confident blue nobody chose. Below this
     threshold the ground stays grey, which is both calmer and true. */
  const S = s < 0.15 ? 0 : Math.min(s, 0.5);
  const L = Math.min(0.72, Math.max(0.5, l));

  const q = L < 0.5 ? L * (1 + S) : L + S - L * S;
  const p = 2 * L - q;
  const chan = (t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const hex = (v) =>
    Math.round(Math.max(0, Math.min(255, v * 255)))
      .toString(16)
      .padStart(2, "0");
  return `#${hex(chan(h + 1 / 3))}${hex(chan(h))}${hex(chan(h - 1 / 3))}`;
}

/**
 * The same merge `discover-data.ts` does at build time, in one pass: every
 * seeded reference from the synced catalog, with this disk's presentation
 * override (if any) laid on top by slug.
 *
 * `discover-listings.json` is what the app's export actually calls these
 * fields — `preview.source`, `preview.video` — so this reads them by the same
 * names rather than inventing a second vocabulary for the same data.
 */
function readEffectiveListings() {
  const { listings: synced } = JSON.parse(readFileSync(CATALOG_PATH, "utf-8"));
  const { listings: curated } = JSON.parse(readFileSync(CURATED_PATH, "utf-8"));
  const overrides = new Map(curated.map((entry) => [entry.slug, entry]));

  return synced
    .filter((row) => row.kind === "resource" && row.preview?.source)
    .map((row) => {
      const override = overrides.get(row.slug);
      return {
        slug: row.slug,
        source: row.preview.source,
        video: row.preview.video ?? null,
        /* A local override is already ours — an existing blog thumb, most
           often — so there is nothing to fetch. A missing one just means no
           picture of this reference's own; nothing here forces one. */
        image: override?.image ?? null,
        logoOverride: override?.logo ?? null,
      };
    });
}

async function main() {
  const listings = readEffectiveListings();
  mkdirSync(OUT_DIR, { recursive: true });
  mkdirSync(LOGO_DIR, { recursive: true });

  const posters = [];
  const logos = [];
  const skipped = [];
  const failed = [];

  for (const entry of listings) {
    const out = join(OUT_DIR, `${entry.slug}.webp`);
    const wanted = entry.source?.mirrorPoster !== false;

    if (!wanted) {
      skipped.push({ slug: entry.slug, why: "mirrorPoster: false" });
    } else if (existsSync(out) && !FORCE) {
      skipped.push({ slug: entry.slug, why: "already mirrored" });
    } else {
      const local = entry.image?.startsWith("/");
      if (local) {
        skipped.push({ slug: entry.slug, why: `local: ${entry.image}` });
      } else if (!entry.video && !entry.image) {
        /* Nothing to fetch. A link with no picture of its own is not a failure —
           the card falls back to `discoverDocumentArt`, which is what that
           fallback has always been for. */
        skipped.push({ slug: entry.slug, why: "no poster to mirror" });
      } else {
        try {
          const buf = entry.video
            ? await fetchYouTubePoster(entry.video.id)
            : await fetchBuffer(entry.image);
          const info = await sharp(buf)
            .resize(POSTER_W, POSTER_H, { fit: "cover", position: "attention" })
            .webp({ quality: 82 })
            .toFile(out);
          posters.push({
            slug: entry.slug,
            out: `/images/discover-sources/${entry.slug}.webp`,
            width: info.width,
            height: info.height,
            bytes: info.size,
          });
        } catch (error) {
          failed.push({ slug: entry.slug, error: String(error.message ?? error) });
        }
      }
    }

    const source = entry.source;
    /* Mirroring by convention is the default now that the app's export carries
       no `logo` field at all — asking it to would mean teaching the catalog's
       database about a filename this repo owns. A `logoOverride` set to
       anywhere *other* than that convention path is the one thing this script
       must not step on: an asset we already ship, Harvous's own icon most
       obviously, that re-fetching a favicon over would only make worse. */
    const logoSlug = sourceSlug(source.name);
    const bySlugLogo = `/images/discover-sources/logos/${logoSlug}.webp`;
    if (entry.logoOverride && entry.logoOverride !== bySlugLogo) continue;
    const logoOut = join(LOGO_DIR, `${logoSlug}.webp`);
    if (logos.some((l) => l.source === source.name) || (existsSync(logoOut) && !FORCE)) continue;
    try {
      const buf = await fetchSourceMark(source.homeUrl);
      const info = await sharpFromMark(buf)
        .resize(LOGO, LOGO, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .webp({ quality: 90 })
        .toFile(logoOut);
      logos.push({
        source: source.name,
        out: bySlugLogo,
        bytes: info.size,
      });
    } catch (error) {
      failed.push({ slug: `logo:${logoSlug}`, error: String(error.message ?? error) });
    }
  }

  /*
   * Second pass: the plate tone for every entry that ends up with a picture,
   * whether this run fetched it or it was already there. Separate from the
   * fetch loop because a skipped poster still needs its tone — otherwise the
   * ground would only be right on the run that downloaded the image.
   */
  const tones = {};
  for (const entry of listings) {
    const mirrored = join(OUT_DIR, `${entry.slug}.webp`);
    const local = entry.image?.startsWith("/")
      ? join(ROOT, "public", entry.image.slice(1))
      : null;
    /* A link with no picture of its own — a study tool, a curriculum index —
       still belongs to somebody, and their mark is the one colour on the card
       that is genuinely theirs. Falling back to it is what stops those cards
       drawing a `DOCUMENT_ART` plate picked by hashing the slug, which is how
       Working Preacher ended up on an orange wash it has nothing to do with.
       Same by-convention-then-override lookup as the fetch pass above, since
       either one could be what actually exists on disk for this source. */
    const logoSlug = sourceSlug(entry.source.name);
    const bySlugLogo = join(LOGO_DIR, `${logoSlug}.webp`);
    const overrideLogo = entry.logoOverride?.startsWith("/")
      ? join(ROOT, "public", entry.logoOverride.slice(1))
      : null;
    const logo =
      existsSync(bySlugLogo) ? bySlugLogo
      : overrideLogo && existsSync(overrideLogo) ? overrideLogo
      : null;
    const from =
      existsSync(mirrored) ? mirrored
      : local && existsSync(local) ? local
      : logo;
    if (!from) continue;
    try {
      const tone = await toneOf(readFileSync(from));
      if (tone) tones[entry.slug] = tone;
    } catch (error) {
      failed.push({ slug: `tone:${entry.slug}`, error: String(error.message ?? error) });
    }
  }

  writeFileSync(
    MANIFEST,
    `${JSON.stringify(
      { generatedAt: new Date().toISOString(), posters, logos, tones },
      null,
      2,
    )}\n`,
  );

  console.log(`[discover:sources] ${posters.length} poster(s), ${logos.length} logo(s)`);
  for (const item of skipped) console.log(`  skip  ${item.slug} — ${item.why}`);
  /* A failure is reported and not thrown: the reader falls back to the authored
     URL, so one publisher blocking a fetch must not stop the other nine. */
  for (const item of failed) console.warn(`  FAIL  ${item.slug} — ${item.error}`);
}

main().catch((error) => {
  console.error("[discover:sources] failed:", error);
  process.exitCode = 1;
});
