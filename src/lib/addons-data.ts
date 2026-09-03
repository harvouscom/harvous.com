import { APP_UPGRADE_URL, PRICING_ROADMAP } from "./pricing-data.ts";
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
      "Shared spaces where your group contributes notes together. Joining is free; hosting is Harvous Plus.",
    seoTitle: "Shared Spaces — Harvous Plus",
    seoDescription:
      "Shared Spaces let your whole group study in the same threads — questions, discoveries, and scripture references that live beyond the hour you meet. Hosting is included with Harvous Plus; joining is always free.",
    icon: "fa7-solid:user-group",
    ink: "var(--study-dock-accent-coralRose)",
    image: "/images/auth-hero/ai_bg_045.webp",
    comingSoon: false,
    heroTitle: "A shared space where your whole group can study together.",
    heroLead:
      "You lead the discussion. Your group has realizations out loud. Shared Spaces keep what you build together — in threads that live beyond the hour you meet.",
    sections: [
      {
        heading: "What the group discovers shouldn't disappear.",
        paragraphs: [
          "Personal Harvous is already where your prep and reflections live. Shared Spaces add a group layer — the same threads, scripture pills, and highlights you use alone, opened up so everyone in the space can contribute.",
          "Joining a shared space is free for members. Hosting — creating spaces for your group — is included with [Harvous Plus](/pricing/) ($5/mo or $45/yr; Founding $30/yr for the first 99).",
        ],
      },
      {
        heading: "Built on the study Bible you already use",
        paragraphs: [
          "You don't switch apps or rebuild your workflow. Your private notes stay private. What you add to the shared space is what the group sees — prep stays in your personal folders until you choose to share it.",
        ],
      },
      {
        heading: "Turn a thread into a study plan the room reads together",
        paragraphs: [
          "Any thread in the space can become a study plan. Publish it and the room reads along on the same page, instead of everyone catching up separately or flipping back to find where the group left off.",
          "Preview a plan publicly before you publish it, so you know what the group will see.",
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
          "Look back at what the group found, weeks after the night everyone was in the room.",
        ],
        image: "/app-organize.png",
        imageAlt: "Notes organized into folders and threads in Harvous",
      },
    ],
    moments: [
      {
        icon: "fa7-solid:user-group",
        heading: "A shared space for your group",
        body: "Everyone in the group can add to the same threads. Questions, answers, connections — all in one place that lives beyond the hour you meet.",
      },
      {
        icon: "fa7-solid:list",
        heading: "Threads per week or topic",
        body: "Each week or topic gets its own thread. Everyone's notes from that session live together so you can look back at what the group found.",
      },
      {
        icon: "fa7-solid:lock",
        heading: "You stay in control",
        body: "You set up the space and invite who belongs. You decide what threads exist and what the group can see.",
      },
      {
        icon: "fa7-solid:user",
        heading: "Keep your prep notes private",
        body: "Your own notes on the passage stay in your personal space. The group only sees what you add to the shared one.",
      },
      {
        icon: "fa7-solid:route",
        heading: "A thread becomes a study plan",
        body: "Publish a thread as a study plan and the room reads along together — everyone on the same page, not catching up on their own.",
      },
    ],
    relatedIds: ["review", "challenges", "connector"],
    relatedHeading: "Harvous free + what's next",
    relatedLead:
      "Shared Spaces hosting is included with Harvous Plus. See the free plan — and what's coming next on the roadmap.",
    closingHeading: "Lead your group. Keep what you build together.",
    closingLead:
      "Get Harvous Plus to host shared spaces — joining is always free for your group.",
    closingHref: APP_UPGRADE_URL,
    closingLabel: "Get Harvous Plus",
    draft: false,
  },
  {
    kind: "addon",
    slug: "review",
    href: "/add-ons/review/",
    title: "Review",
    tagline: "Write an answer from memory, then say how it went — from your own notes, highlights, and verses.",
    seoTitle: "Review — deliberate practice for what you've studied | Harvous Plus",
    seoDescription:
      "Review turns your own notes, highlights, and verses into short questions. Write what you remember first, then say how close you were — no AI-written questions, no score.",
    icon: "fa7-solid:clock-rotate-left",
    ink: "var(--study-dock-accent-violet)",
    image: "/images/auth-hero/ai_bg_075.webp",
    comingSoon: false,
    heroTitle: "A deliberate way to hold onto what you've studied.",
    heroLead:
      "Suggestions brings things back when they happen to be worth another look. Review is the version you ask for — a short question pulled from something you actually wrote, answered from memory before you see the source.",
    sections: [
      {
        heading: "Write it before you see it",
        paragraphs: [
          "A Review question comes from a note, a highlight, a verse, a connection between two notes, or a whole thread — always something you already wrote or marked, never a question invented about the text. Write what you remember first. The source only appears after.",
          "Then you say how it went — held it, mostly had it, or needed the reminder. No score, no streak to protect. Just an honest read on where that one actually stands.",
        ],
      },
      {
        heading: "Comes back sooner or later, depending",
        paragraphs: [
          "How you answer decides when it returns. Needed the reminder, and it's back the next day. Held it a few times in a row, and the gap between visits keeps widening — the things you know well stop asking for your attention, and the ones still forming keep showing up.",
          "It's arithmetic, not a model guessing at what you might have forgotten. The same note, the same question, every time — until it stops needing to come back at all.",
        ],
      },
    ],
    showcases: [],
    moments: [
      {
        icon: "fa7-solid:pen",
        heading: "Your own material, not an invented question",
        body: "Every question is pulled from a note, highlight, verse, connection, or thread you already have. Nothing is written about the text on your behalf.",
      },
      {
        icon: "fa7-solid:pen-to-square",
        heading: "Answer first, then look",
        body: "Write what you remember before the source appears. Seeing it too early isn't practice — it's just reading again.",
      },
      {
        icon: "fa7-solid:arrows-rotate",
        heading: "The gap grows as you hold it",
        body: "Answer well a few times in a row and the return trip gets longer. Struggle, and it comes back sooner — no streak, no leaderboard, just where that one thing actually stands.",
      },
      {
        icon: "fa7-solid:book-bible",
        heading: "Stays where you were",
        body: "A question shows up in a card next to your study, not a separate page you have to leave your notes to visit.",
      },
    ],
    relatedIds: ["shared-spaces", "connector"],
    relatedHeading: "Harvous free + what's next",
    relatedLead:
      "Review is included with Harvous Plus — there's no free tier for it. See the free plan, and what else is on the roadmap.",
    closingHeading: "Hold onto what you've studied, on purpose.",
    closingLead: "Get Harvous Plus for Review — spaced practice built from your own notes.",
    closingHref: APP_UPGRADE_URL,
    closingLabel: "Get Harvous Plus",
    draft: false,
  },
  {
    kind: "addon",
    slug: "challenges",
    href: "/add-ons/challenges/",
    title: "Challenges",
    tagline: "Time-boxed study to build the habit, solo or with others.",
    seoTitle: "Challenges — Harvous add-on",
    seoDescription:
      "Time-boxed study to build the habit, solo or with others. Included with Harvous Plus when it ships.",
    icon: "fa7-solid:trophy",
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
    icon: "fa7-solid:puzzle-piece",
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
  return PRICING_ROADMAP.find((a) => a.id === slug);
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
