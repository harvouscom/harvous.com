import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Page } from "playwright";
import { TAKE_FPS } from "./config.ts";

type Frame = { file: string; ms: number };

/** Fraction of device pixels to capture. Chrome's JPEG encode is the frame-rate bottleneck. */
const SCALE = Number(process.env.INTRO_CAPTURE_SCALE ?? 1);

/**
 * Records the page through CDP screencast: JPEGs at device pixels, quality 80,
 * timestamped by Chrome when each frame was presented. Chrome only sends a
 * frame when something repaints, so stop() conforms the frames to a constant
 * TAKE_FPS video, holding each frame until the next one arrives.
 *
 * Screencast tops out around 22 fps at 2880×1800, too few for a smooth scroll.
 * So the page runs in slow motion while recording (see timescale.ts) and the
 * frames are retimed `slow`× faster: 22 fps captured at 1/3 speed plays back
 * as ~66 fps of real motion. Every time this returns is already retimed.
 */
export const startRecording = async (page: Page, framesDir: string, { slow = 1 }: { slow?: number } = {}) => {
  rmSync(framesDir, { recursive: true, force: true });
  mkdirSync(framesDir, { recursive: true });

  const viewport = page.viewportSize();
  if (!viewport) throw new Error("Recording needs a fixed viewport");
  const dpr = await page.evaluate(() => window.devicePixelRatio);

  const client = await page.context().newCDPSession(page);
  const frames: Frame[] = [];
  let n = 0;

  client.on("Page.screencastFrame", ({ data, metadata, sessionId }) => {
    const file = path.join(framesDir, `f${String(++n).padStart(6, "0")}.jpg`);
    // Ack first: Chrome won't encode the next frame until it hears back.
    client.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
    writeFileSync(file, Buffer.from(data, "base64"));
    // metadata.timestamp is wall-clock seconds, the same clock as Date.now().
    frames.push({ file, ms: metadata.timestamp ? metadata.timestamp * 1000 : Date.now() });
  });

  await client.send("Page.startScreencast", {
    format: "jpeg",
    quality: Number(process.env.INTRO_JPEG_QUALITY ?? 80),
    maxWidth: Math.round(viewport.width * dpr * SCALE),
    maxHeight: Math.round(viewport.height * dpr * SCALE),
    everyNthFrame: 1,
  });

  // Nudge a repaint so the take starts with a frame at t≈0.
  await page.evaluate(() => {
    const el = document.createElement("div");
    el.style.cssText = "position:fixed;left:0;top:0;width:1px;height:1px;opacity:0.01;pointer-events:none";
    document.body.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => el.remove()));
  });
  const deadline = Date.now() + 5000;
  while (frames.length === 0 && Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 16));
  }
  if (frames.length === 0) throw new Error("Screencast sent no frames");
  const startMs = frames[0].ms;
  const retime = (ms: number) => (ms - startMs) / slow;

  return {
    slow,
    /** Take time: ms since the first frame, retimed to playback speed. */
    now: () => retime(Date.now()),
    stop: async (outFile: string) => {
      const endMs = Date.now();
      await client.send("Page.stopScreencast").catch(() => {});
      await client.detach().catch(() => {});

      const sorted = [...frames].sort((a, b) => a.ms - b.ms);
      const lines: string[] = ["ffconcat version 1.0"];
      sorted.forEach((f, i) => {
        const next = sorted[i + 1]?.ms ?? endMs;
        const dur = Math.max(1, retime(next) - retime(f.ms)) / 1000;
        lines.push(`file '${path.basename(f.file)}'`, `duration ${dur.toFixed(4)}`);
      });
      // The concat demuxer ignores the last entry's duration unless it's repeated.
      lines.push(`file '${path.basename(sorted[sorted.length - 1].file)}'`);
      const list = path.join(framesDir, "frames.ffconcat");
      writeFileSync(list, `${lines.join("\n")}\n`);

      execFileSync(
        "ffmpeg",
        [
          "-hide_banner", "-loglevel", "error", "-y",
          "-f", "concat", "-safe", "0", "-i", list,
          "-vf", `fps=${TAKE_FPS},scale=trunc(iw/2)*2:trunc(ih/2)*2`,
          "-c:v", "libx264", "-preset", "slow", "-crf", "14",
          "-pix_fmt", "yuv420p", "-movflags", "+faststart",
          outFile,
        ],
        { stdio: "inherit" },
      );

      const gaps = sorted.slice(1).map((f, i) => retime(f.ms) - retime(sorted[i].ms));
      return {
        durationMs: retime(endMs),
        frames: sorted.length,
        /** Frame gaps while something was moving (gaps under 200 ms), in playback ms. */
        motionGapMs: (() => {
          const moving = gaps.filter((g) => g < 200).sort((a, b) => a - b);
          if (!moving.length) return { mean: 0, p90: 0 };
          return {
            mean: Math.round(moving.reduce((t, g) => t + g, 0) / moving.length),
            p90: Math.round(moving[Math.floor(moving.length * 0.9)]),
          };
        })(),
      };
    },
  };
};

export type Recording = Awaited<ReturnType<typeof startRecording>>;
