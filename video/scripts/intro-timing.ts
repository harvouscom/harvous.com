/**
 * Where every beat and line lands, in seconds and frames.
 *
 *   npm run intro:timing
 */
import { placeBeats, FPS } from "../src/intro/plan";
import { BEATS } from "../src/intro/timeline";
import { loadIntroDataFromDisk } from "./intro-disk-data";

const data = loadIntroDataFromDisk();
const { placed, totalSec } = placeBeats(BEATS, data);
for (const p of placed) {
  console.log(
    `${p.beat.id.padEnd(10)} ${p.startSec.toFixed(1).padStart(6)}s  frame ${String(Math.round(p.startSec * FPS)).padStart(5)}  ${p.durationSec.toFixed(1)}s  in:${p.enter}`,
  );
  for (const l of p.lines) console.log(`    ${l.id.padEnd(16)} ${(p.startSec + l.startSec).toFixed(1)}s  ${l.durationSec.toFixed(1)}s`);
}
console.log(`total ${totalSec.toFixed(1)}s${data.estimated.length ? `  (estimated lines: ${data.estimated.length})` : ""}`);
