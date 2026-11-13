import React from "react";
import type { Box } from "../intro/take-types";
import { EASE, progress } from "../stage/motion";

/**
 * Marks drawn over the footage, in the capture's own CSS pixels so they stay
 * on their element through every zoom. Only clean geometry: a line, a
 * rounded rectangle, a circle, an X, or a straight arrow. Each draws on like
 * a pen stroke, lands with the app's pop, and leaves before the voice moves on.
 */

export const ACCENT = "#006eff";

export type AnnotationKind = "line" | "rect" | "circle" | "x" | "arrow" | "loupe";

export type PlacedAnnotation = {
  kind: AnnotationKind;
  box: Box;
  /** Seconds into the beat it appears, and how long it stays. */
  start: number;
  dur: number;
  /** For arrows: the side the arrow comes from. */
  side?: "above" | "below" | "left" | "right";
};

const DRAW = 0.6;
const PAD = 6;

const paths = (a: PlacedAnnotation): string[] => {
  const b = a.box;
  const x0 = b.x - PAD;
  const y0 = b.y - PAD;
  const x1 = b.x + b.width + PAD;
  const y1 = b.y + b.height + PAD;
  switch (a.kind) {
    case "line": {
      const y = b.y + b.height + 8;
      return [`M${b.x},${y} L${b.x + b.width},${y}`];
    }
    case "rect": {
      const r = Math.min(16, (y1 - y0) / 2);
      // Start mid-top so the stroke draws round from twelve o'clock.
      const mx = (x0 + x1) / 2;
      return [
        `M${mx},${y0} L${x1 - r},${y0} Q${x1},${y0} ${x1},${y0 + r} L${x1},${y1 - r} Q${x1},${y1} ${x1 - r},${y1} L${x0 + r},${y1} Q${x0},${y1} ${x0},${y1 - r} L${x0},${y0 + r} Q${x0},${y0} ${x0 + r},${y0} Z`,
      ];
    }
    case "circle": {
      const cx = (x0 + x1) / 2;
      const cy = (y0 + y1) / 2;
      const rx = ((x1 - x0) / 2) * 1.06;
      const ry = ((y1 - y0) / 2) * 1.16;
      return [`M${cx},${cy - ry} A${rx},${ry} 0 1 1 ${cx - 0.01},${cy - ry} Z`];
    }
    case "x": {
      const s = Math.min(b.width, b.height) * 0.42;
      const cx = b.x + b.width / 2;
      const cy = b.y + b.height / 2;
      return [`M${cx - s},${cy - s} L${cx + s},${cy + s}`, `M${cx + s},${cy - s} L${cx - s},${cy + s}`];
    }
    case "loupe":
      // Drawn by the composition (Intro.tsx Loupe): a magnified look, not a stroke.
      return [];
    case "arrow": {
      const side = a.side ?? "left";
      const len = 78;
      const head = 12;
      const [tx, ty, dx, dy] =
        side === "left"
          ? [x0 - 6, (y0 + y1) / 2, -1, 0]
          : side === "right"
            ? [x1 + 6, (y0 + y1) / 2, 1, 0]
            : side === "above"
              ? [(x0 + x1) / 2, y0 - 6, 0, -1]
              : [(x0 + x1) / 2, y1 + 6, 0, 1];
      const sx = tx + dx * len;
      const sy = ty + dy * len;
      // Head: two short strokes back from the tip, 35° off the shaft.
      const ang = Math.atan2(-dy, -dx);
      const h1 = [tx + Math.cos(ang + 0.6) * head * -1, ty + Math.sin(ang + 0.6) * head * -1];
      const h2 = [tx + Math.cos(ang - 0.6) * head * -1, ty + Math.sin(ang - 0.6) * head * -1];
      return [`M${sx},${sy} L${tx},${ty}`, `M${h1[0]},${h1[1]} L${tx},${ty} L${h2[0]},${h2[1]}`];
    }
  }
};

export const AnnotationLayer: React.FC<{ items: PlacedAnnotation[]; t: number; width: number; height: number }> = ({ items, t, width, height }) => (
  <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }} width={width} height={height}>
    {items.map((a, i) => {
      if (t < a.start || t > a.start + a.dur) return null;
      const segs = paths(a);
      const draw = progress(t, a.start, a.start + DRAW, EASE.standard);
      const out = progress(t, a.start + a.dur - 0.4, a.start + a.dur, EASE.exit);
      // Lands with the app's pop: a breath over full size, then home.
      const pop = 0.94 + 0.06 * progress(t, a.start, a.start + 0.5, EASE.pop);
      const b = a.box;
      const cx = b.x + b.width / 2;
      const cy = b.y + b.height / 2;
      return (
        <g key={i} opacity={1 - out} transform={`translate(${cx} ${cy}) scale(${pop * (1 - out * 0.04)}) translate(${-cx} ${-cy})`}>
          {segs.map((d, j) => {
            // Multi-stroke marks (X, arrow head) draw one after another.
            const share = 1 / segs.length;
            const local = Math.min(1, Math.max(0, (draw - j * share) / share));
            const common = {
              d,
              fill: "none",
              strokeLinecap: "round" as const,
              strokeLinejoin: "round" as const,
              pathLength: 1,
              strokeDasharray: 1,
              strokeDashoffset: 1 - local,
            };
            return (
              <g key={j}>
                {/* A soft white halo keeps the stroke crisp on any background. */}
                <path {...common} stroke="rgba(255,255,255,0.85)" strokeWidth={7} />
                <path {...common} stroke={ACCENT} strokeWidth={3.5} />
              </g>
            );
          })}
        </g>
      );
    })}
  </svg>
);
