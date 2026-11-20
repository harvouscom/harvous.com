import React from "react";
import { AbsoluteFill } from "remotion";

/**
 * The site's mesh grounds (src/styles/brand.css, BRAND_KIT.md "Grounds"),
 * brought to life: a near-white base with soft pools of one colour family
 * that drift, swell and trade places slowly, under fine grain. The painted
 * skies never sit behind something that has to be read; meshes do.
 *
 * Each chapter gets its own family (what it holds) and its own motion (how
 * the pools move), so the ground changes character as well as colour while
 * staying quiet enough to read a white app card on.
 */

export const MESH = {
  sky: { a: "#8ec2f1", b: "#b9d9f5", c: "#dceaf7", base: "#f3f7fb" },
  amber: { a: "#f5cf7a", b: "#fbe2a6", c: "#fdf0cf", base: "#fdf8ec" },
  mint: { a: "#a9bf96", b: "#cfd8bf", c: "#e5ecd9", base: "#f5f7f0" },
  violet: { a: "#d2aeea", b: "#e4d0f4", c: "#f1e7fa", base: "#faf6fd" },
  coral: { a: "#fbb89a", b: "#ffd8c4", c: "#d9dcea", base: "#fdf5f1" },
  blue: { a: "#8fd3d6", b: "#c4e6ea", c: "#e2f3f4", base: "#f5fbfb" },
  /** Paper and soft stone: a quiet ground for when what sits on it brings the colour (the close's bento). */
  stone: { a: "#d9d6d0", b: "#e5e3de", c: "#efedea", base: "#f8f7f5" },
} as const;

export type MeshFamily = keyof typeof MESH;

/** How the pools move: a lazy drift, a slow swirl round the centre, or a tide side to side. */
export type MeshMotion = "drift" | "swirl" | "tide";

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

type Pool = { color: keyof (typeof MESH)["sky"]; size: number; x: number; y: number; ax: number; ay: number; sx: number; sy: number; phase: number };

/** Pools sit toward the corners, like the site's mesh, so the centre stays light. */
const POOLS: Pool[] = [
  { color: "a", size: 1.05, x: 0.02, y: 0.04, ax: 0.1, ay: 0.08, sx: 0.07, sy: 0.05, phase: 0 },
  { color: "b", size: 0.95, x: 0.98, y: 0.98, ax: 0.09, ay: 0.1, sx: 0.06, sy: 0.08, phase: 1.7 },
  { color: "c", size: 0.85, x: 0.98, y: 0.02, ax: 0.08, ay: 0.07, sx: 0.05, sy: 0.07, phase: 3.1 },
  { color: "c", size: 0.8, x: 0.02, y: 0.98, ax: 0.07, ay: 0.09, sx: 0.08, sy: 0.05, phase: 4.4 },
  { color: "b", size: 0.6, x: 0.55, y: 0.12, ax: 0.14, ay: 0.06, sx: 0.04, sy: 0.06, phase: 2.2 },
];

const place = (p: Pool, motion: MeshMotion, t: number) => {
  const w = t + p.phase * 3;
  if (motion === "swirl") {
    // Each pool circles its home slowly; together they seem to turn.
    const a = w * 0.09 + p.phase;
    return { x: p.x + Math.cos(a) * p.ax, y: p.y + Math.sin(a) * p.ay, s: 1 + Math.sin(w * 0.11) * 0.08 };
  }
  if (motion === "tide") {
    // A long swell from side to side, the pools rising and falling with it.
    return { x: p.x + Math.sin(w * 0.07) * p.ax * 1.4, y: p.y + Math.sin(w * 0.13 + p.phase) * p.ay * 0.5, s: 1 + Math.sin(w * 0.07) * 0.1 };
  }
  // drift: two slow, unrelated sines per axis, so it never quite repeats.
  return {
    x: p.x + Math.sin(w * p.sx * 1.6) * p.ax + Math.sin(w * 0.031) * 0.03,
    y: p.y + Math.cos(w * p.sy * 1.6) * p.ay + Math.cos(w * 0.027) * 0.03,
    s: 1 + Math.sin(w * 0.09 + p.phase) * 0.07,
  };
};

export const MeshGround: React.FC<{
  family: MeshFamily;
  motion?: MeshMotion;
  t: number;
  opacity?: number;
  /** The area it fills (default: the whole stage). Pools scale with it. */
  width?: number;
  height?: number;
}> = ({ family, motion = "drift", t, opacity = 1, width = 1920, height = 1080 }) => {
  const m = MESH[family];
  return (
    <AbsoluteFill style={{ opacity, background: m.base, overflow: "hidden" }}>
      {POOLS.map((p, i) => {
        const at = place(p, motion, t);
        const size = width * p.size * at.s;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: at.x * width - size / 2,
              top: at.y * height - size / 2,
              width: size,
              height: size,
              borderRadius: "50%",
              background: `radial-gradient(closest-side, ${m[p.color]} 0%, ${m[p.color]}cc 30%, ${m[p.color]}00 100%)`,
            }}
          />
        );
      })}
      {/* A faint sheen of light passing across, slower than you'd notice. */}
      <div
        style={{
          position: "absolute",
          left: (width / 1920) * (-1200 + ((t * 22) % 4300)),
          top: (height / 1080) * -300,
          width: (width / 1920) * 900,
          height: (height / 1080) * 1700,
          transform: "rotate(24deg)",
          background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0) 100%)",
        }}
      />
      <AbsoluteFill style={{ backgroundImage: GRAIN, opacity: 0.18, mixBlendMode: "soft-light" }} />
    </AbsoluteFill>
  );
};
