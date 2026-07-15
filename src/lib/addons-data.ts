import { PRICING_ADDONS } from "./pricing-data.ts";
import type { ProductPage } from "./product-page-data.ts";

export type AddonPage = ProductPage & {
  draft: boolean;
  soonLabel?: string;
};

const ADDON_PAGES: AddonPage[] = [
  {
    kind: "addon",
    slug: "shared-spaces",
    href: "/add-ons/shared-spaces/",
    title: "Shared Spaces",
    tagline:
      "Shared spaces where your group contributes notes together. Joining is free.",
    seoTitle: "Shared Spaces — Harvous add-on",
    seoDescription:
      "Shared Spaces let your whole group study in the same threads — questions, insights, and scripture references that live beyond the hour you meet.",
    icon: "fa6-solid:user-group",
    ink: "var(--study-dock-accent-coralRose)",
    image: "/images/auth-hero/ai_bg_045.webp",
    comingSoon: true,
    comingSoonLine: "Coming soon",
    heroTitle: "A shared space where your whole group can study together.",
    heroLead:
      "You lead the discussion. Your group has realizations out loud. Shared Spaces keep what you build together — in threads that live beyond the hour you meet.",
    sections: [
      {
        heading: "What the group discovers shouldn't disappear.",
        paragraphs: [
          "Personal Harvous is already where your prep and reflections live. Shared Spaces add a group layer — the same threads, scripture pills, and highlights you use alone, opened up so everyone in the space can contribute.",
          "Joining a shared space is free for members. The space owner adds the paid add-on when they're ready to open a room for the group.",
        ],
      },
      {
        heading: "Built on the study Bible you already use",
        paragraphs: [
          "You don't switch apps or rebuild your workflow. Your private notes stay private. What you add to the shared space is what the group sees — prep stays in your personal folders until you choose to share it.",
        ],
      },
    ],
    showcases: [
      {
        eyebrow: "Group study",
        title: "Threads your whole group can add to",
        color: "coral",
        body: [
          "Week four of your James study gets its own thread. Everyone's notes from that session live together — questions, answers, and scripture references in one place.",
          "Look back at what the group found without trying to remember who said what.",
        ],
        image: "/app-organize.png",
        imageAlt: "Notes organized into folders and threads in Harvous",
      },
    ],
    moments: [
      {
        icon: "fa6-solid:user-group",
        heading: "A shared space for your group",
        body: "Everyone in the group can add to the same threads. Questions, answers, connections — all in one place that lives beyond the hour you meet.",
      },
      {
        icon: "fa6-solid:list",
        heading: "Threads per week or topic",
        body: "Each week or topic gets its own thread. Everyone's notes from that session live together so you can look back at what the group found.",
      },
      {
        icon: "fa6-solid:lock",
        heading: "You stay in control",
        body: "You set up the space and invite who belongs. You decide what threads exist and what the group can see.",
      },
      {
        icon: "fa6-solid:user",
        heading: "Keep your prep notes private",
        body: "Your own notes on the passage stay in your personal space. The group only sees what you add to the shared one.",
      },
    ],
    relatedIds: ["review", "challenges", "connector"],
    relatedHeading: "Harvous free + other add-ons",
    relatedLead:
      "Shared Spaces builds on the free plan. See what else is included — and what's coming next on the roadmap.",
    closingHeading: "Lead your group. Keep what you build together.",
    closingLead: "Sign up free today — Shared Spaces will be an optional paid add-on when it launches.",
    draft: false,
  },
  {
    kind: "addon",
    slug: "review",
    href: "/add-ons/review/",
    title: "Review",
    tagline: "Spaced practice from your notes, highlights, and passages.",
    seoTitle: "Review — Harvous add-on",
    seoDescription: "Spaced practice from your notes, highlights, and passages.",
    icon: "fa6-solid:clock-rotate-left",
    ink: "var(--study-dock-accent-violet)",
    heroTitle: "Review",
    heroLead: "Coming later.",
    sections: [],
    showcases: [],
    moments: [],
    relatedIds: [],
    relatedHeading: "",
    relatedLead: "",
    closingHeading: "Review",
    closingLead: "",
    draft: true,
    soonLabel: "Coming later",
  },
  {
    kind: "addon",
    slug: "challenges",
    href: "/add-ons/challenges/",
    title: "Challenges",
    tagline: "Themed study seasons with guides, leaderboards, and more.",
    seoTitle: "Challenges — Harvous add-on",
    seoDescription: "Themed study seasons with guides, leaderboards, and more.",
    icon: "fa6-solid:trophy",
    ink: "var(--study-dock-accent-warmAmber)",
    heroTitle: "Challenges",
    heroLead: "Coming later.",
    sections: [],
    showcases: [],
    moments: [],
    relatedIds: [],
    relatedHeading: "",
    relatedLead: "",
    closingHeading: "Challenges",
    closingLead: "",
    draft: true,
    soonLabel: "Coming later",
  },
  {
    kind: "addon",
    slug: "connector",
    href: "/add-ons/connector/",
    title: "Connector",
    tagline: "Reference your Harvous study wherever you already work.",
    seoTitle: "Connector — Harvous add-on",
    seoDescription: "Reference your Harvous study wherever you already work.",
    icon: "fa6-solid:puzzle-piece",
    ink: "var(--study-dock-accent-mintGreen)",
    heroTitle: "Connector",
    heroLead: "Coming later.",
    sections: [],
    showcases: [],
    moments: [],
    relatedIds: [],
    relatedHeading: "",
    relatedLead: "",
    closingHeading: "Connector",
    closingLead: "",
    draft: true,
    soonLabel: "Coming later",
  },
];

/** Card fields from pricing-data for pages that share the same ids. */
export function getPricingAddonCard(slug: string) {
  return PRICING_ADDONS.find((a) => a.id === slug);
}

export function getAddonPages(): AddonPage[] {
  return ADDON_PAGES;
}

export function getAddonBySlug(slug: string): AddonPage | undefined {
  return ADDON_PAGES.find((a) => a.slug === slug);
}

export function getPublishedAddonSlugs(): Set<string> {
  return new Set(ADDON_PAGES.filter((a) => !a.draft).map((a) => a.slug));
}

export function getAddonDetailHref(slug: string): string | undefined {
  const addon = getAddonBySlug(slug);
  return addon && !addon.draft ? addon.href : undefined;
}
