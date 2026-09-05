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
          "Joining a shared space is free for members. Hosting — creating spaces for your group — is included with [Harvous Plus](/pricing/) ($6/mo or $36/yr).",
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
    tagline: "Short questions built from your own study, with answers Harvous checks.",
    seoTitle: "Review — deliberate practice for what you've studied | Harvous Plus",
    seoDescription:
      "Review turns your own notes, the verses you keep, and the chapters you read into short questions with real answers. No question is written by AI, and there is no score, streak, or leaderboard.",
    icon: "fa7-solid:clock-rotate-left",
    ink: "var(--study-dock-accent-violet)",
    image: "/images/auth-hero/ai_bg_075.webp",
    comingSoon: false,
    heroTitle: "A deliberate way to hold onto what you've studied.",
    heroLead:
      "Suggestions brings things back when they happen to be worth another look. Review is the version you ask for — a short question drawn from what you actually wrote, kept, or read, with an answer Harvous can check.",
    sections: [
      {
        heading: "Your own material, and a real answer",
        paragraphs: [
          "A question comes from a note you wrote, a verse you kept, or a chapter you actually read — never one invented about the text. Finish a verse from memory, put three of them in the order they come, pick the verse that belongs to a chapter, or say who appears in it.",
          "Every question has a right answer and Harvous checks it. The result names what was asked, marks the words you got, and shows how the passage actually reads — so a question you missed is one you can sit with. It checks facts, never what a passage means to you or how you chose to say it.",
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
        heading: "Built from your study, not about it",
        body: "Every question comes from a note you wrote, a verse you kept, or a chapter you read. Nothing is composed on your behalf, by a model or otherwise.",
      },
      {
        icon: "fa7-solid:pen-to-square",
        heading: "Checked, and shown its working",
        body: "The result names the question, marks what you answered, and puts the passage underneath — a recap, not just a verdict.",
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
