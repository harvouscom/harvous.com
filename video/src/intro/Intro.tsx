import React, { useState } from "react";
import { z } from "zod";
import { AbsoluteFill, Audio, Freeze, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { AnnotationLayer, type PlacedAnnotation } from "../annotations/Annotations";
import { buildCursorTrack } from "../camera/track";
import { CursorLayer } from "../camera/Cursor";
import { MOVE_SEC, cameraAt, cameraTransform, restState, type CameraKey, type CameraState } from "../camera/camera";
import { BrowserWindow, CHROME_HEIGHT } from "../frames/BrowserWindow";
import { Phone } from "../frames/Phone";
import { IconBlock, fallIn, type InkTier } from "../stage/IconBlock";
import { MeshGround } from "../stage/Mesh";
import { EASE, progress } from "../stage/motion";
import type { Box } from "./take-types";
import { cueWords, timeWords } from "./words";
import type { IntroData } from "./data";
import { loadIntroFonts } from "./fonts";
import { DESKTOP_VIEWPORT, PHONE_VIEWPORT, desktopRect, desktopToStage, phoneRect } from "./layout";
import { HEIGHT, RISE_SEC, VOICE_FADE, WIDTH, anchorBox, clickMs, markToBeatSec, placeBeats, takeClock, takeStartSec, type PlacedBeat } from "./plan";
import { BEATS, BENTO_TONES, meshOf, type BentoFeature, type BentoTone, type Beat, type MarkRef, type Marker, type Note } from "./timeline";

export const introSchema = z.object({
  desktopFrame: z.enum(["mac-chrome", "mac-safari", "windows-chrome"]),
  phoneFrame: z.enum(["iphone", "iphone-safari", "android-chrome"]),
  theme: z.enum(["light", "dark"]),
  /** Frames per second: 30 for quick drafts, 60 for the final. */
  fps: z.number().optional(),
  /** Filled in by calculateMetadata from footage/; not an editable prop. */
  data: z.any().optional(),
});

export type IntroProps = z.infer<typeof introSchema>;

const INK = "#0d0e12";
const SANS = '"Google Sans", system-ui, sans-serif';
/** How far a pane travels when one chapter hands over to the next. */
const PANE = 1800;
/** How far a zoom-through pushes into its detail. */
const THROUGH_SCALE = 2.6;

/** Seconds into the current Sequence, and the frame rate. */
const useClock = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { frame, fps, t: frame / fps };
};

/* ─────────────────────────── ground ─────────────────────────── */

/**
 * The mesh behind everything. Each beat brings its category's family, fading
 * in over the handover, so the ground always matches the chapter's block.
 */
const Backdrop: React.FC<{ placed: PlacedBeat[] }> = ({ placed }) => {
  const { t } = useClock();
  return (
    <AbsoluteFill>
      {placed.map((p) => {
        if (t < p.startSec || t > p.startSec + p.durationSec) return null;
        const o = p.index === 0 ? 1 : progress(t, p.startSec, p.startSec + Math.max(0.6, p.enterSec), EASE.exit);
        return <MeshGround key={p.beat.id} family={meshOf(p.beat)} motion={p.beat.motion} t={t} opacity={o} />;
      })}
    </AbsoluteFill>
  );
};

/* ─────────────────────────── a take ─────────────────────────── */

/**
 * Shows a take at an exact moment: `takeSec` seconds into it, held on the last
 * frame past the end. Every frame is placed explicitly (Freeze passes a
 * fractional frame straight through to the video's clock), so the footage
 * stays exactly in step with the cursor, the magnifiers and the camera, which
 * all read the same take clock, holds and all.
 */
type TakeAt = { src: string; durationSec: number; takeSec: number };

const TakeVideo: React.FC<TakeAt & { width: number; height: number }> = ({ src, durationSec, takeSec, width, height }) => {
  const { fps } = useVideoConfig();
  const sec = Math.max(0, Math.min(takeSec, durationSec - 2 / fps));
  return (
    <Freeze frame={sec * fps}>
      <OffthreadVideo src={staticFile(src)} muted style={{ width, height, display: "block" }} />
    </Freeze>
  );
};

/* ─────────────────────────── the magnifier ─────────────────────────── */

/**
 * A callout for something small: a magnifying glass over the spot that shows
 * it larger, ringed in white with a soft shadow. It pops in on the app's pop
 * curve and slips away before the voice moves on. It sits over the window's
 * viewport, wherever the crop has put the spot, and magnifies from the take
 * itself, so it stays sharp at any crop.
 */
