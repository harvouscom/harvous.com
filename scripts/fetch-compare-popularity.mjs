#!/usr/bin/env node
/**
 * Compare popularity — App Store rating counts for each compare entry.
 *
 * The compare hub orders a card's icon strip most popular first. "Popular" is
 * the US App Store rating count: public, comparable across apps, and easy to
 * refresh. Writes data/compare-popularity.json ({ slug: count }).
 *
 * App ids come from each app's own website where it links one; otherwise from
 * an App Store search, checked against the seller. Web-only apps (or ones
 * without an app we could confirm) are left out and sort last.
 *
 * Usage:
 *   npm run compare:popularity
 */

import { writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const OUT = join(ROOT, "data/compare-popularity.json");

/** Compare slug → App Store track id. */
const APP_IDS = {
  abide: 726031617,
  accordance: 411970514,
  "apple-notes": 1110145109,
  ascension: 1660909501,
  "aura-bible": 6736381898,
  "bible-gateway": 506512797,
  "bible-memory": 496790833,
  "bible-note": 6743159952,
  "bible-study-tools": 396906089,
  "bible-ai": 6739915445,
  bibleproject: 1523687027,
  blessed: 1634567736,
  "blue-letter-bible": 365547505,
  "church-notes": 6764295750,
  craft: 1487937127,
  dwell: 1343917374,
  "e-sword": 634158738,
  "esv-bible": 361797273,
  evernote: 281796108,
  faithstudy: 6751494810,
  glorify: 1490587079,
  goodnotes: 1444383602,
  "google-docs": 842842640,
  "google-keep": 1029207872,
  hallow: 1405323394,
  illuminate: 6747603383,
  "life-bible": 325955298,
  logos: 336400266,
  notion: 1232780281,
  obsidian: 1557175442,
  "olive-tree": 332615624,
  onenote: 410395246,
  "pencil-bible": 1612587185,
  pocketbible: 436998224,
  "pray-com": 1161035371,
  readscripture: 1067865974,
  reflect: 6787385615,
  simplenote: 289429962,
  "spirit-notes": 1531045060,
  supernotes: 1567815218,
  "through-the-word": 1324825712,
  youversion: 282935706,
  "planning-center-groups": 1357742931, // Groups lives in the Church Center app
  band: 542613198,
  flock: 6757656390,
  called: 6445821834,
  groupme: 392796698,
  whatsapp: 310633997,
  wordgo: 6743088681,
  bsf: 1524174445,
  waha: 1530116294,
  manna: 6757349977,
  lyte: 6760732301,
};

const ids = Object.values(APP_IDS);
const byId = new Map();
// The lookup endpoint takes a comma-separated batch of ids.
for (let i = 0; i < ids.length; i += 50) {
  const url = `https://itunes.apple.com/lookup?country=us&id=${ids.slice(i, i + 50).join(",")}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`App Store lookup failed: ${res.status}`);
  for (const app of (await res.json()).results) byId.set(app.trackId, app.userRatingCount ?? 0);
}

const out = {};
for (const [slug, id] of Object.entries(APP_IDS)) {
  if (!byId.has(id)) {
    console.warn(`· ${slug}: no App Store result for ${id}`);
    continue;
  }
  out[slug] = byId.get(id);
}

writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");
console.log(`Compare popularity: ${Object.keys(out).length} apps → ${OUT}`);
