import type { CursorKind, TakeEvent } from "../intro/take-types";

/**
 * The cursor you see is drawn from the capture's pointer log, not filmed.
 * The raw path runs through a critically damped spring, which is what makes
 * it glide the way Screen Studio's does instead of tracking every jitter.
 */

export type CursorSample = { x: number; y: number; kind: CursorKind };
export type CursorTrack = {
  /** Spring-smoothed position at `ms` into the take. */
  at: (ms: number) => CursorSample;
  /** Clicks (desktop) and taps (phone), for the press ripple. */
  presses: { t: number; x: number; y: number; kind: "click" | "tap" }[];
};

const STEP_MS = 1000 / 120;
const STIFFNESS = 260;
const DAMPING = 2 * Math.sqrt(STIFFNESS); // critically damped: no overshoot

const cache = new WeakMap<TakeEvent[], CursorTrack>();

export const buildCursorTrack = (events: TakeEvent[], durationMs: number): CursorTrack => {
  const hit = cache.get(events);
  if (hit) return hit;

  const moves = events.filter((e): e is Extract<TakeEvent, { kind: "move" }> => e.kind === "move");
  const presses = events
    .filter((e) => e.kind === "down" || e.kind === "tap")
    .map((e) => {
      const p = e as Extract<TakeEvent, { kind: "down" | "tap" }>;
      return { t: p.t, x: p.x, y: p.y, kind: p.kind === "tap" ? ("tap" as const) : ("click" as const) };
    });

  const raw = (ms: number): { x: number; y: number; cursor: CursorKind } => {
    if (!moves.length) return { x: 0, y: 0, cursor: "arrow" };
    if (ms <= moves[0].t) return moves[0];
    let lo = 0;
    let hi = moves.length - 1;
    if (ms >= moves[hi].t) return moves[hi];
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (moves[mid].t <= ms) lo = mid;
      else hi = mid;
    }
    const a = moves[lo];
    const b = moves[hi];
    const u = (ms - a.t) / Math.max(1, b.t - a.t);
    return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, cursor: u < 0.5 ? a.cursor : b.cursor };
  };

  const n = Math.ceil(durationMs / STEP_MS) + 2;
  const xs = new Float32Array(n);
  const ys = new Float32Array(n);
  const start = raw(0);
  let x = start.x;
  let y = start.y;
  let vx = 0;
  let vy = 0;
  const dt = STEP_MS / 1000;
  for (let i = 0; i < n; i++) {
    const target = raw(i * STEP_MS);
    vx += (STIFFNESS * (target.x - x) - DAMPING * vx) * dt;
    vy += (STIFFNESS * (target.y - y) - DAMPING * vy) * dt;
    x += vx * dt;
    y += vy * dt;
    xs[i] = x;
    ys[i] = y;
  }

  const track: CursorTrack = {
    presses,
    at: (ms) => {
      const i = Math.max(0, Math.min(n - 1, Math.round(ms / STEP_MS)));
      return { x: xs[i], y: ys[i], kind: raw(ms).cursor };
    },
  };
  cache.set(events, track);
  return track;
};
