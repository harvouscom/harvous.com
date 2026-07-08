#!/usr/bin/env node
/**
 * Download compare-page OG images from compare.csv into public/images/compare/og/.
 * Re-run when compare.csv Open Graph URLs change.
 */
import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pipeline } from "node:stream/promises";
import { get } from "node:https";
import { get as getHttp } from "node:http";

const ROOT = join(import.meta.dirname, "..");
const CSV_PATH = join(ROOT, "data/compare.csv");
const OUT_DIR = join(ROOT, "public/images/compare/og");

function parseCsvRows(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') inQuotes = true;
    else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || (ch === "\r" && next === "\n")) {
      row.push(field);
      field = "";
      if (row.some((c) => c.trim())) rows.push(row);
      row = [];
      if (ch === "\r") i++;
    } else if (ch !== "\r") {
      field += ch;
    }
  }

  if (field.length || row.length) {
    row.push(field);
    if (row.some((c) => c.trim())) rows.push(row);
  }

  return rows;
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? get : getHttp;
    lib(url, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchUrl(res.headers.location).then(resolve, reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`${url} → HTTP ${res.statusCode}`));
        return;
      }
      resolve(res);
    }).on("error", reject);
  });
}

const raw = readFileSync(CSV_PATH, "utf-8");
const rows = parseCsvRows(raw);
const [headers, ...dataRows] = rows;
const slugIdx = headers.indexOf("Slug");
const ogIdx = headers.indexOf("Open Graph");

await mkdir(OUT_DIR, { recursive: true });

let ok = 0;
let skipped = 0;

for (const row of dataRows) {
  const slug = row[slugIdx]?.trim();
  const url = row[ogIdx]?.trim();
  if (!slug || !url) continue;

  const dest = join(OUT_DIR, `${slug}.png`);
  try {
    const res = await fetchUrl(url);
    await pipeline(res, createWriteStream(dest));
    ok++;
    console.log(`✓ ${slug}`);
  } catch (err) {
    skipped++;
    console.warn(`✗ ${slug}: ${err.message}`);
  }
}

console.log(`\nDone: ${ok} saved, ${skipped} failed → ${OUT_DIR}`);