const Loupe: React.FC<{
  note: Note & { box: Box; start: number; dur: number };
  t: number;
  video: TakeAt;
  crop: CameraState;
}> = ({ note, t, video, crop }) => {
  const { start, dur, box } = note;
  if (t < start || t > start + dur) return null;
  // Always clearly more than the crop around it.
  const zoom = Math.max(note.zoom ?? 2, crop.scale * 1.3);
  const r = note.radius ?? 170;
  const [fx, fy] = note.focus ?? [0.5, 0.5];
  // The spot being magnified (take pixels), and where the glass sits: on that
  // spot as the crop shows it, kept inside the viewport.
  const sx = note.point ? note.point[0] : box.x + box.width * fx;
  const sy = note.point ? note.point[1] : box.y + box.height * fy;
  const vx = (sx - crop.x) * crop.scale + DESKTOP_VIEWPORT.width / 2;
  const vy = (sy - crop.y) * crop.scale + DESKTOP_VIEWPORT.height / 2;
  const pad = 14;
  const cx = Math.min(DESKTOP_VIEWPORT.width - r - pad, Math.max(r + pad, vx));
  const cy = Math.min(DESKTOP_VIEWPORT.height - r - pad, Math.max(r + pad, vy));
  const inU = progress(t, start, start + 0.55, EASE.pop);
  const outU = progress(t, start + dur - 0.35, start + dur, EASE.exit);
  const scale = (0.55 + 0.45 * inU) * (1 - 0.15 * outU);
  const opacity = progress(t, start, start + 0.18) * (1 - outU);
  return (
    <div
      style={{
        position: "absolute",
        left: cx - r,
        top: cy - r,
        width: r * 2,
        height: r * 2,
        borderRadius: "50%",
        overflow: "hidden",
        opacity,
        transform: `scale(${scale})`,
        background: "#fcfcfb",
        boxShadow: "0 0 0 5px rgba(255,255,255,0.98), 0 0 0 6px rgba(13,30,60,0.10), 0 26px 50px -18px rgba(13,30,60,0.5)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: DESKTOP_VIEWPORT.width,
          height: DESKTOP_VIEWPORT.height,
          transformOrigin: "0 0",
          transform: `translate(${r - sx * zoom}px, ${r - sy * zoom}px) scale(${zoom})`,
        }}
      >
        <TakeVideo {...video} width={DESKTOP_VIEWPORT.width} height={DESKTOP_VIEWPORT.height} />
      </div>
      {/* A faint lens sheen across the top. */}
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(120% 70% at 30% 0%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 45%)" }} />
    </div>
  );
};

/* ─────────────────────────── app beats ─────────────────────────── */

