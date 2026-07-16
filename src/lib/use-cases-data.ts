export type UseCaseMoment = {
  icon: string;
  heading: string;
  body: string;
};

export type UseCaseSection = {
  heading: string;
  paragraphs: string[];
};

export type UseCase = {
  slug: string;
  href: string;
  title: string;
  /** Homepage carousel label when different from page title (e.g. Group spaces). */
  carouselTitle?: string;
  tagline: string;
  icon: string;
  image: string;
  ink: string;
  comingSoon?: boolean;
  /** Detail page: one-line label beside the back link (e.g. Coming soon). */
  comingSoonLine?: string;
  seoTitle: string;
  seoDescription: string;
  heroTitle: string;
  heroLead: string;
  sections: UseCaseSection[];
  moments: UseCaseMoment[];
  /** Feature MDX ids, or coming-soon-grid ids (e.g. shared-spaces). */
  featureIds: string[];
  /** Detail page: related-tools section (no "features" label). */
  featuresHeading: string;
  featuresLead: string;
  compareSlugs: string[];
  /** Other use-case slugs to surface as related links on the detail page. */
  relatedUseCaseSlugs?: string[];
  /** Slug in src/content/testimonials/ (e.g. "joschua"). */
  testimonialId?: string;
};

const useCases: UseCase[] = [
  {
    slug: "daily-journal",
    href: "/use-cases/daily-journal/",
    title: "Daily journal",
    tagline: "You study every day. Harvous is where the thoughts go.",
    icon: "fa6-solid:book-open-reader",
    ink: "var(--study-dock-accent-skyBlue)",
    image: "/images/auth-hero/ai_bg_053.webp",
    seoTitle: "Daily Bible journal app — Harvous",
    seoDescription:
      "You study most mornings. Harvous is where the thoughts go — notes linked to scripture, organized by what they're about, findable when you need them.",
    heroTitle: "For the person who studies every day and wants to hold onto what they find.",
    heroLead:
      "You study most mornings. Or evenings, or whenever you can find time. You add a verse you're sitting with, write what comes to mind, connect it to something else you've been thinking about. But by Thursday, most of it is gone. Not lost exactly. Just... nowhere.",
    sections: [
      {
        heading: "The habit is there. The record isn't.",
        paragraphs: [
          "Daily study works when you can look back — see what you noticed last week, follow a thread of thought across days, remember what a passage meant to you before life moved on.",
          "Harvous is a notes app built for that rhythm. Not a reading plan that tells you what to read. Not a devotional that writes the reflection for you. A place for your notes, linked to scripture, organized by what they're actually about.",
        ],
      },
      {
        heading: "How people use it day to day",
        paragraphs: [
          "Open a thread for whatever you're in — a book, a theme, or just \"this month.\" Add a note next to the passage while the thought is still warm. Scripture pills keep verses one tap away across 11 translations.",
          "The daily passage gives you a starting point when you're not sure where to begin. Everything syncs across web, iOS, iPad, and Mac so your journal follows you.",
        ],
      },
    ],
    moments: [
      {
        icon: "fa6-solid:pen",
        heading: "Capture the thought, right then",
        body: "A note next to the passage before the moment passes. Takes five seconds. No formatting, no filing — just the thought and where it belongs.",
      },
      {
        icon: "fa6-solid:book-bible",
        heading: "Scripture pills keep it connected",
        body: 'Type "Romans 8:1" and it becomes a tap-able link across all 11 translations. The verse text is there whenever you need it — no app-switching, no losing your place.',
      },
      {
        icon: "fa6-solid:layer-group",
        heading: "A thread for whatever you're studying",
        body: "Whether you're working through a chapter a day or a whole book in a week, a thread collects all your thoughts on the same topic. The thread becomes your record.",
      },
      {
        icon: "fa6-solid:clock-rotate-left",
        heading: "Recall brings a note back",
        body: "When the habit thins out, Recall resurfaces a fading note, highlight, or passage — so last week's thought isn't gone just because Tuesday got loud.",
      },
    ],
    featureIds: ["scripture-pills", "daily-passage", "sidebar-modes", "recall"],
    featuresHeading: "What daily study asks of your notes",
    featuresLead:
      "Open a verse, capture the thought while it's warm, and find it again days later — the Harvous pieces people lean on most for a daily rhythm.",
    compareSlugs: ["youversion", "dwell", "readscripture", "spirit-notes", "church-notes", "abide"],
    testimonialId: "theo",
  },
  {
    slug: "sermon-notes",
    href: "/use-cases/sermon-notes/",
    title: "Sermon notes",
    tagline: "Sunday thoughts have a habit of fading by Monday.",
    icon: "fa6-solid:church",
    ink: "var(--study-dock-accent-violet)",
    image: "/images/auth-hero/ai_bg_072.webp",
    seoTitle: "Sermon notes app — Harvous",
    seoDescription:
      "Sunday thoughts fade by Monday. Harvous keeps sermon notes organized in series threads, searchable and scripture-linked — a notes app, not sermon transcription.",
    heroTitle: "Sunday thoughts have a habit of disappearing by Monday.",
    heroLead:
      "You take notes at church. Maybe in your phone, maybe on the bulletin, maybe in a journal you bring. The notes exist — somewhere. But they don't connect to each other, and two months later you couldn't find them if you tried.",
    sections: [
      {
        heading: "You don't need another sermon app",
        paragraphs: [
          "Some apps transcribe the sermon for you. Some turn Sunday into flashcards. Harvous does something simpler: it gives your own notes a home — linked to scripture, grouped by series, searchable when half a phrase is all you remember.",
          "We're not a Bible reader and we're not sermon transcription. If you want to write what stood out to you and find it again in October, that's what we're for.",
        ],
      },
      {
        heading: "One thread per series",
        paragraphs: [
          'A thread called "Romans — Sunday series" collects every week of notes. Scroll back and see the whole arc. Week one connects to week eight because they live in the same place — not scattered across apps, photos, and bulletins.',
          "Highlights save the phrases you underlined. Tags connect themes across weeks without manual filing. Search works across every thread you've ever written.",
        ],
      },
      {
        heading: "Works alongside how you already study",
        paragraphs: [
          "Keep your Bible app for reading. Keep your notebook if you love paper — many people capture on paper and expand in Harvous later. Harvous is where sermon notes compound over months and years, not where Sunday disappears by Monday.",
        ],
      },
    ],
    moments: [
      {
        icon: "fa6-solid:folder",
        heading: "One thread per sermon series",
        body: 'A thread called "Romans — Sunday series" collects every week of notes. Scroll back and see the whole arc. Week one connects to week eight because they\'re in the same place.',
      },
      {
        icon: "fa6-solid:tags",
        heading: "Auto-tagging connects the dots",
        body: 'Write about "faith" in week three and Harvous files it with other notes where that word matters. Cross-series connections surface on their own — no manual organizing needed.',
      },
      {
        icon: "fa6-solid:highlighter",
        heading: "Highlights save the phrases",
        body: "That line the pastor said that you underlined — it's a highlight now, with a color and an annotation you can add later. Your highlighted phrases stay linked to the note they came from.",
      },
      {
        icon: "fa6-solid:clock-rotate-left",
        heading: "Recall finds October for you",
        body: "When half a phrase is all you have, Recall can resurface a fading sermon note — so Sunday's thought isn't buried under two months of life.",
      },
    ],
    featureIds: ["scripture-pills", "highlights", "sidebar-modes", "recall"],
    featuresHeading: "What sermon notes need to survive the week",
    featuresLead:
      "Link scripture, group by series, and search when half a phrase is all you remember — the pieces that keep Sunday from fading by Monday.",
    compareSlugs: ["bible-note", "bible-notes", "church-notes", "pencil-bible", "spirit-notes"],
    testimonialId: "teaella",
  },
  {
    slug: "book-study",
    href: "/use-cases/book-study/",
    title: "Book study",
    tagline: "Going deep. One book, start to finish.",
    icon: "fa6-solid:magnifying-glass",
    ink: "var(--study-dock-accent-warmAmber)",
    image: "/images/auth-hero/ai_bg_050.webp",
    seoTitle: "Book-by-book Bible study — Harvous",
    seoDescription:
      "Going deep on one book of the Bible? Harvous gives your study a home — notes, threads, scripture links, and a dictionary, all in one place.",
    heroTitle: "Going deep. One book, start to finish.",
    heroLead:
      "You're doing a real study of a book of the Bible — Romans, Genesis, John. Weeks or months of it. You're building understanding chapter by chapter, and you need somewhere to keep what you find so it compounds instead of disappears.",
    sections: [
      {
        heading: "A study deserves its own space",
        paragraphs: [
          "Book study isn't a single note. It's dozens — chapter by chapter, cross-reference by cross-reference, question after question. Harvous gives that study a dedicated space so nothing from Romans bleeds into your journal or your sermon notes unless you want it to.",
        ],
      },
      {
        heading: "Depth without the research-suite weight",
        paragraphs: [
          "Serious tools exist for academic Bible study. Harvous sits in the middle: scripture pills across 11 translations, Easton's dictionary built in, threads per chapter, notes that can live in more than one collection when a theme spans books.",
          "You write. Harvous keeps the references, the organization, and the search — so months into Romans you can still find what you noticed in chapter 4.",
        ],
      },
    ],
    moments: [
      {
        icon: "fa6-solid:book-open",
        heading: "A space just for this study",
        body: "Everything about your Romans study — or Genesis, or John — in one place. Notes, threads per chapter, highlights, scripture references. Nothing shares space with your other study.",
      },
      {
        icon: "fa6-solid:book-bible",
        heading: "Scripture pills that go deep",
        body: "Every reference links out in one tap. Cross-reference a verse in Romans to something in Galatians and read it right there, in whichever of the 11 translations you prefer.",
      },
      {
        icon: "fa6-solid:diagram-project",
        heading: "Notes that live in multiple threads",
        body: "A note on justification can belong in your Romans thread and your theology thread at the same time. Because understanding doesn't stay in one category.",
      },
      {
        icon: "fa6-solid:book",
        heading: "Built-in dictionary",
        body: "Easton's Bible Dictionary is right there. You won't have to leave the note to look up a word — the definition comes to you.",
      },
    ],
    featureIds: ["scripture-pills", "dictionary", "threads", "highlights"],
    featuresHeading: "What book study asks of your notes",
    featuresLead:
      "Chapter by chapter, cross-reference by cross-reference — the Harvous pieces that help one book compound instead of scatter.",
    compareSlugs: ["logos", "bibleproject", "faithstudy", "life-bible"],
    testimonialId: "theo",
  },
  {
    slug: "topical-study",
    href: "/use-cases/topical-study/",
    title: "Topical study",
    tagline: "Following a theme wherever it goes in Scripture.",
    icon: "fa6-solid:tags",
    ink: "var(--study-dock-accent-mintGreen)",
    image: "/images/auth-hero/ai_bg_058.webp",
    seoTitle: "Topical Bible study notes — Harvous",
    seoDescription:
      "Following a theme wherever it goes in Scripture? Harvous keeps notes on grace, prayer, or any topic together — no matter where in the Bible they came from.",
    heroTitle: "Following a theme wherever it goes in Scripture.",
    heroLead:
      "You start noticing something. Grace shows up in Genesis, in Paul's letters, in the Psalms. Or you're tracing names of God, or following what Scripture says about prayer. You need somewhere that can hold a thread that runs across the whole Bible.",
    sections: [
      {
        heading: "Themes don't stay in one book",
        paragraphs: [
          "Topical study means notes from everywhere — different books, different seasons, different moments of insight. Harvous organizes by what the notes are about, not where you happened to be reading that day.",
        ],
      },
      {
        heading: "Let connections surface",
        paragraphs: [
          "Auto-tagging links notes that share language and themes. A thread called \"Grace\" collects Ephesians, Psalms, and Genesis in one place. Search uses your words, not a rigid taxonomy — because you don't always tag perfectly and you shouldn't have to.",
        ],
      },
    ],
    moments: [
      {
        icon: "fa6-solid:bookmark",
        heading: "A thread for the theme",
        body: 'One thread called "Grace" (or "Names of God" or "Prayer"). Add notes from wherever you are in Scripture — Genesis, the Psalms, Paul\'s letters — and they all live there.',
      },
      {
        icon: "fa6-solid:tags",
        heading: "Auto-tagging surfaces connections you didn't plan",
        body: "Add a note on Ephesians 2 and Harvous tags themes that connect it to what you wrote in Psalms. Patterns you weren't looking for start to show up.",
      },
      {
        icon: "fa6-solid:layer-group",
        heading: "Many notes, one thread",
        body: "Notes from different books, different weeks, different moments — all pulled into one thread by what they're actually about. The thread becomes the record of your chase.",
      },
      {
        icon: "fa6-solid:magnifying-glass",
        heading: "Search by what you were thinking",
        body: 'You wrote about "unmerited favor" at some point. Even if you didn\'t tag it that way, searching for it finds it. Your words, your language — Harvous doesn\'t require you to organize perfectly.',
      },
    ],
    featureIds: ["scripture-pills", "threads", "highlights", "dictionary"],
    featuresHeading: "What topical study needs to hold a thread",
    featuresLead:
      "Notes from everywhere, organized by what they're about — the pieces that let a theme run across the whole Bible.",
    compareSlugs: ["logos", "life-bible", "readscripture", "obsidian"],
    testimonialId: "teaella",
  },
  {
    slug: "deep-study",
    href: "/use-cases/deep-study/",
    title: "Deep study",
    tagline: "When one passage deserves more than a skim.",
    icon: "fa6-solid:glasses",
    ink: "var(--study-dock-accent-neutral)",
    image: "/images/auth-hero/ai_bg_051.webp",
    seoTitle: "Deep Bible study notes — Harvous",
    seoDescription:
      "When one passage deserves more than a skim — Harvous keeps scripture open beside your notes, with a dictionary and threads so a long sit compounds instead of disappearing.",
    heroTitle: "When one passage deserves more than a skim.",
    heroLead:
      "You're not racing a reading plan. You're sitting with a short stretch of Scripture — maybe for an hour, maybe for a morning — writing questions, checking cross-references, looking up a word, and wanting all of that to stay in one place.",
    sections: [
      {
        heading: "A sit is different from a skim",
        paragraphs: [
          "Deep study isn't a chapter-a-day habit and it isn't weeks through a whole book. It's one passage (or a short stretch) that you stay with — notes beside the text, other verses open when a connection pulls, a word looked up without losing your place.",
          "Harvous is built for that kind of sit. Not a research suite. A notes app that keeps scripture, dictionary, and your writing on the same page.",
        ],
      },
      {
        heading: "Leave with a record, not a fog",
        paragraphs: [
          "When the sit ends, you shouldn't have to reconstruct what you found from memory. Threads hold the notes from that stretch. Highlights mark the lines that mattered. Weeks later, Recall can bring a fading note back — so the morning wasn't only for the morning.",
        ],
      },
    ],
    moments: [
      {
        icon: "fa6-solid:book-bible",
        heading: "Scripture stays open beside you",
        body: "Type a reference and it becomes a pill — read it in the translation you want without leaving the note. Stack more passages when a cross-reference pulls you sideways.",
      },
      {
        icon: "fa6-solid:book",
        heading: "Look up a word without leaving",
        body: "Easton's dictionary is right there. An unfamiliar word shouldn't send you into a pile of tabs that kills the sit.",
      },
      {
        icon: "fa6-solid:highlighter",
        heading: "Mark what you'll want again",
        body: "Highlight a phrase in your note or inside the passage. The annotation stays attached — so the line that stopped you is findable later.",
      },
      {
        icon: "fa6-solid:clock-rotate-left",
        heading: "The sit isn't lost",
        body: "Weeks later, Recall can resurface a fading note from that morning — or search finds it when half a phrase is all you remember.",
      },
    ],
    featureIds: ["scripture-pills", "dictionary", "highlights", "recall"],
    featuresHeading: "What a long sit asks of your notes",
    featuresLead:
      "Scripture nearby, a dictionary in reach, highlights that stick — and a way for the sit to come back when life has moved on.",
    compareSlugs: ["logos", "obsidian", "life-bible", "faithstudy"],
    testimonialId: "theo",
  },
  {
    slug: "small-group",
    href: "/use-cases/small-group/",
    title: "Group study",
    carouselTitle: "Group study",
    tagline: "Shared spaces are coming soon — so next week can pick up where this discussion left off.",
    icon: "fa6-solid:user-group",
    ink: "var(--study-dock-accent-coralRose)",
    image: "/images/auth-hero/ai_bg_045.webp",
    comingSoon: true,
    comingSoonLine: "Coming soon",
    seoTitle: "Group study — Harvous",
    seoDescription:
      "Lead your group. Harvous shared spaces let your whole group add notes to the same threads — so what you discover together doesn't disappear.",
    heroTitle: "Keep what the group builds.",
    heroLead:
      "You prep questions, you facilitate, you watch people have realizations out loud. And then next week you start from scratch. The things your group discovered together — they're in someone's head, maybe, but not anywhere you can all come back to.",
    sections: [
      {
        heading: "Shared spaces are coming soon",
        paragraphs: [
          "We're building shared spaces so a whole group can study in the same threads — questions, insights, and scripture references that live beyond the hour you meet. It's not fully launched yet, but the foundation is the same Harvous you use for personal study today.",
          "If you lead a group and want early access — or your church is interested in future organization features — [share your interest here](/for/churches/#interest). We'd love to hear how you study together.",
        ],
      },
      {
        heading: "What we're building toward",
        paragraphs: [
          "A shared space for your group with threads per week or topic. Your prep notes stay private; the group sees what you choose to share. You stay in control of who belongs and what the space contains.",
        ],
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
        body: "Week four of your James study has its own thread. Everyone's notes from that session live together. You can look back at what the group found without trying to remember.",
      },
      {
        icon: "fa6-solid:lock",
        heading: "You stay in control",
        body: "You set up the space and invite who belongs. You decide what threads exist and what the group can see. It's your space — others are guests in it.",
      },
      {
        icon: "fa6-solid:user",
        heading: "Keep your prep notes private",
        body: "Your own notes on the passage — the prep, the things you wanted to say, the questions you almost asked — stay in your personal space. The group only sees what you add to the shared one.",
      },
    ],
    featureIds: ["shared-spaces", "threads", "scripture-pills", "highlights"],
    featuresHeading: "What group study will need from Harvous",
    featuresLead:
      "Shared Spaces are on the way — until then, threads, scripture pills, and highlights are the personal-study pieces leaders reach for when prepping and following up.",
    compareSlugs: ["pray-com", "youversion", "notion"],
    testimonialId: "joschua",
  },
];

export function getUseCases(): UseCase[] {
  return useCases;
}

export function getUseCaseBySlug(slug: string): UseCase | undefined {
  return useCases.find((uc) => uc.slug === slug);
}

/** Carousel + hub card display title. */
export function getUseCaseDisplayTitle(useCase: UseCase): string {
  return useCase.carouselTitle ?? useCase.title;
}
