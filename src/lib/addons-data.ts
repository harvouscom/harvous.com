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
    heroTitle: "One space where your group studies together.",
    heroLead:
      "Your group studies in the same threads, and what you find together stays.",
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
        visual: "group-threads",
        label: "A group's thread for week four of James, with notes and passages from three members",
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
    relatedIds: ["review-exercises", "challenges", "connector"],
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
    slug: "review-exercises",
    href: "/add-ons/review-exercises/",
    title: "Review exercises",
    tagline: "Short questions built from your own study, with answers Harvous checks.",
    seoTitle: "Review exercises — deliberate practice for what you've studied | Harvous Plus",
    seoDescription:
      "Review exercises turn your own notes, the verses you keep, and the chapters you read into short questions with real answers. No question is written by AI, and there is no score, streak, or leaderboard.",
    icon: "fa7-solid:clock-rotate-left",
    ink: "var(--study-dock-accent-violet)",
    image: "/images/auth-hero/ai_bg_075.webp",
    comingSoon: false,
    heroTitle: "A deliberate way to keep what you studied.",
    heroLead:
      "Short questions from what you wrote, kept or read, with answers Harvous can check.",
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
      "Review exercises are included with Harvous Plus — there's no free tier for them. See the free plan, and what else is on the roadmap.",
    closingHeading: "Hold onto what you've studied, on purpose.",
    closingLead: "Get Harvous Plus for Review exercises — spaced practice built from your own notes.",
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
    tagline: "Ask Claude, ChatGPT, and other AI apps about your own notes, then keep going in Harvous. They can read your study, never change it.",
    seoTitle: "Connector — use your Bible study in Claude, ChatGPT, and other AI apps | Harvous Plus",
    seoDescription:
      "Connect Claude, ChatGPT, Grok, and other AI apps to your Harvous notes. They read your study to answer your questions, can start a new note when you ask, and can never edit or delete anything. Included with Harvous Plus.",
    icon: "fa7-solid:puzzle-piece",
    ink: "var(--study-dock-accent-neutral)",
    image: "/images/auth-hero/ai_bg_053.webp",
    comingSoon: false,
    heroTitle: "Ask your AI app about what you've studied.",
    heroLead:
      "Claude, ChatGPT and other AI apps can read your notes and answer from what you wrote.",
    sections: [
      {
        heading: "Start from what you wrote",
        visual: "ask",
        paragraphs: [
          "Ask about a passage and the app answers from your own notes and highlights, including the note that only cites one verse. In ChatGPT's deep research, each note it uses links back to Harvous.",
        ],
      },
      {
        heading: "Pick up where you left off",
        visual: "pickup",
        paragraphs: [
          "Ask \"Where was I?\" for the note you were last in and the chapter to read next. Or go deeper: themes, cross-references, people and places, next to your notes. Names and references only, never verse text.",
        ],
      },
      {
        heading: "Keep going in Harvous",
        visual: "start-note",
        paragraphs: [
          "Say \"start a note in Harvous\" and the app opens one with its short summary in a labeled card, and a blank page for you. It asks first, it's up to 20 a day, and you can turn it off in Settings.",
        ],
      },
      {
        heading: "Your study stays as you left it",
        visual: "boundaries",
        paragraphs: [
          "Starting a new note is the only thing an app can add. It can't edit or delete anything, locked notes show only a title and date, and it reads a few notes at a time, never your whole account.",
        ],
      },
      {
        heading: "You decide what's connected",
        visual: "settings",
        paragraphs: [
          "Settings shows every connected app and when it last read your notes. Disconnect any of them in one tap; apps that need a key, like Grok, get a token you can revoke.",
        ],
      },
    ],
    showcases: [],
    moments: [
      {
        icon: "fa7-solid:puzzle-piece",
        heading: "Claude, ChatGPT, and others",
        body: "Add Harvous in Claude, ChatGPT, Grok, Muse, or any app that connects to outside tools. Settings walks you through each one, step by step.",
      },
      {
        icon: "fa7-solid:book-bible",
        heading: "Passages, not just words",
        body: "Ask about Romans 8 and it finds your note on Romans 8:28–30 too, plus your highlights and annotations from reading it.",
      },
      {
        icon: "fa7-solid:pen-to-square",
        heading: "Start a note from a chat",
        body: "Say \"start a note in Harvous\" and one opens with the app's summary in a labeled card, and a blank page for you.",
      },
      {
        icon: "fa7-solid:lock",
        heading: "Locked stays locked",
        body: "Apps can't edit or delete anything. Locked notes show a title and a date, and Scripture is shared as references only.",
      },
      {
        icon: "fa7-solid:user-group",
        heading: "Your groups come along",
        body: "Notes in your shared spaces are readable the way they are in Harvous. Other members' locked notes stay hidden, and no names or emails are shared.",
      },
      {
        icon: "fa7-solid:list",
        heading: "A few starting points",
        body: "In apps that offer them, like Claude's + menu, Harvous adds ready-made prompts: a passage you've studied, prep for your group, a theme through your notes, where you left off.",
      },
    ],
    relatedIds: ["review-exercises", "shared-spaces"],
    relatedHeading: "Harvous free + what's next",
    relatedLead:
      "Connector is included with Harvous Plus. See the free plan, and what else Plus includes.",
    closingHeading: "Take your study with you.",
    closingLead:
      "Get Harvous Plus to connect Claude, ChatGPT, and other AI apps. Your notes stay as you left them, and every app is yours to disconnect.",
    closingHref: APP_UPGRADE_URL,
    closingLabel: "Get Harvous Plus",
    draft: false,
  },
];

export function getAddonPages(): AddonPage[] {
  return ADDON_PAGES;
}

export function getAddonBySlug(slug: string): AddonPage | undefined {
  return ADDON_PAGES.find((a) => a.slug === slug);
}

export function getAddonDetailHref(slug: string): string | undefined {
  const addon = getAddonBySlug(slug);
  return addon && !addon.draft ? addon.href : undefined;
}
