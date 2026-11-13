import React from "react";
import { interpolate } from "remotion";
import type { CursorTrack } from "./track";

/** macOS-style pointers, drawn larger than life the way Screen Studio does. */
const SIZE = 30;

const Arrow = () => (
  <svg width={SIZE} height={SIZE} viewBox="0 0 24 24" style={{ overflow: "visible" }}>
    <path d="M5 2.5 L5 19.5 L9.4 15.3 L12.2 21.6 L15 20.4 L12.3 14.2 L18.4 14.2 Z" fill="#0d0e12" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
);

const Hand = () => (
  <svg width={SIZE} height={SIZE} viewBox="0 0 24 24" style={{ overflow: "visible" }}>
    <path
      d="M9.2 3.2c.9 0 1.6.7 1.6 1.6v6l.5-.1V9.5c0-.9.7-1.5 1.5-1.5s1.5.6 1.5 1.5v1.4l.4-.1v-.6c0-.8.7-1.4 1.5-1.4s1.4.6 1.4 1.4v1.3h.2c.8 0 1.4.6 1.4 1.4v3.6c0 3.2-2.4 5.7-5.6 5.7h-1.5c-1.8 0-3.4-.9-4.4-2.4l-3.2-4.8c-.5-.7-.3-1.6.4-2.1.7-.4 1.6-.3 2.1.4l.9 1.2V4.8c0-.9.7-1.6 1.7-1.6Z"
      fill="#fff"
      stroke="#0d0e12"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
  </svg>
);

const IBeam = () => (
  <svg width={SIZE} height={SIZE} viewBox="0 0 24 24" style={{ overflow: "visible" }}>
    <path d="M9 3.5h2.2c.4 0 .8.4.8.8v15.4c0 .4-.4.8-.8.8H9M15 3.5h-2.2c-.4 0-.8.4-.8.8v15.4c0 .4.4.8.8.8H15" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" />
    <path d="M9 3.5h2.2c.4 0 .8.4.8.8v15.4c0 .4-.4.8-.8.8H9M15 3.5h-2.2c-.4 0-.8.4-.8.8v15.4c0 .4.4.8.8.8H15" fill="none" stroke="#0d0e12" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

/** Hotspot offsets so the tip (or the I-beam's middle) sits on the logged point. */
const HOTSPOT = { arrow: [-6, -3], pointer: [-11, -4], text: [-15, -15] } as const;

export const CursorLayer: React.FC<{
  track: CursorTrack;
  ms: number;
  device: "desktop" | "phone";
  /** Fade the cursor in at the start of a beat. */
  opacity?: number;
}> = ({ track, ms, device, opacity = 1 }) => {
  const press = [...track.presses].reverse().find((p) => p.t <= ms && ms - p.t < 600);
  const pressAge = press ? ms - press.t : 1e9;

  if (device === "phone") {
    if (!press) return null;
    const grow = interpolate(pressAge, [0, 450], [0.6, 1.5], { extrapolateRight: "clamp" });
    const fade = interpolate(pressAge, [0, 120, 600], [0, 0.55, 0], { extrapolateRight: "clamp" });
    return (
      <div
        style={{
          position: "absolute",
          left: press.x - 22,
          top: press.y - 22,
          width: 44,
          height: 44,
          borderRadius: 22,
          background: "rgba(255,255,255,0.65)",
          border: "2px solid rgba(13,14,18,0.25)",
          transform: `scale(${grow})`,
          opacity: fade,
        }}
      />
    );
  }

  const p = track.at(ms);
  const [hx, hy] = HOTSPOT[p.kind];
  // A press dips the pointer a touch, and a soft ring spreads from the tip.
  const dip = press ? interpolate(pressAge, [0, 90, 220], [1, 0.84, 1], { extrapolateRight: "clamp" }) : 1;
  const ring = press ? interpolate(pressAge, [0, 500], [0, 1], { extrapolateRight: "clamp" }) : 1;
  return (
    <>
      {press ? (
        <div
          style={{
            position: "absolute",
            left: press.x - 24,
            top: press.y - 24,
            width: 48,
            height: 48,
            borderRadius: 24,
            border: "2.5px solid rgba(0,110,255,0.55)",
            transform: `scale(${0.4 + ring * 0.9})`,
            opacity: (1 - ring) * opacity,
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          left: p.x + hx,
          top: p.y + hy,
          opacity,
          transform: `scale(${dip})`,
          transformOrigin: `${-hx}px ${-hy}px`,
          filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.25))",
        }}
      >
        {p.kind === "pointer" ? <Hand /> : p.kind === "text" ? <IBeam /> : <Arrow />}
      </div>
    </>
  );
};
