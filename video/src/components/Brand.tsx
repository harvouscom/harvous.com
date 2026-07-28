import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { FaIcon, type IconName } from "../icons";

const accent = "#006eff";

/** Matches site `.hero-video-callout`, larger + Google Sans. */
export const FeatureLabel: React.FC<{
  label: string;
  icon: IconName;
  durationInFrames: number;
}> = ({ label, icon, durationInFrames }) => {
  const frame = useCurrentFrame();
  const holdUntil = Math.min(110, Math.max(56, Math.floor(durationInFrames * 0.42)));
  const opacity = interpolate(
    frame,
    [0, 10, holdUntil, holdUntil + 14],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const y = interpolate(frame, [0, 10], [12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: 52,
        bottom: 52,
        opacity,
        transform: `translateY(${y}px)`,
        display: "inline-flex",
        alignItems: "center",
        gap: 14,
        padding: "10px 22px 10px 10px",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.38)",
        background: "rgba(13, 14, 18, 0.62)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        color: "#fff",
        fontFamily: '"Google Sans", ui-sans-serif, system-ui, sans-serif',
        fontSize: 26,
        fontWeight: 550,
        letterSpacing: "-0.01em",
        lineHeight: 1,
        zIndex: 5,
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          width: 44,
          height: 44,
          borderRadius: "50%",
          color: "#fff",
          background: `linear-gradient(171deg, #2bb5ff 7%, ${accent} 93%)`,
          boxShadow: "0 1px 0 rgba(255, 255, 255, 0.25) inset",
        }}
      >
        <FaIcon name={icon} size={20} color="#fff" />
      </span>
      {label}
    </div>
  );
};