const AppBeat: React.FC<{ p: PlacedBeat; props: IntroProps; data: IntroData }> = ({ p, props, data }) => {
  const { fps, t } = useClock();
  const { beat } = p;
  const take = beat.take ? data.takes[beat.take] : null;
  if (!take) return <Missing what={`take "${beat.take}"`} />;

  const lead = p.takeLead;
  const clock = takeClock(take.events, beat);
  const takeSecAt = (tt: number) => clock.toTake(Math.max(0, tt - lead));
  const takeMs = (tt: number) => takeSecAt(tt) * 1000;
  const toBeat = (sec: number) => sec + lead;
  const markAt = (m: MarkRef) => toBeat(markToBeatSec(take.events, m, clock));
  const exitAt = p.durationSec - p.exitSec;

  /* Arriving and leaving. */
  let transform = "";
  let opacity = 1;
  let blur = 0;
  if (p.enter === "rise") {
    // Keynote-style: floats up with a slight tilt that settles flat.
    const u = progress(t, p.windowAt, p.windowAt + RISE_SEC, EASE.softPop);
    transform += ` perspective(1800px) translateY(${(1 - u) * 820}px) rotateX(${(1 - u) * 12}deg) scale(${0.9 + 0.1 * u})`;
    opacity *= progress(t, p.windowAt, p.windowAt + 0.25);
  } else if (p.enter === "pane") {
    const u = progress(t, 0, p.enterSec, EASE.standard);
    transform += ` translateX(${(1 - u) * PANE}px) rotate(${(1 - u) * 2.5}deg) scale(${0.93 + 0.07 * u})`;
  } else if (p.enter === "frosted") {
    // The same screen carries on: this take clears out of the blur.
    const c = progress(t, p.windowAt, p.windowAt + 0.8, EASE.standard);
    opacity *= progress(t, p.windowAt - 0.1, p.windowAt + 0.35);
    blur = Math.max(blur, (1 - c) * 14);
    transform += ` scale(${0.97 + 0.03 * c})`;
  } else if (p.enter === "zoom") {
    blur = Math.max(blur, (1 - progress(t, 0.85, 1.8, EASE.standard)) * 16);
    opacity *= progress(t, 0, 0.3);
  }
  const exitU = progress(t, exitAt, p.durationSec, EASE.exit);
  if (p.exit === "rise" || p.exit === "pane") {
    transform += ` translateX(${-exitU * PANE}px) rotate(${-exitU * 2.5}deg) scale(${1 - 0.07 * exitU})`;
  } else if (p.exit === "frosted") {
    const c = progress(t, exitAt, exitAt + 0.6, EASE.standard);
    blur = Math.max(blur, c * 14);
    transform += ` scale(${1 - 0.03 * c})`;
  } else if (p.exit === "zoom") {
    blur = Math.max(blur, progress(t, p.durationSec - 0.6, p.durationSec) * 16);
    opacity *= 1 - progress(t, p.durationSec - 0.3, p.durationSec);
  } else if (p.exit === "settle") {
    transform += ` translateY(${-exitU * 70}px) scale(${1 - 0.08 * exitU})`;
    opacity *= 1 - exitU;
  }

  /* The phone lands with a little bounce; the window makes room for it. */
  const phoneTake = beat.phoneTake ? data.takes[beat.phoneTake] : null;
  const hasPhone = Number.isFinite(p.phoneAt) && !!phoneTake;
  const slide = hasPhone ? progress(t, p.phoneAt, p.phoneAt + 1.2, EASE.standard) : 0;
  const phoneIn = hasPhone ? progress(t, p.phoneAt, p.phoneAt + 1.1, EASE.softPop) : 0;

  /* Several features on one screen: the window eases right for a list. */
  const features = beat.features;
  const featureFrom = features ? markAt(features.from) : Infinity;
  const featureUntil = features ? markAt(features.until) : Infinity;
  const side = features
    ? progress(t, featureFrom, featureFrom + 0.9, EASE.standard) * (1 - progress(t, featureUntil, featureUntil + 0.8, EASE.standard))
    : 0;

  const dRect = desktopRect(props.desktopFrame, slide, side);
  const pRect = phoneRect(props.phoneFrame);

  /* Camera: push in on the app's emphasized curve, ease back on its symmetric exit. */
  const track = buildCursorTrack(take.events.events, take.events.durationMs);
  const stagePoint = (box: Box) => desktopToStage(desktopRect(props.desktopFrame, 0), { x: box.x + box.width / 2, y: box.y + box.height / 2 });
  const keys: CameraKey[] = [];
  const throughBox = beat.zoomOn ? anchorBox(take.events, beat.zoomOn) : null;
  if (p.enter === "zoom" && throughBox) {
    // Open pushed in on the same kind of detail the last chapter pushed into, then pull back.
    const s = stagePoint(throughBox);
    keys.push({ t: 0, to: () => ({ x: s.x, y: s.y, scale: THROUGH_SCALE }), move: 0.001 });
    keys.push({ t: 1.1, to: () => restState(WIDTH, HEIGHT), move: 1.4, ease: EASE.standard });
  }
  const exitPush = p.exit === "zoom" && throughBox ? p.durationSec - 1.05 : Infinity;
  const releaseBy = Math.min(exitAt, p.phoneAt, exitPush) - MOVE_SEC - 0.1;
  // Stage zooms move the whole stage; crops move the footage inside the
  // window. Each kind runs its own camera, releasing before the next of its
  // kind, before the phone lands, and before the beat hands over.
  const zoomKeys = (mode: "stage" | "crop", rest: CameraState) => {
    const list = (beat.zooms ?? []).filter((z) => (z.mode ?? "stage") === mode).map((z) => ({ z, at: markAt(z.at) }));
    const out: CameraKey[] = [];
    list.forEach(({ z, at }, i) => {
      const box = z.target === "cursor" ? null : anchorBox(take.events, z.target);
      const scale = z.scale ?? 1.6;
      out.push({
        t: at,
        to: (tt) => {
          const spot = z.point ? { x: z.point[0], y: z.point[1] } : box ? { x: box.x + box.width / 2, y: box.y + box.height / 2 } : track.at(takeMs(tt));
          const s = mode === "stage" ? desktopToStage(desktopRect(props.desktopFrame, 0), spot) : spot;
          return { x: s.x, y: s.y, scale };
        },
        move: z.move,
        ease: z.move && z.move > MOVE_SEC ? EASE.standard : undefined,
      });
      const nextAt = list[i + 1]?.at ?? Infinity;
      const release = Math.min(z.hold !== undefined ? at + z.hold : Infinity, z.until ? markAt(z.until) : Infinity, releaseBy);
      if (release < nextAt && release < exitPush - 0.2) out.push({ t: release, to: () => rest, ease: EASE.exit, move: MOVE_SEC });
    });
    return out;
  };
  keys.push(...zoomKeys("stage", restState(WIDTH, HEIGHT)));
  if (Number.isFinite(exitPush) && throughBox) {
    const s = stagePoint(throughBox);
    keys.push({ t: exitPush, to: () => ({ x: s.x, y: s.y, scale: THROUGH_SCALE }), move: 1.05, ease: EASE.emphasized });
  }
  const cam = cameraAt(keys, t, WIDTH, HEIGHT);
  const VW = DESKTOP_VIEWPORT.width;
  const VH = DESKTOP_VIEWPORT.height;
  const crop = cameraAt(zoomKeys("crop", restState(VW, VH)), t, VW, VH);
  const cropTransform = cameraTransform(crop, VW, VH);

  /* Callouts: magnifiers, plus any drawn marks. */
  const placedNotes = (beat.notes ?? []).flatMap((n) => {
    const box = anchorBox(take.events, n.anchor);
    if (!box) return [];
    return [{ ...n, box, start: markAt(n.at), dur: n.dur ?? 2.4 }];
  });
  const loupes = placedNotes.filter((n) => n.kind === "loupe");
  const marks: PlacedAnnotation[] = placedNotes
    .filter((n) => n.kind !== "loupe")
    .map((n) => ({ kind: n.kind, box: n.box, start: n.start, dur: n.dur, side: n.side }));
  const video: TakeAt = { src: take.video, durationSec: take.durationSec, takeSec: takeSecAt(t) };

  const cursorFade = progress(t, lead, lead + 0.5) * (1 - progress(t, exitAt - 0.4, exitAt));
  const phoneStart = phoneTake ? takeStartSec(phoneTake.events, beat.phoneFrom) : 0;
  const phoneSec = phoneStart + (hasPhone ? Math.max(0, t - p.phoneAt) : 0);
  const phoneTrack = phoneTake ? buildCursorTrack(phoneTake.events.events, phoneTake.events.durationMs) : null;

  /* One soft light sweep across the frosted bar as a risen window lands. */
  const sweepAt = p.windowAt + RISE_SEC * 0.5;
  const sweep = p.enter === "rise" ? progress(t, sweepAt, sweepAt + 0.9, EASE.standard) : 0;

  // While zoomed, the footage fills the frame: a soft light fade along the
  // bottom keeps a calm band for the subtitles.
  const fog = Math.min(1, Math.max(0, (cam.scale - 1) / 0.25)) * (cam.scale < THROUGH_SCALE - 0.3 ? 1 : 0);

  const titleTiming =
    p.enter === "frosted" ? { start: 0.3, outAt: p.windowAt + 0.15 } : p.enter === "zoom" ? { start: 0.1, outAt: 1.05 } : { start: 0.25, outAt: p.windowAt };

  return (
    <>
      <AbsoluteFill style={{ transform, opacity, filter: blur > 0.05 ? `blur(${blur}px)` : undefined, transformOrigin: "50% 60%" }}>
        <AbsoluteFill style={{ transform: cameraTransform(cam, WIDTH, HEIGHT), transformOrigin: "0 0" }}>
          <div style={{ position: "absolute", left: dRect.x, top: dRect.y }}>
            <BrowserWindow variant={props.desktopFrame} theme={props.theme} width={dRect.width} viewportHeight={DESKTOP_VIEWPORT.height * dRect.k}>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: DESKTOP_VIEWPORT.width,
                  height: DESKTOP_VIEWPORT.height,
                  transform: `scale(${dRect.k})`,
                  transformOrigin: "0 0",
                }}
              >
                <div style={{ position: "absolute", inset: 0, transform: cropTransform, transformOrigin: "0 0" }}>
                  <TakeVideo {...video} width={VW} height={VH} />
                  <AnnotationLayer items={marks} t={t} width={VW} height={VH} />
                </div>
                {loupes.map((n, i) => (
                  <Loupe key={i} note={n} t={t} video={video} crop={crop} />
                ))}
                <div style={{ position: "absolute", inset: 0, transform: cropTransform, transformOrigin: "0 0" }}>
                  <CursorLayer track={track} ms={takeMs(t)} device="desktop" opacity={cursorFade} />
                </div>
              </div>
            </BrowserWindow>
            {sweep > 0 && sweep < 1 ? (
              <div style={{ position: "absolute", left: 0, top: 0, width: dRect.width, height: CHROME_HEIGHT, overflow: "hidden", borderRadius: "22px 22px 0 0" }}>
                <div
                  style={{
                    position: "absolute",
                    top: -20,
                    left: `${-40 + sweep * 160}%`,
                    width: "28%",
                    height: CHROME_HEIGHT + 40,
                    transform: "skewX(-18deg)",
                    background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.75) 50%, rgba(255,255,255,0) 100%)",
                  }}
                />
              </div>
            ) : null}
          </div>

          {hasPhone && phoneTake && phoneTrack && t >= p.phoneAt ? (
            <div
              style={{
                position: "absolute",
                left: pRect.x,
                top: pRect.y,
                transform: `translateY(${(1 - phoneIn) * 720}px) rotate(${(1 - phoneIn) * 7}deg)`,
                transformOrigin: "50% 100%",
              }}
            >
              <Phone variant={props.phoneFrame} viewport={PHONE_VIEWPORT} scale={pRect.k}>
                <TakeVideo src={phoneTake.video} durationSec={phoneTake.durationSec} takeSec={phoneSec} width={PHONE_VIEWPORT.width} height={PHONE_VIEWPORT.height} />
                <CursorLayer track={phoneTrack} ms={phoneSec * 1000} device="phone" />
              </Phone>
            </div>
          ) : null}
        </AbsoluteFill>

        {features && side > 0 ? (
          <FeatureList t={t} side={side} items={features.items} toBeat={markAt} />
        ) : null}
      </AbsoluteFill>

      {fog > 0 ? (
        <AbsoluteFill
          style={{
            top: "auto",
            height: 230,
            opacity: fog * (1 - exitU),
            background: "linear-gradient(180deg, rgba(250,251,253,0) 0%, rgba(250,251,253,0.82) 55%, rgba(250,251,253,0.94) 100%)",
          }}
        />
      ) : null}
      {beat.marker ? (
        <ChapterTitle t={t} start={titleTiming.start} outAt={titleTiming.outAt} marker={beat.marker} overWindow={p.enter === "frosted" || p.enter === "zoom"} />
      ) : null}

      {(beat.sounds ?? []).map((s, i) => {
        const ms = clickMs(take.events, s.click);
        const file = data.appSounds[s.cue];
        if (ms === null || !file) return null;
        // The app plays a cue a breath after the press; keep that.
        const at = toBeat(clock.toPlay(ms / 1000)) + 0.05;
        if (at < lead - 0.01 || at > p.durationSec) return null;
        return (
          <Sequence key={i} from={Math.round(at * fps)} durationInFrames={Math.round(0.8 * fps)} layout="none" name={`app ${s.cue}`}>
            <Audio src={staticFile(file)} volume={0.85} />
          </Sequence>
        );
      })}
    </>
  );
};

