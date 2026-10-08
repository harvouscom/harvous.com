#!/usr/bin/env node
/**
 * Display copies of the compare app icons: a 224px WebP beside each 400px PNG in
 * public/images/compare/icons/. Pages show the WebP (compareIconSrc); the PNG
 * stays for colour sampling and OG generation.
 *
 * Writes only what's missing or older than its PNG, so it's cheap to rerun after
 * adding an app to data/compare.csv.
 *
 *   npm run compare:icons
 */
import { readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const DIR = join(dirname(fileURLToPath(import.meta.url)), "../public/images/compare/icons");
let made = 0;
for (const file of readdirSync(DIR).filter((f) => f.endsWith(".png"))) {
  const png = join(DIR, file);
  const webp = png.replace(/\.png$/, ".webp");
  if (existsSync(webp) && statSync(webp).mtimeMs >= statSync(png).mtimeMs) continue;
  await sharp(png).resize(224, 224, { fit: "cover" }).webp({ quality: 86 }).toFile(webp);
  made++;
}
console.log(`${made} compare icon(s) written.`);
