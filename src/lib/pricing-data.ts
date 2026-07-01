/** Pricing plan cards — shared by /pricing/ page. */
import { fathomSignup } from "./fathom-events.ts";

export type PricingAddon = {
  id: string;
  icon: string;
  name: string;
  tagline: string;
};

export type FreePlan = {
  id: "free";
  icon: string;
  name: string;
  priceDisplay: string;
  tagline: string;
  features: string[];
  cta: {
    label: string;
    href: string;
    external?: boolean;
    fathomTrack?: string;
  };
};

export const FREE_PLAN: FreePlan = {
  id: "free",
  icon: "fa6-solid:book-open-reader",
  name: "Free",
  priceDisplay: "$0",
  tagline: "For personal Bible study",
  features: [
    "Unlimited notes",
    "Scripture pills, highlights, and threads",
    "Built-in dictionary and daily passage",
    "Offline sync across devices",
    "Sharable notes via link",
    "Built-in Recall (automatically resurfaces the past)",
  ],
  cta: {
    label: "Sign up free",
    href: "https://app.harvous.com/sign-up",
    external: true,
    fathomTrack: fathomSignup.pricing,
  },
};

export const PRICING_ADDONS: PricingAddon[] = [
  {
    id: "review",
    icon: "fa6-solid:clock-rotate-left",
    name: "Review",
    tagline: "Spaced practice from your notes, highlights, and passages.",
  },
  {
    id: "shared-spaces",
    icon: "fa6-solid:people-group",
    name: "Shared Spaces",
    tagline: "Study together — everyone contributes to the same threads.",
  },
  {
    id: "challenges",
    icon: "fa6-solid:trophy",
    name: "Challenges",
    tagline: "Themed study seasons with guides, leaderboards, and more.",
  },
];
