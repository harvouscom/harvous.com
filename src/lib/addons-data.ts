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
      "Short questions from what you wrote, kept or read, with answers Harvous can check. No score, no streak.",
    // Each section draws a working example beside it (ReviewScenes.astro).
    sections: [
      {
        heading: "Asked a different way each time",
        paragraphs: [
          "A question comes from a verse you keep, a chapter you read, a note you wrote — or, if your church follows along, a question your church wrote. Never one invented about the text, and none written by AI.",
          "There are seventeen ways of asking, from filling in the blanks to finding the word that's been changed. Pick one and try it.",
        ],
        visual: "kinds",
      },
      {
        heading: "Checked, with its working shown",
        paragraphs: [
          "Every question has a right answer and Harvous checks it. Turned over, the card shows what was asked, what you gave, and the verse as it actually reads — so a question you missed is one you can sit with.",
          "It checks facts, never what a passage means to you or how you chose to say it.",
        ],
        visual: "result",
      },
      {
        heading: "The gap grows as you hold it",
        paragraphs: [
          "How you answer decides when it comes back. Not this time, and it's back tomorrow. Had it a few times running, and the gap keeps widening — the things you know stop asking for your attention, and the ones still forming keep showing up.",
          "It's arithmetic, not a model guessing at what you might have forgotten. Each one says where it stands in plain words: you're learning this, you have this, or give this another look.",
        ],
        visual: "gaps",
      },
      {
        heading: "A sitting a day, in Activity",
        paragraphs: [
          "Today's questions wait in Activity, beside your study — not a separate page you have to leave your notes to visit. Begin, and they're dealt one card at a time.",
          "No score, no streak. Enough for now puts the card away; what you didn't get to waits for tomorrow.",
        ],
        visual: "deck",
      },
    ],
    showcases: [],
    moments: [],
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
  {
    kind: "addon",
    slug: "family",
    href: "/add-ons/family/",
    title: "Family",
    tagline: "One Harvous Plus for your household, a Family Space to study in together, and a parent view that shows progress, never notes.",
    seoTitle: "Family — share Harvous Plus with your household | Harvous Plus",
    seoDescription:
      "Family sharing is included with Harvous Plus: cover up to five more people, study together in a shared Family Space, and see a child's progress without ever seeing their notes.",
    icon: "fa7-solid:people-roof",
    ink: "var(--study-dock-accent-mintGreen)",
    image: "/images/auth-hero/ai_bg_046.webp",
    comingSoon: false,
    heroTitle: "Study together as a family.",
    heroLead:
      "One Plus covers your household, with a Family Space everyone can write in.",
    sections: [
      {
        heading: "One Plus covers the house",
        paragraphs: [
          "Start a family from Settings › My Family and invite up to five more people. Everyone you add gets Harvous Plus at no extra cost: unlimited history, Review exercises and Connector. Shared spaces for groups stay with the person who pays.",
          "Family sharing is included with [Harvous Plus](/pricing/) ($6/mo or $36/yr). Invites are single-use links that expire after seven days.",
        ],
      },
      {
        heading: "A Family Space for what you read together",
        paragraphs: [
          "Every family gets a Family Space that everyone in it can write in: the passage from dinner, a question someone asked in the car, the thread you are reading through as a house.",
          "Everything else stays where it was. Each person's own notes are theirs, and nothing moves into the Family Space unless they put it there.",
        ],
      },
      {
        heading: "Progress for parents, privacy for everyone",
        paragraphs: [
          "A parent or guardian can see when a child was last in Harvous, how many chapters they have been in and which books, and how many notes they have written. Never the notes themselves, their highlights, their searches or their Review.",
          "The child sees exactly the same numbers about themselves, so nothing is watched in secret. Children are 13 and older, can ask to become an adult in the family, and can leave any time.",
        ],
      },
    ],
    showcases: [
      {
        eyebrow: "My Family",
        title: "Everyone, and what they can do",
        color: "mint",
        body: [
          "The Organizer started the family. A Parent/Guardian can invite people and see a child's progress. An Adult shares the space and the plan, and their study stays private. A Child is 13 or older.",
        ],
        visual: "family-members",
        label: "Settings › My Family listing four people with their roles: Organizer, Parent/Guardian, Adult and Child",
      },
      {
        eyebrow: "Progress",
        title: "Counts, not contents",
        color: "sky",
        reverse: true,
        body: [
          "Last active, chapters and books, and how many notes. That's the whole view, for the parent and for the child.",
        ],
        visual: "family-progress",
        label: "A child's progress card showing last active, chapters this month with the books, and a note count",
      },
      {
        eyebrow: "Our Bible",
        title: "Where the family has been in Scripture",
        color: "amber",
        reverse: true,
        body: [
          "Our Bible shows which books the family has been in, together. Never chapters, and never who.",
          "It's off until each person turns it on, so no one is counted without saying so.",
        ],
        visual: "family-our-bible",
        label: "Our Bible, showing the family has been in nine books, grouped by section, with no chapters or names",
      },
    ],
    moments: [
      {
        icon: "fa7-solid:people-roof",
        heading: "Up to six people",
        body: "You and five more, all on one Harvous Plus. No extra charge for the family.",
      },
      {
        icon: "fa7-solid:book-bible",
        heading: "A shared Family Space",
        body: "Threads and notes everyone in the family can add to, next to each person's own study.",
      },
      {
        icon: "fa7-solid:chart-simple",
        heading: "A parent view that stays out of the notes",
        body: "Last active, chapters, books and a note count. Never notes, highlights, searches or Review.",
      },
      {
        icon: "fa7-solid:lock",
        heading: "Private study stays private",
        body: "Adults' study is their own. Children see the same numbers their parents see, and can leave any time.",
      },
    ],
    relatedIds: ["shared-spaces", "review-exercises", "connector"],
    relatedHeading: "Harvous free + what's next",
    relatedLead:
      "Family sharing is included with Harvous Plus. See the free plan, and what else Plus includes.",
    closingHeading: "Bring the household along.",
    closingLead:
      "Get Harvous Plus, then start a family from Settings › My Family. Family is on the web for now.",
    closingHref: APP_UPGRADE_URL,
    closingLabel: "Get Harvous Plus",
    draft: false,
  },
];