/* ─────────────────────────── chapter titles and lists ─────────────────────────── */

/** The opening has only the mesh and Derek's words. */
const TitleBeat: React.FC = () => null;

/**
 * A chapter's title: its icon block tumbles into the middle of the stage with
 * the name stacked beneath, holds a moment, then lifts away as the window
 * arrives or clears.
 */
const ChapterTitle: React.FC<{ t: number; start: number; outAt: number; marker: Marker; overWindow: boolean }> = ({ t, start, outAt, marker, overWindow }) => {
  if (t < start || t > outAt + 0.6) return null;
  const f = fallIn(t - start, { from: -260, tip: 8 });
  const text = progress(t, start + 0.35, start + 1, EASE.softPop);
  const out = progress(t, outAt - 0.05, outAt + 0.5, EASE.exit);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: 1 - out, transform: `translateY(${-out * 70}px)` }}>
      <div style={{ transform: `translateY(${f.y}px)`, opacity: f.opacity, marginTop: -40 }}>
        <IconBlock icon={marker.icon} category={marker.category} tier={marker.tier} size={136} rotate={f.rotate} />
      </div>
      <div
        style={{
          marginTop: 30,
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 64,
          letterSpacing: "-0.03em",
          color: INK,
          opacity: progress(t, start + 0.35, start + 0.6),
          transform: `translateY(${(1 - text) * 22}px)`,
          // Over a frosted window, a soft white glow keeps the title crisp.
          textShadow: overWindow ? "0 0 24px rgba(255,255,255,0.95), 0 0 8px rgba(255,255,255,0.9)" : "none",
        }}
      >
        {marker.title}
      </div>
    </AbsoluteFill>
  );
};

