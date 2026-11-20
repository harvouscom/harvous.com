/**
 * Get footage/ ready for the HarvousIntro composition.
 *
 *   npm run intro:prep
 *
 * 1. Copies the site's own brand assets (fonts, the "breeze" sky, Derek's
 *    signature and avatar, the app icon) into footage/intro/assets, so the
 *    video uses exactly what harvous.com ships. They're copies, so gitignored.
 * 2. Writes footage/intro/takes/manifest.json with every take's duration and
 *    size, for calculateMetadata. Run it again after any capture.
 */
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SITE_PUBLIC = path.resolve(ROOT, "..", "public");
const ASSETS = path.join(ROOT, "footage", "intro", "assets");
const TAKES = path.join(ROOT, "footage", "intro", "takes");

const copies = {
  "GoogleSansFlex-Variable.woff2": "fonts/google-sans-flex/GoogleSansFlex-Variable.woff2",
  "Caveat-Latin.woff2": "fonts/caveat/Caveat-Latin.woff2",
  "sky.webp": "images/auth-hero/ai_bg_053.webp",
  "icon.png": "apple-touch-icon.png",
  "favicon.svg": "favicon.svg",
};

mkdirSync(ASSETS, { recursive: true });
for (const [to, from] of Object.entries(copies)) {
  copyFileSync(path.join(SITE_PUBLIC, from), path.join(ASSETS, to));
}
console.log(`assets: ${Object.keys(copies).length} files → footage/intro/assets`);

const probe = (file) => {
  const out = execFileSync("ffprobe", [
    "-v", "error", "-select_streams", "v:0",
    "-show_entries", "stream=width,height:format=duration",
    "-of", "json", file,
  ]).toString();
  const j = JSON.parse(out);
  return { durationSec: Number(j.format.duration), width: j.streams[0].width, height: j.streams[0].height };
};

const manifest = {};
if (existsSync(TAKES)) {
  for (const f of readdirSync(TAKES).filter((f) => f.endsWith(".mp4")).sort()) {
    const take = f.replace(/\.mp4$/, "");
    if (!existsSync(path.join(TAKES, `${take}.events.json`))) continue;
    manifest[take] = {
      video: `intro/takes/${f}`,
      events: `intro/takes/${take}.events.json`,
      ...probe(path.join(TAKES, f)),
    };
  }
}
writeFileSync(path.join(TAKES, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`takes: ${Object.keys(manifest).join(", ") || "none yet (npm run intro:capture)"}`);