/**
 * Child notebooks: parent-managed notebooks for children under 13, a part of
 * Family at /add-ons/family/child-notebooks/. Kept out of ADDON_PAGES so it
 * never lands in add-on lists, rails, FAQ link checks or [slug].astro's
 * paths; src/pages/add-ons/family/child-notebooks.astro renders it.
 *
 * A draft page (lib/draft-pages.ts) until child enrollment opens. Every claim
 * here has to match the app (docs/CHILD_ACCOUNTS.md) and the children's
 * privacy policy at /privacy/children/.
 */
export const CHILD_NOTEBOOKS_PAGE: AddonPage = {
  kind: "addon",
  slug: "child-notebooks",
  href: "/add-ons/family/child-notebooks/",
  back: { href: "/add-ons/family/", label: "Family" },
  title: "Child notebooks",
  tagline: "A private notebook for a child under 13, set up and managed by you.",
  seoTitle: "Child notebooks — a Bible notebook for kids under 13 | Harvous Plus",
  seoDescription:
    "Give a child under 13 their own private place to write about what they read and wonder. You set it up, choose what they read, and stay in charge. Included with Harvous Plus, on the web in the US.",
  icon: "fa7-solid:book-open-reader",
  ink: "var(--study-dock-accent-mintGreen)",
  image: "/images/auth-hero/ai_bg_046.webp",
  comingSoon: false,
  heroTitle: "A notebook for your child.",
  heroLead:
    "Their own private place to write about what they read and wonder. You set it up, and you stay in charge.",
  sections: [
    {
      heading: "Set up by you, in three steps",
      paragraphs: [
        "From Settings › My Family, confirm you're an adult (Kids Web Services checks this for us), read how we protect your child, then give permission and name the notebook. A first name or nickname is all we ask for. No email, phone number or password for your child.",
        "Child notebooks are included with [Harvous Plus](/pricing/). To open the notebook, you make a one-time link or hand over your device in child mode.",
      ],
    },
    {
      heading: "Reading, chosen together",
      paragraphs: [
        "Share a chapter in Family Bible, and you both read it and talk about any verse. Kids get translations written for young readers (ERV, CEV and NLV), plus any others you add.",
        "If your church's kids ministry shares its reading on Harvous, you can let your child read it. Channels are read-only, and ministry leaders can't see your child's notes or profile.",
      ],
    },
    {
      heading: "Private, with you in charge",
      paragraphs: [
        "You can read your child's notes and download a copy any time. End their sessions, withdraw your permission, or delete the notebook whenever you want.",
        "There's no public sharing, no messages, no ads, no purchases and no AI. How we handle your child's information is in our [children's privacy policy](/privacy/children/).",
      ],
    },
  ],
  showcases: [
    {
      eyebrow: "My notebook",
      title: "A place that's theirs",
      color: "mint",
      body: [
        "Notes with folders, tags and Threads, and Scripture they can tap to read. They pick the cover, too.",
      ],
      visual: "child-notebook-home",
      label: "Ellie's notebook with three notes: What I want to remember, A little kindness, and A question for Sunday",
    },
    {
      eyebrow: "Family Bible",
      title: "Read a chapter, talk about a verse",
      color: "sky",
      body: [
        "You share the chapter. Your child highlights a verse and says what they think, and you answer right there. Only the two of you see it.",
      ],
      visual: "child-family-bible",
      label: "Psalm 23 shared in Family Bible, with a thought from Ellie on verse 1 and a reply from Mom",
    },
    {
      eyebrow: "Look back",
      title: "What they marked comes back",
      color: "amber",
      body: [
        "A few notes and verses a day, asked with taps: pick the missing word, put verses in order, find what changed. No typing, no score.",
      ],
      visual: "child-look-back",
      label: "A Look back question: fill in the missing word in Psalm 23:3 from three word tiles",
    },
    {
      eyebrow: "For parents",
      title: "Everything in one place",
      color: "violet",
      body: [
        "Choose translations and shared chapters, approve ministry reading, read and download notes, and manage privacy, all from the notebook's page in My Family.",
      ],
      visual: "child-parent-manage",
      label: "Manage Ellie's notebook: Family Bible, Ministry, Notes, and Privacy and sessions, with End all sessions",
    },
  ],
  moments: [
    {
      icon: "fa7-solid:star",
      heading: "Highlights and verse stickers",
      body: "In My Bible, your child can highlight verses and put stickers on them. Those stay theirs, and come to you only in a full backup download.",
    },
    {
      icon: "fa7-solid:palette",
      heading: "A cover they choose",
      body: "Color, pattern, pages and a sticker on the front. They can change it any time.",
    },
    {
      icon: "fa7-solid:tablet-screen-button",
      heading: "Shared devices work too",
      body: "Hand over your device in child mode. When they're done, “I'm all done” gives it back to you or closes the notebook.",
    },
    {
      icon: "fa7-solid:globe",
      heading: "On the web, in the US",
      body: "Child notebooks run in the browser, for families in the United States, for now.",
    },
  ],
  relatedIds: [],
  relatedHeading: "",
  relatedLead: "",
  closingHeading: "Give them a place to wonder.",
  closingLead:
    "Get Harvous Plus, then start from Settings › My Family. Child notebooks are on the web, for families in the US.",
  closingHref: APP_UPGRADE_URL,
  closingLabel: "Get Harvous Plus",
  draft: false,
};

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
