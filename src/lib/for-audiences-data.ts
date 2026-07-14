import { getUseCaseBySlug, getUseCases, type UseCase } from "./use-cases-data.ts";

export type ForAudienceMoment = {
  icon: string;
  heading: string;
  body: string;
};

export type ForAudienceSection = {
  heading: string;
  paragraphs: string[];
};

export type ForAudience = {
  slug: string;
  href: string;
  title: string;
  tagline: string;
  icon: string;
  image: string;
  ink: string;
  comingSoon?: boolean;
  comingSoonLine?: string;
  seoTitle: string;
  seoDescription: string;
  heroTitle: string;
  heroLead: string;
  sections: ForAudienceSection[];
  moments: ForAudienceMoment[];
  featureIds: string[];
  featuresHeading: string;
  featuresLead: string;
  compareSlugs: string[];
  /** One or more use-case slugs this audience links to. */
  useCaseSlugs: string[];
  testimonialId?: string;
};

const audiences: ForAudience[] = [
  {
    slug: "daily-readers",
    href: "/for/daily-readers/",
    title: "Daily readers",
    tagline: "You open Scripture most days. Harvous is where the thoughts go.",
    icon: "fa6-solid:book-open-reader",
    ink: "var(--study-dock-accent-skyBlue)",
    image: "/images/auth-hero/ai_bg_053.webp",
    seoTitle: "For daily Bible readers — Harvous",
    seoDescription:
      "You study a little most days. Harvous is where those thoughts go — notes linked to scripture, findable when you need them again.",
    heroTitle: "For people who study a little most days.",
    heroLead:
      "Mornings, evenings, lunch breaks — whenever you can find a quiet stretch. You read a passage, something sticks, and then life moves on. By Thursday you're not sure what stood out on Monday.",
    sections: [
      {
        heading: "The habit is there. The record isn't.",
        paragraphs: [
          "Daily reading works when you can look back — see what you noticed last week, follow a thought across a few days, remember what a passage meant before the week got loud.",
          "Harvous is a notes app for that rhythm. Not a reading plan that tells you what to read. Not a devotion that writes the reflection for you. A place for your notes, linked to scripture, organized by what they're actually about.",
        ],
      },
      {
        heading: "How it fits a regular day",
        paragraphs: [
          "Open a thread for whatever you're in — a book, a theme, or just \"this month.\" Add a note while the thought is still warm. Scripture pills keep verses one tap away.",
          "The daily passage is there when you're not sure where to begin. Your journal follows you on web (and apps are on the way).",
        ],
      },
    ],
    moments: [
      {
        icon: "fa6-solid:pen",
        heading: "Capture the thought, right then",
        body: "A note next to the passage before the moment passes. No filing ritual — just the thought and where it belongs.",
      },
      {
        icon: "fa6-solid:book-bible",
        heading: "Scripture stays connected",
        body: 'Type a reference and it becomes a tap-able pill. The verse is there whenever you need it — no app-switching.',
      },
      {
        icon: "fa6-solid:layer-group",
        heading: "A thread for the stretch you're in",
        body: "Whether it's a chapter a day or a theme for the month, a thread collects what you're noticing so it compounds.",
      },
      {
        icon: "fa6-solid:calendar-days",
        heading: "A starting point when you need one",
        body: "The daily passage gives you somewhere to begin, with space to write what stays with you.",
      },
    ],
    featureIds: ["scripture-pills", "daily-passage", "sidebar-modes", "offline-sync"],
    featuresHeading: "What a daily rhythm asks of your notes",
    featuresLead:
      "Open a verse, save what stood out, and find it again later — the pieces people lean on most for everyday study.",
    compareSlugs: ["youversion", "dwell", "readscripture", "spirit-notes", "abide"],
    useCaseSlugs: ["daily-journal"],
    testimonialId: "theo",
  },
  {
    slug: "prayer-journaling",
    href: "/for/prayer-journaling/",
    title: "Prayer journaling",
    tagline: "When your notes look a lot like prayer.",
    icon: "fa6-solid:hands-praying",
    ink: "var(--study-dock-accent-skyBlue)",
    image: "/images/auth-hero/ai_bg_047.webp",
    seoTitle: "For prayer journaling — Harvous",
    seoDescription:
      "When Bible study and prayer share the same page, Harvous keeps those notes private, scripture-linked, and findable.",
    heroTitle: "For people whose notes look like prayer.",
    heroLead:
      "Sometimes you're studying. Sometimes you're talking to God on the page. Often it's both in the same stretch — a verse, a worry, a thank-you, a question you don't have words for yet.",
    sections: [
      {
        heading: "Private space for honest writing",
        paragraphs: [
          "Prayer journaling needs a place that feels like yours. Harvous is built for personal study first — your notes stay in your space, linked to the scripture that sparked them.",
          "You're not trying to produce content. You're trying to remember what you prayed, what you noticed, and what you want to bring back next time.",
        ],
      },
      {
        heading: "Scripture and prayer in one place",
        paragraphs: [
          "Add the verse you're sitting with. Write what comes. Tag themes when it helps — anxiety, gratitude, a person's name — so you can find the thread again without scrolling forever.",
          "It's still a notes tool. It just happens to fit the way prayer and study overlap for a lot of people.",
        ],
      },
    ],
    moments: [
      {
        icon: "fa6-solid:lock",
        heading: "Yours alone",
        body: "Personal spaces are private. Write freely — the page is for remembering, not performing.",
      },
      {
        icon: "fa6-solid:book-bible",
        heading: "Verses next to the prayer",
        body: "Keep the scripture that prompted the prayer one tap away, so the note and the passage stay together.",
      },
      {
        icon: "fa6-solid:tags",
        heading: "Themes you can return to",
        body: "When the same worry or hope shows up across weeks, tags and threads help you see the pattern.",
      },
      {
        icon: "fa6-solid:magnifying-glass",
        heading: "Find what you wrote",
        body: "Search by a phrase half-remembered from last month. Prayer notes shouldn't disappear into a phone gallery.",
      },
    ],
    featureIds: ["scripture-pills", "sidebar-modes", "highlights", "offline-sync"],
    featuresHeading: "What prayer-shaped notes need",
    featuresLead:
      "Private capture, scripture nearby, and a way back to what you wrote — without turning prayer into a productivity system.",
    compareSlugs: ["youversion", "spirit-notes", "abide", "apple-notes"],
    useCaseSlugs: ["daily-journal"],
  },
  {
    slug: "new-to-the-bible",
    href: "/for/new-to-the-bible/",
    title: "New to the Bible",
    tagline: "Curious, new to faith, or finding your footing again.",
    icon: "fa6-solid:seedling",
    ink: "var(--study-dock-accent-mintGreen)",
    image: "/images/auth-hero/ai_bg_044.webp",
    seoTitle: "For people new to the Bible — Harvous",
    seoDescription:
      "Whether you're curious, new to faith, or finding your footing again — Harvous is a simple place to save what you're learning from Scripture.",
    heroTitle: "For people still finding their footing.",
    heroLead:
      "You don't need a seminary vocabulary to start. You need somewhere to put the questions, the verses that land, and the thoughts that show up when you're reading — without feeling like you're doing it wrong.",
    sections: [
      {
        heading: "There's space for you here",
        paragraphs: [
          "Bible study looks different for different people. Some folks have decades of notes. Some are opening Scripture for the first time. Harvous is a memory tool either way — save what stood out, link it to the verse, find it again later.",
          "We're not a Bible reader and we're not a course. Keep whatever app or paper Bible you already use. Harvous is where the notes go.",
        ],
      },
      {
        heading: "Start small. Stay oriented.",
        paragraphs: [
          "A daily passage can give you a place to begin. A thread can hold \"questions I have\" or \"things that surprised me.\" When a theme keeps coming up — hope, forgiveness, who Jesus is — a topical thread keeps those notes together across books.",
          "You don't have to organize perfectly. Write in your own words. Search will meet you there.",
        ],
      },
    ],
    moments: [
      {
        icon: "fa6-solid:pen",
        heading: "Write like yourself",
        body: "No templates required. A short note next to a verse is enough. The point is remembering, not sounding polished.",
      },
      {
        icon: "fa6-solid:calendar-days",
        heading: "A gentle place to start",
        body: "When you're not sure what to read, the daily passage gives you a starting point and room to jot what stays with you.",
      },
      {
        icon: "fa6-solid:book",
        heading: "Look up words without leaving",
        body: "Easton's dictionary is built in — so an unfamiliar word doesn't send you down a rabbit hole of tabs.",
      },
      {
        icon: "fa6-solid:bookmark",
        heading: "Follow a theme when curiosity pulls",
        body: "Noticing \"grace\" everywhere? A thread can hold notes from wherever they show up, at your pace.",
      },
    ],
    featureIds: ["daily-passage", "scripture-pills", "dictionary", "sidebar-modes"],
    featuresHeading: "What helps when you're getting started",
    featuresLead:
      "A starting point, simple capture, and tools that explain without overwhelming — so you can build a record as you go.",
    compareSlugs: ["youversion", "bibleproject", "readscripture", "spirit-notes"],
    useCaseSlugs: ["daily-journal", "topical-study"],
  },
  {
    slug: "sunday-note-takers",
    href: "/for/sunday-note-takers/",
    title: "Sunday note-takers",
    tagline: "You write things down on Sunday. Monday shouldn't erase them.",
    icon: "fa6-solid:church",
    ink: "var(--study-dock-accent-violet)",
    image: "/images/auth-hero/ai_bg_072.webp",
    seoTitle: "For Sunday sermon note-takers — Harvous",
    seoDescription:
      "You take notes at church. Harvous keeps them in series threads, scripture-linked and searchable — not sermon transcription.",
    heroTitle: "For people who write things down on Sunday.",
    heroLead:
      "Phone, bulletin, journal — whatever's in your lap. The notes exist somewhere. But they don't connect to each other, and two months later you couldn't find that one line if you tried.",
    sections: [
      {
        heading: "Your notes. Not a transcript.",
        paragraphs: [
          "Some apps try to capture the whole sermon for you. Harvous does something simpler: it gives your own notes a home — linked to scripture, grouped by series, searchable when half a phrase is all you remember.",
          "If you want to write what stood out and find it again in October, that's what we're for.",
        ],
      },
      {
        heading: "One thread per series",
        paragraphs: [
          'A thread called "Romans — Sunday series" collects every week. Scroll back and see the arc. Week one lives next to week eight — not scattered across photos and apps.',
          "Keep your Bible app for reading. Expand paper notes into Harvous later if that's your rhythm. The point is that Sunday compounds instead of fading.",
        ],
      },
    ],
    moments: [
      {
        icon: "fa6-solid:folder",
        heading: "Series stay together",
        body: "One thread per sermon series. The whole run in one place when you want to look back.",
      },
      {
        icon: "fa6-solid:highlighter",
        heading: "Save the line that landed",
        body: "Highlights keep the phrases you underlined, linked to the note they came from.",
      },
      {
        icon: "fa6-solid:book-bible",
        heading: "Scripture from the sermon",
        body: "Drop the passages that were read or referenced as pills — tapable later when you want the text again.",
      },
      {
        icon: "fa6-solid:magnifying-glass",
        heading: "Search that half-memory",
        body: "Start typing what you remember. Harvous looks across threads so Monday's fog doesn't win.",
      },
    ],
    featureIds: ["scripture-pills", "highlights", "sidebar-modes", "offline-sync"],
    featuresHeading: "What Sunday notes need to survive the week",
    featuresLead:
      "Link scripture, group by series, and search when half a phrase is all you have — so Sunday doesn't disappear by Monday.",
    compareSlugs: ["bible-note", "bible-notes", "pencil-bible", "spirit-notes", "goodnotes"],
    useCaseSlugs: ["sermon-notes"],
    testimonialId: "teaella",
  },
  {
    slug: "teachers",
    href: "/for/teachers/",
    title: "Teachers",
    tagline: "You prepare, then you teach. Keep both sides of that work.",
    icon: "fa6-solid:chalkboard-user",
    ink: "var(--study-dock-accent-violet)",
    image: "/images/auth-hero/ai_bg_045.webp",
    seoTitle: "For Bible teachers — Harvous",
    seoDescription:
      "Prepare lessons and remember what you taught — Harvous keeps prep notes, scripture, and follow-ups in one place. Shared group spaces coming soon.",
    heroTitle: "For people who prepare, then teach.",
    heroLead:
      "Sunday school, small group, a class at church — you dig into a passage, sketch questions, teach it out loud, then somehow start from scratch next week. The prep and the teaching deserve a home that lasts.",
    sections: [
      {
        heading: "Prep that compounds",
        paragraphs: [
          "Harvous is where your personal prep lives — passages as scripture pills, notes per lesson, threads for a series you're walking people through. You're not looking for a research suite. You're looking for a place that remembers what you already studied.",
          "Write the questions you might ask. Save the cross-references. Highlight the line you want to land. When you come back next week, it's still there.",
        ],
      },
      {
        heading: "Personal now. Shared when you're ready.",
        paragraphs: [
          "Today, Harvous shines for your private prep and the notes you take while you teach. Shared spaces for the whole group are on the way — so what the room discovers together can live beyond the hour.",
          "Until then, keep using Harvous the way you study alone. The same tools will carry into group spaces when they launch.",
        ],
      },
    ],
    moments: [
      {
        icon: "fa6-solid:list",
        heading: "A thread per lesson or series",
        body: "Keep prep, questions, and follow-ups together so week four builds on week one.",
      },
      {
        icon: "fa6-solid:book-bible",
        heading: "Passages at hand",
        body: "Scripture pills keep every reference one tap away while you prepare and while you teach.",
      },
      {
        icon: "fa6-solid:lock",
        heading: "Prep stays private",
        body: "Your working notes are yours. Share what you choose when group spaces arrive — not everything by default.",
      },
      {
        icon: "fa6-solid:user-group",
        heading: "Shared spaces on the way",
        body: "Soon your group can add to the same threads. You're building on personal study habits that already work.",
      },
    ],
    featureIds: ["scripture-pills", "sidebar-modes", "highlights", "sharing"],
    featuresHeading: "What teaching asks of your notes",
    featuresLead:
      "Series threads, scripture nearby, and private prep — plus sharing when your group is ready for it.",
    compareSlugs: ["logos", "notion", "bible-note", "goodnotes"],
    useCaseSlugs: ["sermon-notes", "small-group"],
    comingSoon: true,
    comingSoonLine: "Shared spaces coming soon",
  },
  {
    slug: "going-through-a-book",
    href: "/for/going-through-a-book/",
    title: "Going through a book",
    tagline: "One book. Weeks or months. Notes that compound.",
    icon: "fa6-solid:book-open",
    ink: "var(--study-dock-accent-warmAmber)",
    image: "/images/auth-hero/ai_bg_050.webp",
    seoTitle: "For book-by-book Bible study — Harvous",
    seoDescription:
      "Working through one book of the Bible? Harvous gives that study a home — chapter threads, scripture links, and notes that build on each other.",
    heroTitle: "For people working one book at a time.",
    heroLead:
      "Romans. Genesis. John. You're in it for real — chapter by chapter — and you need somewhere to keep what you find so month three still remembers month one.",
    sections: [
      {
        heading: "A study deserves its own space",
        paragraphs: [
          "Book study isn't one note. It's dozens — questions, cross-references, \"wait, that connects to…\" moments. Harvous gives that study a dedicated home so Romans doesn't bleed into your Sunday notes unless you want it to.",
        ],
      },
      {
        heading: "Depth without the heavy suite",
        paragraphs: [
          "Serious academic tools exist. Harvous sits in the middle: scripture across translations, a built-in dictionary, threads per chapter, notes that can live in more than one place when a theme spans books.",
          "You write. Harvous keeps the references, the organization, and the search.",
        ],
      },
    ],
    moments: [
      {
        icon: "fa6-solid:book-open",
        heading: "One space for this book",
        body: "Notes, chapter threads, highlights, and references — all for this study, in one place.",
      },
      {
        icon: "fa6-solid:book-bible",
        heading: "Cross-references that stay open",
        body: "Link out to another passage and read it right there, in the translation you prefer.",
      },
      {
        icon: "fa6-solid:diagram-project",
        heading: "Notes in more than one thread",
        body: "A thought on justification can sit in your Romans thread and a theology thread at the same time.",
      },
      {
        icon: "fa6-solid:book",
        heading: "Dictionary in reach",
        body: "Look up a word without leaving the note. The definition comes to you.",
      },
    ],
    featureIds: ["scripture-pills", "dictionary", "sidebar-modes", "highlights"],
    featuresHeading: "What book study asks of your notes",
    featuresLead:
      "Chapter by chapter, reference by reference — the pieces that help one book compound instead of scatter.",
    compareSlugs: ["logos", "bibleproject", "faithstudy", "life-bible"],
    useCaseSlugs: ["book-study"],
    testimonialId: "theo",
  },
  {
    slug: "following-a-theme",
    href: "/for/following-a-theme/",
    title: "Following a theme",
    tagline: "Grace, prayer, hope — wherever Scripture takes the thread.",
    icon: "fa6-solid:tags",
    ink: "var(--study-dock-accent-mintGreen)",
    image: "/images/auth-hero/ai_bg_058.webp",
    seoTitle: "For topical Bible study — Harvous",
    seoDescription:
      "Chasing a theme across Scripture? Harvous keeps notes on grace, prayer, or any topic together — no matter which book they came from.",
    heroTitle: "For people chasing a theme across Scripture.",
    heroLead:
      "You start noticing something. Grace in Genesis, in Paul, in the Psalms. Or you're tracing prayer, or what Scripture says about hope. You need a place that can hold a thread that runs across the whole Bible.",
    sections: [
      {
        heading: "Themes don't stay in one book",
        paragraphs: [
          "Topical study means notes from everywhere — different books, seasons, and moments. Harvous organizes by what the notes are about, not where you happened to be reading that day.",
        ],
      },
      {
        heading: "Let connections show up",
        paragraphs: [
          'A thread called "Grace" can collect Ephesians, Psalms, and Genesis in one place. Tags and search use your words — because you will not tag perfectly, and you should not have to.',
        ],
      },
    ],
    moments: [
      {
        icon: "fa6-solid:bookmark",
        heading: "One thread for the chase",
        body: "Add notes from wherever you are in Scripture. They all live under the theme.",
      },
      {
        icon: "fa6-solid:tags",
        heading: "Connections you didn't plan",
        body: "Shared language across notes helps patterns surface — even when you weren't looking for them.",
      },
      {
        icon: "fa6-solid:layer-group",
        heading: "Many books, one record",
        body: "Different weeks and different passages, pulled together by what they're actually about.",
      },
      {
        icon: "fa6-solid:magnifying-glass",
        heading: "Search in your own words",
        body: "Half-remember a phrase from months ago. Search finds it without a perfect filing system.",
      },
    ],
    featureIds: ["scripture-pills", "sidebar-modes", "highlights", "dictionary"],
    featuresHeading: "What a theme needs to stay together",
    featuresLead:
      "Notes from everywhere, organized by what they're about — so a thread can run across the whole Bible.",
    compareSlugs: ["logos", "life-bible", "readscripture", "obsidian"],
    useCaseSlugs: ["topical-study"],
    testimonialId: "teaella",
  },
  {
    slug: "group-leaders",
    href: "/for/group-leaders/",
    title: "Group leaders",
    tagline: "You lead the discussion. Keep what the group builds.",
    icon: "fa6-solid:user-group",
    ink: "var(--study-dock-accent-coralRose)",
    image: "/images/auth-hero/ai_bg_073.webp",
    comingSoon: true,
    comingSoonLine: "Coming soon",
    seoTitle: "For small group leaders — Harvous",
    seoDescription:
      "Lead your group and keep what you discover together. Harvous shared spaces are coming — personal prep works today.",
    heroTitle: "For people who lead the discussion.",
    heroLead:
      "You prep questions, you facilitate, you watch people realize things out loud. And then next week it feels like starting over. What the group found together lives in someone's memory — maybe — but not somewhere you can all return to.",
    sections: [
      {
        heading: "Shared spaces are coming soon",
        paragraphs: [
          "We're building shared spaces so a whole group can study in the same threads — questions, notes, and scripture that live beyond the hour you meet. It's not fully launched yet, but the foundation is the same Harvous you can use for personal prep today.",
          "If you lead a group and want early access, sign up and reach out. We'd love to hear how you study together.",
        ],
      },
      {
        heading: "Lead with your own notes first",
        paragraphs: [
          "While shared spaces finish, use Harvous for private prep — passages, questions, the things you almost said. When the group layer ships, that habit carries over. Your prep stays private; the group sees what you choose to share.",
        ],
      },
    ],
    moments: [
      {
        icon: "fa6-solid:user-group",
        heading: "A shared space for the group",
        body: "Everyone adds to the same threads. What you discover together has a home after you leave the room.",
      },
      {
        icon: "fa6-solid:list",
        heading: "Threads per week or topic",
        body: "Week four of James gets its own thread. Look back without relying on memory alone.",
      },
      {
        icon: "fa6-solid:lock",
        heading: "You stay in control",
        body: "You set up the space and invite who belongs. Others are guests in a space you lead.",
      },
      {
        icon: "fa6-solid:user",
        heading: "Prep stays personal",
        body: "The notes you need to lead stay in your space. Share into the group thread when you're ready.",
      },
    ],
    featureIds: ["sharing", "sidebar-modes", "scripture-pills", "highlights"],
    featuresHeading: "What group leadership will need from Harvous",
    featuresLead:
      "Shared spaces are on the way — until then, these are the personal-study pieces leaders use for prep and follow-up.",
    compareSlugs: ["pray-com", "youversion", "notion"],
    useCaseSlugs: ["small-group"],
    testimonialId: "joschua",
  },
];

export function getAudiences(): ForAudience[] {
  return audiences;
}

export function getAudienceBySlug(slug: string): ForAudience | undefined {
  return audiences.find((a) => a.slug === slug);
}

export function getAudiencesForUseCase(useCaseSlug: string): ForAudience[] {
  return audiences.filter((a) => a.useCaseSlugs.includes(useCaseSlug));
}

export function getUseCasesForAudience(audience: ForAudience): UseCase[] {
  return audience.useCaseSlugs
    .map((slug) => getUseCaseBySlug(slug))
    .filter((uc): uc is UseCase => uc !== undefined);
}

/** Hub grouping: each use case with its linked audiences (skips use cases with none). */
export function getAudiencesGroupedByUseCase(): { useCase: UseCase; audiences: ForAudience[] }[] {
  return getUseCases()
    .map((useCase) => ({
      useCase,
      audiences: getAudiencesForUseCase(useCase.slug),
    }))
    .filter((group) => group.audiences.length > 0);
}