/**
 * Several features on one screen, named as they happen: a short stacked list
 * beside the window, each row lighting up when its feature appears in it.
 */
const FeatureList: React.FC<{
  t: number;
  side: number;
  items: NonNullable<Beat["features"]>["items"];
  toBeat: (m: { mark: string; offset?: number }) => number;
}> = ({ t, side, items, toBeat }) => {
  const times = items.map((it) => toBeat(it.at));
  const active = times.reduce((a, at, i) => (t >= at - 0.15 ? i : a), -1);
  return (
    <div
      style={{
        position: "absolute",
        left: 96,
        top: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 30,
        opacity: side,
        transform: `translateX(${(1 - side) * -40}px)`,
      }}
    >
      {items.map((it, i) => {
        const at = times[i] - 0.15;
        const shown = t >= at;
        const f = fallIn(Math.max(0, t - at), { from: -40, tip: 6 });
        return (
          <div
            key={it.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              opacity: shown ? f.opacity * (i === active ? 1 : 0.45) : 0,
              transform: `translateY(${shown ? f.y : 0}px)`,
            }}
          >
            <IconBlock icon={it.icon} category="read" tier={it.tier} size={60} rotate={shown ? f.rotate : 0} />
            <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 30, letterSpacing: "-0.02em", color: INK, whiteSpace: "nowrap" }}>{it.label}</div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * The close: what Harvous does, as a bento like the homepage's. Six cards,
 * each in its own tone with a framed stage washed in that tone's mesh, an
 * icon block, the feature's name and a line about it. They open on the
 * chapters you just saw; then, one card at a time, a card lets its feature
 * lift away and takes the next one, until the rest have all had a turn.
 */
const BENTO = { x: 150, y: 80, width: 1620, height: 770, gap: 22, cols: 4 };
const SWAP_SEC = 0.85;

type BentoItem = { feature: BentoFeature; at: number; n: number };

const FeatureBento: React.FC<{ p: PlacedBeat }> = ({ p }) => {
  const { t } = useClock();
  const bento = p.beat.bento;
  if (!bento) return null;
  const { slots, features, order } = bento;

  // Where each card sits: rows of four columns, wide cards spanning two.
  const colW = (BENTO.width - BENTO.gap * (BENTO.cols - 1)) / BENTO.cols;
  const rowH = (BENTO.height - BENTO.gap) / 2;
  let col = 0;
  let row = 0;
  const rects = slots.map((slot) => {
    const span = slot.wide ? 2 : 1;
    if (col + span > BENTO.cols) {
      col = 0;
      row += 1;
    }
    const r = { x: BENTO.x + col * (colW + BENTO.gap), y: BENTO.y + row * (rowH + BENTO.gap), width: colW * span + BENTO.gap * (span - 1), height: rowH };
    col += span;
    return r;
  });

  // When each card arrives, and when each later feature takes its card.
  const arrive = (i: number) => 0.3 + i * 0.09;
  const first = slots.length;
  const swaps = features.length - first;
  const swapFrom = 3.8;
  const swapTo = p.durationSec - 3.4;
  const step = swaps > 1 ? (swapTo - swapFrom) / (swaps - 1) : 0;
  const history: BentoItem[][] = slots.map((_, i) => (features[i] ? [{ feature: features[i], at: arrive(i) + 0.15, n: i }] : []));
  for (let k = 0; k < swaps; k++) {
    const slot = order[k % order.length] ?? k % slots.length;
    history[slot].push({ feature: features[first + k], at: swapFrom + k * step, n: first + k });
  }
  const out = progress(t, p.durationSec - 1.6, p.durationSec, EASE.exit);

  return (
    <AbsoluteFill style={{ opacity: 1 - out, transform: `translateY(${-out * 30}px)` }}>
      {slots.map((slot, i) => {
        const r = rects[i];
        const tone = BENTO_TONES[slot.tone];
        const u = progress(t, arrive(i), arrive(i) + 1.1, EASE.softPop);
        const seen = progress(t, arrive(i), arrive(i) + 0.3);
        // The current feature, and the one lifting away while it arrives.
        const items = history[i];
        const cur = items.reduce((a, it, k) => (t >= it.at ? k : a), 0);
        const prev = cur > 0 && t < items[cur].at + SWAP_SEC ? items[cur - 1] : null;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: r.x,
              top: r.y,
              width: r.width,
              height: r.height,
              borderRadius: 30,
              padding: 9,
              boxSizing: "border-box",
              background: `color-mix(in srgb, ${tone.tone} 22%, #ffffff)`,
              boxShadow: [
                `inset 0 0 0 1px color-mix(in srgb, ${tone.ink} 7%, transparent)`,
                "0 30px 60px -36px rgba(13,30,60,0.38)",
                "0 2px 6px rgba(13,30,60,0.05)",
              ].join(", "),
              opacity: seen,
              transform: `translateY(${(1 - u) * 56}px) scale(${0.95 + 0.05 * u})`,
              display: "flex",
              flexDirection: slot.wide ? "row" : "column",
            }}
          >
            <BentoStage t={t} wide={!!slot.wide} tone={slot.tone} seed={i} current={items[cur]} prev={prev} />
            <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
              {prev ? <BentoWords item={prev} t={t} wide={!!slot.wide} tone={slot.tone} leaving /> : null}
              {items[cur] ? <BentoWords item={items[cur]} t={t} wide={!!slot.wide} tone={slot.tone} /> : null}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** How a feature comes and goes on a card: rising in out of a soft blur, lifting away into one. */
const swapIn = (t: number, at: number, delay: number) => {
  const u = progress(t, at + delay, at + delay + 0.6, EASE.standard);
  return { opacity: progress(t, at + delay, at + delay + 0.3), transform: `translateY(${(1 - u) * 16}px)`, filter: u < 0.999 ? `blur(${(1 - u) * 5}px)` : undefined };
};
const swapOut = (t: number, at: number) => {
  const u = progress(t, at, at + 0.42, EASE.exit);
  return { opacity: 1 - u, transform: `translateY(${-u * 14}px)`, filter: u > 0.001 ? `blur(${u * 5}px)` : undefined };
};

/** The card's framed stage: its tone's mesh, with the feature's icon block on it. */
const BentoStage: React.FC<{ t: number; wide: boolean; tone: BentoTone; seed: number; current?: BentoItem; prev: BentoItem | null }> = ({
  t,
  wide,
  tone,
  seed,
  current,
  prev,
}) => {
  const tn = BENTO_TONES[tone];
  const size = wide ? 136 : 108;
  const tier = (n: number): InkTier => ([55, 42, 32] as const)[n % 3];
  const block = (item: BentoItem, leaving: boolean) => {
    if (leaving) {
      const u = progress(t, item.at, item.at + 0.42, EASE.exit);
      return { item, style: { opacity: 1 - u, transform: `translateY(${-u * 26}px) scale(${1 - 0.14 * u})`, filter: u > 0.001 ? `blur(${u * 6}px)` : undefined } };
    }
    const f = fallIn(Math.max(0, t - item.at - 0.22), { from: -70, tip: 7 });
    return { item, style: { opacity: t >= item.at + 0.22 ? f.opacity : 0, transform: `translateY(${f.y}px) rotate(${f.rotate}deg)` } };
  };
  const shown = [prev ? { ...block(prev, true), leaving: true } : null, current ? { ...block(current, false), leaving: false } : null].filter(Boolean) as {
    item: BentoItem;
    style: React.CSSProperties;
    leaving: boolean;
  }[];
  return (
    <div
      style={{
        position: "relative",
        flex: wide ? "0 0 54%" : "0 0 auto",
        height: wide ? "100%" : "62%",
        borderRadius: 22,
        overflow: "hidden",
        boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${tn.ink} 6%, transparent)`,
      }}
    >
      <MeshGround family={tn.mesh} motion="drift" t={t + seed * 7} width={wide ? 460 : 380} height={wide ? 360 : 230} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        {shown.map(({ item, style, leaving }) => (
          <div key={`${item.n}-${leaving ? "out" : "in"}`} style={{ position: "absolute", ...style }}>
            <IconBlock icon={item.feature.icon} category="activity" ink={tn.accent} tier={tier(item.n)} size={size} />
          </div>
        ))}
      </AbsoluteFill>
    </div>
  );
};

/** The card's words: the feature's name (with a Plus tag where it's part of Plus) and a line about it. */
const BentoWords: React.FC<{ item: BentoItem; t: number; wide: boolean; tone: BentoTone; leaving?: boolean }> = ({ item, t, wide, tone, leaving }) => {
  const tn = BENTO_TONES[tone];
  const label = leaving ? swapOut(t, item.at) : swapIn(t, item.at, 0.32);
  const title = leaving ? swapOut(t, item.at) : swapIn(t, item.at, 0.4);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        padding: wide ? "0 34px 0 38px" : "18px 16px 0",
        display: "flex",
        flexDirection: "column",
        justifyContent: wide ? "center" : "flex-start",
        fontFamily: SANS,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: wide ? 22 : 19, fontWeight: 600, color: tn.ink, ...label }}>
        <span style={{ opacity: 0.8 }}>{item.feature.label}</span>
        {item.feature.plus ? (
          <span
            style={{
              fontSize: wide ? 15 : 13.5,
              fontWeight: 600,
              padding: "3px 9px",
              borderRadius: 999,
              color: INK,
              background: "rgba(255,255,255,0.78)",
              boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${tn.ink} 10%, transparent)`,
            }}
          >
            Plus
          </span>
        ) : null}
      </div>
      <div
        style={{
          marginTop: wide ? 12 : 9,
          fontSize: wide ? 40 : 27,
          lineHeight: 1.14,
          letterSpacing: "-0.022em",
          fontWeight: 600,
          color: INK,
          textWrap: "balance",
          ...title,
        }}
      >
        {item.feature.title}
      </div>
    </div>
  );
};

/* ─────────────────────────── thought subtitles ─────────────────────────── */

/**
 * Derek's words on screen as he says them: one short phrase at a time, each
 * word rising in softly as it's spoken, the phrase drifting away when the
 * next begins. Over the opening it sits large in the middle, like a thought;
 * everywhere else it sits low and small.
 */
const Subtitles: React.FC<{ placed: PlacedBeat[] }> = ({ placed }) => {
  const { t } = useClock();
  const cues = placed.flatMap((p) =>
    p.lines.flatMap((l) => {
      const at = p.startSec + l.startSec;
      return cueWords(timeWords(l.text, l.heard, l.durationSec)).map((c) => ({
        big: p.beat.layout === "title",
        start: at + c.start,
        end: at + c.end,
        words: c.words.map((w) => ({ word: w.word, start: at + w.start })),
      }));
    }),
  );
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {cues.map((c, i) => {
        const next = cues[i + 1];
        // A phrase is fully gone before the next one starts to arrive.
        const until = Math.min(c.end + 0.7, next ? next.start - 0.12 : c.end + 0.9);
        if (t < c.start - 0.08 || t > until) return null;
        const out = progress(t, until - 0.26, until, EASE.exit);
        return (
          <AbsoluteFill
            key={i}
            style={{
              alignItems: "center",
              justifyContent: c.big ? "center" : "flex-end",
              paddingBottom: c.big ? 0 : 74,
              opacity: 1 - out,
              transform: `translateY(${-out * 10}px)`,
            }}
          >
            <div
              style={{
                maxWidth: c.big ? 1240 : 1100,
                textAlign: "center",
                fontFamily: SANS,
                fontWeight: c.big ? 500 : 450,
                fontSize: c.big ? 68 : 34,
                letterSpacing: c.big ? "-0.03em" : "-0.01em",
                lineHeight: 1.15,
                color: INK,
                textShadow: c.big ? "none" : "0 0 18px rgba(255,255,255,0.95), 0 0 6px rgba(255,255,255,0.9), 0 1px 2px rgba(255,255,255,0.9)",
              }}
            >
              {c.words.map((w, k) => {
                // Fully there by the time the word is heard, not after.
                const u = progress(t, w.start - 0.16, w.start + 0.14, EASE.standard);
                return (
                  <span
                    key={k}
                    style={{ display: "inline-block", marginRight: "0.26em", opacity: u, transform: `translateY(${(1 - u) * 10}px)`, filter: `blur(${(1 - u) * 3}px)` }}
                  >
                    {w.word}
                  </span>
                );
              })}
            </div>
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};

const Missing: React.FC<{ what: string }> = ({ what }) => (
  <AbsoluteFill style={{ background: "#2a0f12", color: "#fff", alignItems: "center", justifyContent: "center", fontSize: 36, fontFamily: "system-ui" }}>
    Missing {what}. Run npm run intro:capture, then npm run intro:prep.
  </AbsoluteFill>
);

/* ─────────────────────────── sound ─────────────────────────── */

/** Derek's voice, each clip cut a breath after its last word with a short fade. */
const Voice: React.FC<{ placed: PlacedBeat[] }> = ({ placed }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      {placed.flatMap((p) =>
        p.lines.map((l) =>
          l.file ? (
            <Sequence key={l.id} from={Math.round((p.startSec + l.startSec) * fps)} durationInFrames={Math.ceil(l.durationSec * fps)} name={`VO ${l.id}`} layout="none">
              <Audio
                src={staticFile(l.file)}
                volume={(f) => interpolate(f / fps, [l.durationSec - VOICE_FADE, l.durationSec], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
              />
            </Sequence>
          ) : null,
        ),
      )}
    </>
  );
};

/**
 * Under the voice: the ambient bed (composed to the edit, see scripts/music.ts)
 * and, beneath that, soft outdoor air. Both lift a little in the pauses and
 * the opening, tuck under every line, and fade out together at the end.
 */
const Bed: React.FC<{ placed: PlacedBeat[]; data: IntroData; totalFrames: number }> = ({ placed, data, totalFrames }) => {
  const { fps } = useVideoConfig();
  const spans = placed.flatMap((p) => p.lines.map((l) => [p.startSec + l.startSec, p.startSec + l.startSec + l.durationSec] as const));
  const RAMP = 0.6;
  const shape = (f: number, open: number, under: number) => {
    const t = f / fps;
    let duck = 0;
    for (const [a, b] of spans) {
      duck = Math.max(duck, interpolate(t, [a - RAMP, a, b, b + RAMP], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    }
    const fadeIn = interpolate(t, [0, 2], [0, 1], { extrapolateRight: "clamp" });
    const fadeOut = interpolate(f, [totalFrames - 3.5 * fps, totalFrames], [1, 0], { extrapolateLeft: "clamp" });
    return (open - (open - under) * duck) * fadeIn * fadeOut;
  };
  const beds = data.ambience?.beds ?? [];
  const cycle = 24;
  return (
    <>
      {data.music ? <Audio src={staticFile(data.music)} volume={(f) => shape(f, 0.4, 0.17)} /> : null}
      {beds.slice(0, 2).map((bed, i) => (
        <Audio
          key={bed}
          src={staticFile(bed)}
          loop
          volume={(f) => {
            // Two beds crossfade on a slow cycle, so the loop point never shows.
            const share = 0.5 + 0.5 * Math.cos(((f / fps / cycle + i * 0.5) % 1) * Math.PI * 2);
            return shape(f, 0.14, 0.05) * (beds.length > 1 ? 0.35 + 0.65 * share : 1);
          }}
        />
      ))}
    </>
  );
};

/* ─────────────────────────── the composition ─────────────────────────── */

export const HarvousIntro: React.FC<IntroProps> = (props) => {
  // Fonts hold the first frame (delayRender), so start loading during render.
  useState(() => loadIntroFonts());
  const { fps } = useVideoConfig();
  const data = props.data as IntroData | undefined;
  if (!data) return <Missing what="intro data" />;
  const { placed, totalSec } = placeBeats(BEATS, data);
  const totalFrames = Math.ceil(totalSec * fps);
  return (
    <AbsoluteFill style={{ background: "#f3f7fb" }}>
      <Backdrop placed={placed} />
      {placed.map((p) => {
        const from = Math.round(p.startSec * fps);
        return (
          <Sequence key={p.beat.id} from={from} durationInFrames={Math.round((p.startSec + p.durationSec) * fps) - from} name={p.beat.id} premountFor={fps}>
            {p.beat.layout === "title" ? <TitleBeat /> : p.beat.layout === "bento" ? <FeatureBento p={p} /> : <AppBeat p={p} props={props} data={data} />}
          </Sequence>
        );
      })}
      <Subtitles placed={placed} />
      <Voice placed={placed} />
      <Bed placed={placed} data={data} totalFrames={totalFrames} />
    </AbsoluteFill>
  );
};
