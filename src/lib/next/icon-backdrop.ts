/**
 * Pick the motion-blur backdrop (`ai_bg_*`) whose colour matches an app
 * icon's own — so a featured Apple Notes card sits on a yellow sky, not the
 * blue one every other card already wears.
 *
 * Both sides are read at build time with sharp: each picture is shrunk to a
 * few pixels, and its colour is the saturation-weighted mean hue of what's
 * left (greys, whites and transparent pixels carry no weight — an icon's
 * white paper says nothing about its colour). The nearest hue wins.
 */
import { readdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

type Tone = { hue: number; sat: number };

const PUBLIC = join(process.cwd(), "public");
const BACKDROP_DIR = "images/auth-hero";

async function toneOf(publicPath: string): Promise<Tone> {
  const { data, info } = await sharp(join(PUBLIC, publicPath.replace(/^\//, "")))
    .resize(24, 24, { fit: "fill" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let x = 0;
  let y = 0;
  let weight = 0;
  let pixels = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    const a = data[i + 3] / 255;
    if (a < 0.5) continue;
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const chroma = max - min;
    pixels++;
    if (chroma < 0.12) continue;
    let h: number;
    if (max === r) h = ((g - b) / chroma) % 6;
    else if (max === g) h = (b - r) / chroma + 2;
    else h = (r - g) / chroma + 4;
    const rad = (h * 60 * Math.PI) / 180;
    x += Math.cos(rad) * chroma;
    y += Math.sin(rad) * chroma;
    weight += chroma;
  }
  const hue = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  return { hue, sat: pixels ? weight / pixels : 0 };
}

let backdropTones: Promise<{ id: string; tone: Tone }[]> | null = null;
function allBackdropTones() {
  backdropTones ??= Promise.all(
    readdirSync(join(PUBLIC, BACKDROP_DIR))
      .filter((f) => /^ai_bg_\d+\.webp$/.test(f))
      .map(async (f) => ({
        id: f.match(/\d+/)![0],
        tone: await toneOf(`${BACKDROP_DIR}/${f}`),
      }))
  );
  return backdropTones;
}

const hueGap = (a: number, b: number) => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};

/**
 * The backdrop id (e.g. "050") nearest an image's colour. A near-grey icon
 * has no hue worth matching, so it gets `fallback`.
 */
export async function backdropForImage(publicPath: string, fallback = "077"): Promise<string> {
  const icon = await toneOf(publicPath);
  if (icon.sat < 0.06) return fallback;
  const tones = await allBackdropTones();
  /* Nearest hue, with a nudge towards the more colourful of two close skies. */
  const best = tones
    .filter((t) => t.tone.sat >= 0.05)
    .map((t) => ({ id: t.id, score: hueGap(icon.hue, t.tone.hue) - t.tone.sat * 20 }))
    .sort((a, b) => a.score - b.score)[0];
  return best?.id ?? fallback;
}
