/** Pricing plan cards — shared by /pricing/ page. */
import { fathomSignup } from "./fathom-events.ts";

export type PricingPlanCta = {
  label: string;
  href: string;
  external?: boolean;
  fathomTrack?: string;
};

/** Free or paid plan shown as a primary card. */
export type PricingPlan = {
  id: "free" | "plus";
  icon: string;
  name: string;
  priceDisplay: string;
  /** Optional second price shown after a tiny “OR” (e.g. founding yearly). */
  priceDisplaySecondary?: string;
  /** Secondary price line under the main price (e.g. founding cap). */
  priceNote?: string;
  tagline: string;
  features: string[];
  /** Features included in the plan but not shipped yet. */
  comingSoonFeatures?: string[];
  cta: PricingPlanCta;
  /** Asterisk fine print under the CTA. */
  finePrint?: string;
};

/** Compact roadmap row — not sold as separate Shared Spaces SKUs. */
export type PricingRoadmapItem = {
  id: string;
  icon: string;
  name: string;
  tagline: string;
  /** Badge label (defaults to "Coming later"). */
  soonLabel?: string;
};

/** @deprecated Prefer PricingRoadmapItem — kept for existing call sites. */
export type PricingAddon = PricingRoadmapItem;

/** @deprecated Prefer PricingPlan — Free is no longer a separate type. */
export type FreePlan = PricingPlan & { id: "free" };

/** Opens the in-app Plus page; signed-out users get sign-up/sign-in with return to /upgrade. */
export const APP_UPGRADE_URL = "https://app.harvous.com/upgrade?from=pricing";

export const FREE_PLAN: PricingPlan = {
  id: "free",
  icon: "fa7-solid:book-open-reader",
  name: "Free",
  priceDisplay: "$0",
  tagline: "For personal Bible study",
  features: [
    "Unlimited notes",
    "Scripture pills, highlights, threads, and @ mentions",
    "Built-in Bible reader",
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

export const PLUS_PLAN: PricingPlan = {
  id: "plus",
  icon: "fa7-solid:plus",
  name: "Harvous Plus",
  priceDisplay: "$5/mo",
  priceDisplaySecondary: "$30/yr*",
  tagline: "More than a private study Bible",
  features: [
    "Everything in free",
    "Unlimited shared spaces",
    "Up to 50 people per space",
    "Turn a thread into a study plan your group reads together",
    "Joining is always free",
  ],
  comingSoonFeatures: [
    "Review — practice from your notes",
    "Challenges — guided study seasons",
  ],
  cta: {
    label: "Get Harvous Plus",
    href: APP_UPGRADE_URL,
    external: true,
    fathomTrack: fathomSignup.pricingPlus,
  },
  finePrint: "*founding price for the first 99. Then $45/yr",
};

/** Roadmap items shown under Free + Plus (not for sale yet as separate products). */
export const PRICING_ROADMAP: PricingRoadmapItem[] = [
  {
    id: "review",
    icon: "fa7-solid:clock-rotate-left",
    name: "Review",
    tagline: "Spaced practice from your notes, highlights, and passages. Included with Plus when it ships.",
    soonLabel: "Coming later",
  },
  {
    id: "challenges",
    icon: "fa7-solid:trophy",
    name: "Challenges",
    tagline: "Themed study seasons with guides, leaderboards, and more. Included with Plus when it ships.",
    soonLabel: "Coming later",
  },
  {
    id: "connector",
    icon: "fa7-solid:puzzle-piece",
    name: "Connector",
    tagline: "Reference your Harvous study wherever you already work.",
    soonLabel: "Coming later",
  },
];

/** @deprecated Use PRICING_ROADMAP */
export const PRICING_ADDONS = PRICING_ROADMAP;
