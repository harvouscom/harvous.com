import React from "react";
import { Easing, interpolate } from "remotion";
import { BLOCK_ICONS, type BlockIconName } from "./blockIcons";
import type { MeshFamily } from "./Mesh";

/**
 * The site's feature icon tiles (ProductDetailPage `.pd-moment__tile`).
 *
 * Every feature on harvous.com belongs to a category, and the category's
 * colour does three jobs there: it tints the tile, it inks the icon, and it
 * picks the mesh behind the feature's walkthrough (`CATEGORY_MESH` in
 * FeatureWalkthrough.astro). The video does the same, so a chapter's block and
 * its ground always agree. Values: src/lib/feature-categories-data.ts.
 */
export const FEATURE_CATEGORY = {
  activity: { ink: "#2a9ed6", mesh: "sky" },
  read: { ink: "#9250c0", mesh: "violet" },
  write: { ink: "#d4ac00", mesh: "amber" },
  find: { ink: "#26c01c", mesh: "mint" },
  share: { ink: "#e84f83", mesh: "coral" },
  /** Review exercises, the Plus add-on, has its own violet (addons-data.ts). */
  review: { ink: "#9d5ac7", mesh: "violet" },
} as const satisfies Record<string, { ink: string; mesh: MeshFamily }>;

export type FeatureCategory = keyof typeof FEATURE_CATEGORY;

/**
 * How dark the icon is: the site darkens it for each later feature in a
 * category (getFeatureInk tiers 55/42/32/24/18), as a percentage of the
 * category colour mixed into ink.
 */
export type InkTier = 55 | 50 | 42 | 32 | 24 | 18;

export const IconBlock: React.FC<{
  icon: BlockIconName;
  category: FeatureCategory;
  tier: InkTier;
  size: number;
  rotate?: number;
  /** A colour of its own instead of the category's (the close's bento cards bring their tone). */
  ink?: string;
  style?: React.CSSProperties;
}> = ({ icon, category, tier, size, rotate = 0, ink: inkOverride, style }) => {
  const ink = inkOverride ?? FEATURE_CATEGORY[category].ink;
  const i = BLOCK_ICONS[icon];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "30%",
        // The site's tile: the category colour over white (a touch deeper than
        // the site's 14%, since here it sits on a mesh of the same colour)…
        background: `color-mix(in oklab, ${ink} 18%, #ffffff)`,
        // …and the icon in that colour mixed into ink by the feature's tier.
        color: `color-mix(in oklab, ${ink} ${tier}%, #0d0e12)`,
        display: "grid",
        placeItems: "center",
        transform: `rotate(${rotate}deg)`,
        // …lifted off that mesh by a crisp white ring, a hairline of its own
        // colour, and a soft shadow.
        border: `1px solid color-mix(in oklab, ${ink} 26%, #ffffff)`,
        boxShadow: [
          `0 0 0 ${Math.max(2, size * 0.04)}px rgba(255,255,255,0.96)`,
          `0 ${size * 0.16}px ${size * 0.36}px -${size * 0.12}px rgba(13,30,60,0.42)`,
          `0 ${size * 0.04}px ${size * 0.08}px rgba(13,30,60,0.08)`,
          "inset 0 1px 0 rgba(255,255,255,0.85)",
        ].join(", "),
        boxSizing: "border-box",
        ...style,
      }}
    >
      <svg
        viewBox={`0 0 ${i.size} ${i.size}`}
        width={size * 0.45}
        height={size * 0.45}
        aria-hidden
        dangerouslySetInnerHTML={{ __html: i.body }}
      />
    </div>
  );
};

/**
 * A falling block: drops in under gravity (y ∝ t², like the blog's pyramid),
 * tips, and settles with a small bounce. `t` is seconds since it started.
 */
export const fallIn = (t: number, { from = -220, tip = 9 }: { from?: number; tip?: number } = {}) => {
  const fall = 0.55;
  const u = Math.min(1, Math.max(0, t / fall));
  const y = t < fall ? from * (1 - u * u) : 0;
  const bounce = t >= fall ? Math.sin(Math.min(1, (t - fall) / 0.35) * Math.PI) * -10 * Math.exp(-(t - fall) * 4) : 0;
  const rotate = interpolate(t, [0, fall, fall + 0.5], [tip, -tip * 0.3, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const opacity = interpolate(t, [0, 0.12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return { y: y + bounce, rotate, opacity };
};
