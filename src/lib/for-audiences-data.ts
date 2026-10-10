import { getUseCaseBySlug, getUseCases, type UseCase } from "./use-cases-data.ts";

export type ForAudienceMoment = {
  icon: string;
  heading: string;
  body: string;
};

export type ForAudienceSection = {
  heading: string;
  paragraphs: string[];
  /**
   * A stylized app moment drawn beside the section, by name: a ShowcaseVisual
   * name on personal pages (StudyScenes.astro), a church scene on /for/churches/
   * (ChurchScenes.astro). A page whose sections carry one renders as numbered
   * journey rows instead of a single column of prose, and drops the feature
   * list at the end, because each step already names its feature.
   */
  visual?: string;
  /** Accessible label for the visual; the heading when absent. */
  visualLabel?: string;
  /** The feature this step leans on (a features-collection or product-grid id), shown as a chip. */
  feature?: string;
  /** Optional gradient CTA under the section body (e.g. link to #interest). */
  ctaHref?: string;
  ctaLabel?: string;
};

/** A section's `feature`, resolved for display (see /for/[slug].astro). */
export type ForAudienceFeatureLink = {
  title: string;
  href?: string;
  soon: boolean;
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
  /**
   * A neutral status chip for something that is live but not self-serve — it
   * sits in the same slot as the coming-soon badge without claiming the page is
   * unbuilt. Church org shipped in v2.21.0 while onboarding stays by request,
   * which neither `comingSoon` nor silence describes honestly.
   */
  statusLine?: string;
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
  /** Show the church interest Netlify form instead of (or ahead of) the signup closing CTA. */
  interestForm?: boolean;
};

const audiences: ForAudience[] = [
  {
    slug: "daily-readers",
    href: "/for/daily-readers/",
    title: "Daily readers",
    tagline: "You open Scripture most days. Harvous is where the thoughts go.",
    icon: "fa7-solid:book-open-reader",
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
        heading: "Open to today, even when you don't know where to start",
        visual: "passage",
        feature: "daily-passage",
        paragraphs: [
          "Most days the hardest part is the first minute. The daily passage gives you somewhere to begin: a few verses, ready to read, with room to write what stays with you. It's not a reading plan that decides what's next. It's just a place to start when you don't have one.",
        ],
      },
      {
        heading: "Write it down while it's still warm",
        visual: "pills",
        feature: "scripture-pills",
        paragraphs: [
          "Put a note next to the passage before the moment passes. Type a reference and it becomes a scripture pill. Tap it and the verse is right there, in the translation you like. There's no filing ritual and no app-switching.",
        ],
      },
      {
        heading: "Read the chapter, with your notes in the margin",
        visual: "reader",
        feature: "bible-reader",
        paragraphs: [
          "When a verse pulls you further in, open the whole chapter in the built-in reader. Anything you've already written about those verses shows up in the margin, so Monday's thought is waiting when you come back on Thursday.",
        ],
      },
      {
        heading: "Monday's thought, back before Thursday",
        visual: "suggestions",
        feature: "suggestions",
        paragraphs: [
          "Daily reading works when you can look back. When the week gets loud, Suggestions can resurface a fading note or passage from your own study, so what you noticed builds on itself instead of quietly disappearing.",
        ],
      },
      {
        heading: "A nudge on the days it slips",
        visual: "reminders",
        feature: "reminders",
        paragraphs: [
          "Optional reminders carry the day's verse and open straight to it, on Sunday and midweek or every morning if that's closer to your rhythm. You set the hour. Stop opening them and they quiet down on their own.",
        ],
      },
      {
        heading: "The habit is there. Now the record is too.",
        paragraphs: [
          "Harvous isn't a reading plan or a devotion that writes the reflection for you. It's a place for your notes, linked to Scripture and organized by what they're about, so a little most days adds up to something you can look back on.",
        ],
      },
    ],
    /* Folded into the journey above: each step is one of these moments, drawn. */
    moments: [],
    featureIds: ["scripture-pills", "daily-passage", "bible-reader", "suggestions", "reminders"],
    featuresHeading: "What a daily rhythm asks of your notes",
    featuresLead:
      "Open a verse, save what stood out, and find it again later — the pieces people lean on most for everyday study.",
    compareSlugs: ["youversion", "dwell", "readscripture", "spirit-notes", "abide"],
    useCaseSlugs: ["daily-journal"],
    testimonialId: "yeish",
  },
  {
    slug: "prayer-journaling",
    href: "/for/prayer-journaling/",
    title: "Prayer journaling",
    tagline: "When your notes look a lot like prayer.",
    icon: "fa7-solid:hands-praying",
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
        heading: "Pray with the verse in front of you",
        visual: "pills",
        feature: "scripture-pills",
        paragraphs: [
          "Add the verse you're sitting with and write what comes: a worry, a thank-you, a question you don't have words for yet. The scripture that sparked the prayer stays one tap away, so the note and the passage stay together.",
        ],
      },
      {
        heading: "Yours alone",
        visual: "private",
        paragraphs: [
          "Prayer journaling needs a place that feels like yours. Personal spaces are private, and any note can be locked with a PIN, encrypted so even Harvous can't read it. Write the honest version.",
        ],
      },
      {
        heading: "Mark the line that spoke",
        visual: "highlights",
        feature: "highlights",
        paragraphs: [
          "Highlight the phrase that met you this morning and add a few words beside it. Weeks later, the line and what you were carrying when you read it are still together.",
        ],
      },
      {
        heading: "Find what you prayed last spring",
        visual: "mentions",
        feature: "sidebar-modes",
        paragraphs: [
          "When the same worry or hope shows up across weeks, search for a phrase you half-remember, or @-mention an earlier note to link today's prayer to it. Prayer notes shouldn't disappear into a phone gallery.",
        ],
      },
      {
        heading: "On a walk, in the pew, without a signal",
        visual: "offline",
        feature: "offline-sync",
        paragraphs: [
          "Harvous keeps writing offline and syncs the moment you reconnect, so a prayer never has to wait for Wi-Fi to be written down.",
        ],
      },
      {
        heading: "Not a productivity system",
        paragraphs: [
          "You're not trying to produce content. You're trying to remember what you prayed, what you noticed, and what you want to bring back next time. Harvous is still a notes tool. It just fits the way prayer and study overlap for a lot of people.",
        ],
      },
    ],
    /* Folded into the journey above: each step is one of these moments, drawn. */
    moments: [],
    featureIds: ["scripture-pills", "sidebar-modes", "highlights", "offline-sync"],
    featuresHeading: "What prayer-shaped notes need",
    featuresLead:
      "Private capture, scripture nearby, and a way back to what you wrote — without turning prayer into a productivity system.",
    compareSlugs: ["youversion", "spirit-notes", "church-notes", "abide", "apple-notes"],
    useCaseSlugs: ["daily-journal"],
  },
  {
    slug: "new-to-the-bible",
    href: "/for/new-to-the-bible/",
    title: "New to the Bible",
    tagline: "Curious, new to faith, or finding your footing again.",
    icon: "fa7-solid:seedling",
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
        heading: "Start with one passage",
        visual: "passage",
        feature: "daily-passage",
        paragraphs: [
          "When you're not sure what to read, the daily passage gives you a few verses and room to jot down what stays with you. You don't need a plan or a seminary vocabulary to begin. You just need a place to start.",
        ],
      },
      {
        heading: "Look up the word without leaving",
        visual: "dictionary",
        feature: "dictionary",
        paragraphs: [
          "Covenant. Atonement. Pharisee. Easton's Bible Dictionary is built in, so an unfamiliar word gets explained right where you're reading instead of sending you down a rabbit hole of tabs.",
        ],
      },
      {
        heading: "See it in context",
        visual: "reader",
        feature: "bible-reader",
        paragraphs: [
          "Open the whole chapter right inside Harvous, or keep the app or paper Bible you already use. Either way, the notes go here, and the ones you've written show up beside the verses they're about.",
        ],
      },
      {
        heading: "Write like yourself",
        visual: "pills",
        feature: "scripture-pills",
        paragraphs: [
          "No templates required. A short note in your own words next to a verse is enough. Type the reference and it becomes a pill you can tap later. The point is remembering, not sounding polished, and search will find your notes in your own words.",
        ],
      },
      {
        heading: "A gentle nudge, if you want one",
        visual: "reminders",
        feature: "reminders",
        paragraphs: [
          "Turn on reminders and the day's verse arrives at the hour you choose, opening straight to it. Or leave them off, or let them quiet down on their own. Nobody is keeping score.",
        ],
      },
      {
        heading: "There's space for you here",
        paragraphs: [
          "Some people have decades of notes. Some are opening Scripture for the first time. Harvous is a memory tool either way: save what stood out, link it to the verse, and when a theme like hope or forgiveness keeps coming up, a thread can hold it together across books.",
        ],
      },
    ],
    /* Folded into the journey above: each step is one of these moments, drawn. */
    moments: [],
    featureIds: ["daily-passage", "scripture-pills", "bible-reader", "dictionary", "reminders"],
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
    icon: "fa7-solid:church",
    ink: "var(--study-dock-accent-teal)",
    image: "/images/auth-hero/ai_bg_075.webp",
    seoTitle: "For Sunday sermon note-takers — Harvous",
    seoDescription:
      "You take notes at church. Harvous keeps them in series threads, scripture-linked and searchable — not sermon transcription.",
    heroTitle: "For people who write things down on Sunday.",
    heroLead:
      "Phone, bulletin, journal — whatever's in your lap. The notes exist somewhere. But they don't connect to each other, and two months later you couldn't find that one line if you tried.",
    sections: [
      {
        heading: "Catch the verses as they're read",
        visual: "pills",
        feature: "scripture-pills",
        paragraphs: [
          "Phone, bulletin, journal: whatever's in your lap. In Harvous, type the reference the pastor reads and it becomes a pill. Tap it later and the whole passage is there. These are your notes, not a transcript.",
        ],
      },
      {
        heading: "Save the line that landed",
        visual: "highlights",
        feature: "highlights",
        paragraphs: [
          "Highlight the phrase you'd have underlined, and it stays linked to the note it came from. The sentence that hit you on Sunday is still attached to the passage in October.",
        ],
      },
      {
        heading: "One thread per series",
        visual: "threads",
        feature: "threads",
        paragraphs: [
          "A thread called \"Romans: Sunday series\" collects every week. Week one lives next to week eight, so you can scroll back and see the arc instead of hunting through photos and apps.",
        ],
      },
      {
        heading: "Find it with half a phrase",
        visual: "mentions",
        feature: "sidebar-modes",
        paragraphs: [
          "Two months later, half a sentence is all you remember. Search finds it. An @-mention links this week's notes to last week's, so the series reads like one conversation.",
        ],
      },
      {
        heading: "Monday doesn't get to erase Sunday",
        visual: "suggestions",
        feature: "suggestions",
        paragraphs: [
          "During the week, Suggestions can resurface a fading sermon note. Add an optional Sunday-morning reminder that carries the day's passage, and you'll arrive with somewhere to write.",
        ],
      },
      {
        heading: "Your notes. Not a transcript.",
        paragraphs: [
          "Some apps try to capture the whole sermon for you. Harvous gives your own notes a home: linked to Scripture, grouped by series, and searchable. Keep your Bible app for reading. The point is that Sunday builds up over the weeks instead of fading.",
        ],
      },
    ],
    /* Folded into the journey above: each step is one of these moments, drawn. */
    moments: [],
    featureIds: ["scripture-pills", "highlights", "sidebar-modes", "suggestions", "reminders"],
    featuresHeading: "What Sunday notes need to survive the week",
    featuresLead:
      "Link scripture, group by series, and search when half a phrase is all you have — so Sunday doesn't disappear by Monday.",
    compareSlugs: ["bible-note", "church-notes", "pencil-bible", "spirit-notes", "goodnotes"],
    useCaseSlugs: ["sermon-notes"],
    testimonialId: "teaella",
  },
  {
    slug: "teachers",
    href: "/for/teachers/",
    title: "Teachers",
    tagline: "You prepare, then you teach. Keep both sides of that work.",
    icon: "fa7-solid:chalkboard-user",
    ink: "var(--study-dock-accent-violet)",
    image: "/images/auth-hero/ai_bg_046.webp",
    seoTitle: "For Bible teachers — Harvous",
    seoDescription:
      "Prepare lessons and remember what you taught — Harvous keeps prep notes, scripture, and follow-ups in one place. Host a Shared Space with Harvous Plus when the class needs a room that lasts.",
    heroTitle: "For people who prepare, then teach.",
    heroLead:
      "Sunday school, small group, a class at church — you dig into a passage, sketch questions, teach it out loud, then somehow start from scratch next week. The prep and the teaching deserve a home that lasts.",
    sections: [
      {
        heading: "Start each lesson from a shape you trust",
        visual: "templates",
        feature: "note-templates",
        paragraphs: [
          "Pick a note template, like SOAP, inductive, or one you made, and the lesson starts with structure instead of a blank page. Write the questions you might ask and the line you want to land.",
        ],
      },
      {
        heading: "Every passage at hand, in prep and in class",
        visual: "pills",
        feature: "scripture-pills",
        paragraphs: [
          "Cross-references become scripture pills, one tap from the full text in the translation your class uses. No flipping, and no second app open beside the first.",
        ],
      },
      {
        heading: "Week four builds on week one",
        visual: "threads",
        feature: "threads",
        paragraphs: [
          "Give the series a thread. Prep, questions, and follow-ups stay together, so when you're back next week (or next year), what you already studied is still there.",
        ],
      },
      {
        heading: "Shared when the class needs it",
        visual: "group-threads",
        feature: "shared-spaces",
        paragraphs: [
          "Your prep stays private until you choose what to share. When the room needs a shared trail, [Shared Spaces](/add-ons/shared-spaces/) let the whole class add to the same threads after you leave. Hosting is [Harvous Plus](/pricing/); joining is free.",
        ],
      },
      {
        heading: "Prep that adds up",
        paragraphs: [
          "You're not looking for a research suite. You're looking for a place that remembers what you already studied, so next week doesn't start from scratch.",
        ],
      },
    ],
    /* Folded into the journey above: each step is one of these moments, drawn. */
    moments: [],
    featureIds: ["scripture-pills", "threads", "note-templates", "shared-spaces"],
    featuresHeading: "What teaching asks of your notes",
    featuresLead:
      "Series threads, scripture nearby, note templates for lesson structure — and Shared Spaces when the class needs a room that lasts.",
    compareSlugs: ["logos", "notion", "bible-note", "goodnotes"],
    useCaseSlugs: ["small-group"],
  },
  {
    slug: "pastors",
    href: "/for/pastors/",
    title: "Pastors",
    tagline: "You prepare, then you preach. Keep a year of that work.",
    icon: "fa7-solid:book-bible",
    ink: "var(--study-dock-accent-violet)",
    image: "/images/auth-hero/ai_bg_076.webp",
    seoTitle: "For pastors — sermon prep notes that last — Harvous",
    seoDescription:
      "Sermon prep that leaves a trail across the preaching year — series threads, scripture-linked outline notes, and Suggestions when last year’s work needs to show up again. Shared Spaces when a staff huddle or class needs the trail — host with Harvous Plus; joining is free.",
    heroTitle: "For people who prepare, then preach.",
    heroLead:
      "Sunday keeps coming. You’re digging into a text, shaping an outline, landing a line — then somehow next week starts from a blank page. The prep for a preaching calendar deserves a home that lasts years, not a folder of untitled docs.",
    sections: [
      {
        heading: "Shape the message from a template",
        visual: "templates",
        feature: "note-templates",
        paragraphs: [
          "Start from a sermon outline template, or your own, and sketch the moves of the message. You're not looking for podium mode or an illustration marketplace. You want a starting shape that doesn't fight you.",
        ],
      },
      {
        heading: "Pull the passages in as you outline",
        visual: "pills",
        feature: "scripture-pills",
        paragraphs: [
          "Every reference becomes a scripture pill, so the text is one tap away while you outline and while you revise. Highlight the sentence that has to land.",
        ],
      },
      {
        heading: "A thread for every series",
        visual: "threads",
        feature: "threads",
        paragraphs: [
          "Romans, Advent, a topical run: each series gets a thread that keeps every week's prep together, so the arc stays visible from the first week to the last.",
        ],
      },
      {
        heading: "Week 40 can find week 3",
        visual: "suggestions",
        feature: "suggestions",
        paragraphs: [
          "When you're back on a familiar text, Suggestions can bring last year's prep forward, still linked to the passage. The thinking behind the sermon doesn't disappear between Sundays.",
        ],
      },
      {
        heading: "Shared when the room needs the trail",
        visual: "group-threads",
        feature: "shared-spaces",
        paragraphs: [
          "Personal prep stays private by default. When a staff huddle, elder study, or class needs the same threads, [Shared Spaces](/add-ons/shared-spaces/) let the whole group contribute. Hosting is included with [Harvous Plus](/pricing/); joining is always free.",
        ],
      },
      {
        heading: "Depth without the heavy suite (unless you want one)",
        paragraphs: [
          "Logos and library stacks have their place for commentaries and languages. Harvous sits in the middle, for the notes you write while you prepare. If your church runs on Harvous, the plan behind Sunday lives there too: a teaching plan per ministry, a series you name once that every week carries, and a whole quarter planned in one pass. [See how it works for churches](/for/churches/).",
        ],
      },
    ],
    /* Folded into the journey above: each step is one of these moments, drawn. */
    moments: [],
    featureIds: ["scripture-pills", "threads", "note-templates", "suggestions", "shared-spaces"],
    featuresHeading: "What preaching asks of your notes",
    featuresLead:
      "Series threads, scripture nearby, note templates when you want a starting shape — and Suggestions across the calendar year. Shared Spaces when a room needs the trail.",
    compareSlugs: ["sermonary", "sermons-app", "sermons-com", "pulpit-ai", "logos", "notion", "obsidian"],
    useCaseSlugs: ["sermon-prep", "deep-study", "book-study", "small-group"],
  },
  {
    slug: "going-through-a-book",
    href: "/for/going-through-a-book/",
    title: "Going through a book",
    tagline: "One book. Weeks or months. Notes that compound.",
    icon: "fa7-solid:lines-leaning",
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
        heading: "Read it chapter by chapter",
        visual: "reader",
        feature: "bible-reader",
        paragraphs: [
          "Open Romans in the built-in reader and pick up where you left off, in the translation you prefer. The notes you've already written show up in the margin beside the verses they're about.",
        ],
      },
      {
        heading: "A note for every \"wait, that connects to…\"",
        visual: "pills",
        feature: "scripture-pills",
        paragraphs: [
          "Book study isn't one note. It's dozens of questions and cross-references. Type a reference and it becomes a pill you can open right there, so the link back to Genesis is one tap away instead of a lookup.",
        ],
      },
      {
        heading: "Highlights that build across the book",
        visual: "highlights",
        feature: "highlights",
        paragraphs: [
          "Highlight in the reader or in a note; it's the same layer either way. By chapter twelve, you can see which lines kept stopping you.",
        ],
      },
      {
        heading: "The book becomes a thread",
        visual: "threads",
        feature: "threads",
        paragraphs: [
          "Connect the notes in order and the study has a spine, chapter one through the last, in one thread. A thought on justification can sit in your Romans thread and a theology thread at the same time.",
        ],
      },
      {
        heading: "A study deserves its own space",
        paragraphs: [
          "Month three should still remember month one. Harvous gives the book its own home, with a built-in dictionary when a word needs explaining, so Romans doesn't bleed into your Sunday notes unless you want it to.",
        ],
      },
    ],
    /* Folded into the journey above: each step is one of these moments, drawn. */
    moments: [],
    featureIds: ["scripture-pills", "bible-reader", "threads", "highlights"],
    featuresHeading: "What book study asks of your notes",
    featuresLead:
      "Chapter by chapter, reference by reference — the pieces that help one book compound instead of scatter.",
    compareSlugs: ["logos", "bibleproject", "faithstudy", "life-bible"],
    useCaseSlugs: ["book-study"],
    testimonialId: "yeish",
  },
  {
    slug: "seminary-students",
    href: "/for/seminary-students/",
    title: "Seminary & Bible college",
    tagline: "Classes, papers, long sits — notes that have to last a term.",
    icon: "fa7-solid:graduation-cap",
    ink: "var(--study-dock-accent-warmAmber)",
    image: "/images/auth-hero/ai_bg_051.webp",
    seoTitle: "For seminary and Bible college students — Harvous",
    seoDescription:
      "Seminary and Bible college notes that compound — deep sits, book and topical threads, scripture pills, and Suggestions when week 10 needs week 3.",
    heroTitle: "For people whose study has to last a term.",
    heroLead:
      "You're not collecting inspirational snippets. You're sitting with texts for class, tracing themes for a paper, working a book for weeks — and you need notes that still make sense when midterms show up.",
    sections: [
      {
        heading: "Word study without twelve tabs",
        visual: "dictionary",
        feature: "dictionary",
        paragraphs: [
          "Select a term for its Easton's entry without leaving the page. Keep the passage open beside your writing and stay in the note while you work.",
        ],
      },
      {
        heading: "Cross-references that open where you are",
        visual: "pills",
        feature: "scripture-pills",
        paragraphs: [
          "Every reference becomes a scripture pill you can open across translations: compare, tap through, and keep writing. Logos and library stacks still have their place. This is where your own notes live.",
        ],
      },
      {
        heading: "Annotate the line that matters",
        visual: "highlights",
        feature: "highlights",
        paragraphs: [
          "Highlights stay attached to the line that mattered, with your comment beside them, whether you made them while reading for class or while drafting a paper.",
        ],
      },
      {
        heading: "Week 10 still finds week 3",
        visual: "suggestions",
        feature: "suggestions",
        paragraphs: [
          "Search and threads help you dig on purpose. Suggestions help when you weren't looking: a note from early in the term can resurface right when you're writing later.",
        ],
      },
      {
        heading: "Notes that last a term",
        paragraphs: [
          "A deep sit with one passage can live next to a semester-long book thread or a topical thread on covenant. Your own work builds up instead of living in a graveyard of untitled docs.",
        ],
      },
    ],
    /* Folded into the journey above: each step is one of these moments, drawn. */
    moments: [],
    featureIds: ["scripture-pills", "dictionary", "suggestions", "highlights"],
    featuresHeading: "What a term of study asks of your notes",
    featuresLead:
      "Scripture nearby, a dictionary in reach, threads that last — and Suggestions when an earlier note needs to show up again.",
    compareSlugs: ["logos", "obsidian", "notion", "life-bible"],
    useCaseSlugs: ["deep-study", "book-study", "topical-study"],
  },
  {
    slug: "following-a-theme",
    href: "/for/following-a-theme/",
    title: "Following a theme",
    tagline: "Grace, prayer, hope — wherever Scripture takes the thread.",
    icon: "fa7-solid:tags",
    ink: "var(--study-dock-accent-mintGreen)",
    image: "/images/auth-hero/ai_bg_052.webp",
    seoTitle: "For topical Bible study — Harvous",
    seoDescription:
      "Chasing a theme across Scripture? Harvous keeps notes on grace, prayer, or any topic together — no matter which book they came from.",
    heroTitle: "For people chasing a theme across Scripture.",
    heroLead:
      "You start noticing something. Grace in Genesis, in Paul, in the Psalms. Or you're tracing prayer, or what Scripture says about hope. You need a place that can hold a thread that runs across the whole Bible.",
    sections: [
      {
        heading: "Start from a word",
        visual: "dictionary",
        feature: "dictionary",
        paragraphs: [
          "Noticing grace everywhere? Start with what the word means. Easton's dictionary is built in, with the passages it points to as pills you can open.",
        ],
      },
      {
        heading: "Collect it from wherever it shows up",
        visual: "pills",
        feature: "scripture-pills",
        paragraphs: [
          "Genesis on Monday, Ephesians on Thursday, a Psalm on Sunday. Each note carries its references as pills, so the passages travel with the thought.",
        ],
      },
      {
        heading: "Mark the pattern as it appears",
        visual: "highlights",
        feature: "highlights",
        paragraphs: [
          "Highlight the line in each passage and add a few words. Shared language across notes helps the pattern surface, even when you weren't looking for it.",
        ],
      },
      {
        heading: "Tie it together with a thread",
        visual: "threads",
        feature: "threads",
        paragraphs: [
          "A thread called \"Grace\" connects notes from different books and seasons in the order you choose. Harvous organizes by what the notes are about, not where you happened to be reading that day.",
        ],
      },
      {
        heading: "Themes don't stay in one book",
        paragraphs: [
          "Search uses your own words, because you won't tag perfectly and you shouldn't have to. Half-remember a phrase from months ago and it's still there.",
        ],
      },
    ],
    /* Folded into the journey above: each step is one of these moments, drawn. */
    moments: [],
    featureIds: ["scripture-pills", "threads", "highlights", "dictionary"],
    featuresHeading: "What a theme needs to stay together",
    featuresLead:
      "Notes from everywhere, organized by what they're about — so a thread can run across the whole Bible.",
    compareSlugs: ["logos", "life-bible", "readscripture", "obsidian"],
    useCaseSlugs: ["topical-study"],
    testimonialId: "teaella",
  },
  {
    slug: "churches",
    href: "/for/churches/",
    title: "Churches",
    tagline: "Education for the church — plan what each ministry teaches, and keep it.",
    icon: "fa7-solid:church",
    ink: "var(--study-dock-accent-coralRose)",
    image: "/images/auth-hero/ai_bg_045.webp",
    statusLine: "Invite-only",
    interestForm: true,
    seoTitle: "For churches — teaching plans, series, and curriculum in Harvous",
    seoDescription:
      "Harvous serves how the church learns. Plan what each ministry teaches, keep a series together across its weeks, give a volunteer a room to lead, and let connected people receive it. Running with churches now — tell us about yours.",
    heroTitle: "Education for the church.",
    heroLead:
      "Harvous serves how the church learns — believers studying Scripture, pastors teaching it, and churches organizing it. A tool for education. Never a substitute for the body.",
    sections: [
      {
        heading: "From your church, on Sunday",
        visual: "feed",
        feature: "note-templates",
        paragraphs: [
          "People connect to their church in Settings and pick the ministries they want. What the church publishes lands on their Home as \"From your church\", and This Sunday opens with the church's note template, ready for their own words. The note stays theirs.",
        ],
      },
      {
        heading: "Plan what each ministry teaches",
        visual: "planner",
        paragraphs: [
          "Each ministry keeps its own teaching plan, so Youth's Wednesdays sit beside the Sunday service. Name a series once and every week carries it. Schedule a post for Sunday morning, or have a pastor approve it first.",
        ],
      },
      {
        heading: "Roles that match how a church works",
        visual: "roles",
        paragraphs: [
          "A pastor decides what the church teaches. A teacher publishes to the ministry they lead, and only there. The volunteer who runs a group can lead that one room, granted on purpose and taken back the same way.",
        ],
        ctaHref: "#interest",
        ctaLabel: "Tell us about your church",
      },
      {
        heading: "Invite with a link",
        visual: "join",
        paragraphs: [
          "Share a join link, or print its QR code for the bulletin board or the projector. Someone scans it, picks the ministries they want to follow, and they're connected. You see how many joined that way.",
        ],
      },
      {
        heading: "Review from your church",
        visual: "review",
        paragraphs: [
          "Teachers write a few questions on what their ministry is studying: multiple choice, put in order, match the pairs. They're free for anyone who follows, and staff only ever see how many answered.",
        ],
      },
      {
        heading: "What a church sees",
        visual: "sees",
        paragraphs: [
          "How many people are connected, and how many follow each channel. That's all. Harvous never shows a church who wrote what, or whether anyone wrote at all.",
        ],
      },
      {
        heading: "What Harvous is not",
        paragraphs: [
          "A notes and study tool, not a church management system: no giving, check-in, or scheduling, and never a substitute for pastors or the gathered body. Down the road, I plan integrations with tools like Planning Center so rosters can sync in.",
        ],
      },
    ],
    /* The scenes beside each section show these moments, so the grid is left out here. */
    moments: [],
    featureIds: ["shared-spaces", "threads", "scripture-pills", "highlights"],
    featuresHeading: "What church study builds on",
    featuresLead:
      "Church features ride the same notes, threads, and scripture tools personal Harvous already uses — so what a congregant keeps from Sunday is an ordinary note in their own Harvous, theirs to keep.",
    compareSlugs: [
      "planning-center-groups",
      "band",
      "groupme",
      "whatsapp",
      "subsplash-groups",
      "youversion",
      "notion",
    ],
    useCaseSlugs: ["small-group", "sermon-notes"],
  },
  {
    slug: "group-leaders",
    href: "/for/group-leaders/",
    title: "Group leaders",
    tagline: "You lead the discussion. Keep what the group builds.",
    icon: "fa7-solid:user-group",
    ink: "var(--study-dock-accent-coralRose)",
    image: "/images/auth-hero/ai_bg_059.webp",
    seoTitle: "For small group leaders — Harvous",
    seoDescription:
      "Lead your group and keep what you discover together. Host a Shared Space with Harvous Plus — joining is free. Personal prep works the same way.",
    heroTitle: "For people who lead the discussion.",
    heroLead:
      "You prep questions, you facilitate, you watch people realize things out loud. And then next week it feels like starting over. What the group found together lives in someone's memory — maybe — but not somewhere you can all return to.",
    sections: [
      {
        heading: "Prep with a shape",
        visual: "templates",
        feature: "note-templates",
        paragraphs: [
          "Start your prep from a note template: the passage, what you noticed, the questions you want to ask. It stays in your own space, private until you choose to share it.",
        ],
      },
      {
        heading: "Every passage, ready for the discussion",
        visual: "pills",
        feature: "scripture-pills",
        paragraphs: [
          "References become scripture pills, so when someone asks about the verse, it's one tap away instead of a scramble for the right page.",
        ],
      },
      {
        heading: "One thread per week, or per topic",
        visual: "threads",
        feature: "threads",
        paragraphs: [
          "Week four of James gets its own thread. What you prepped and what came up in the room stay together, so you can look back without relying on memory alone.",
        ],
      },
      {
        heading: "A shared space for the whole group",
        visual: "group-threads",
        feature: "shared-spaces",
        paragraphs: [
          "[Shared Spaces](/add-ons/shared-spaces/) let everyone study in the same threads: questions, notes, and scripture that live beyond the hour you meet. You set up the space and invite who belongs. Hosting is included with [Harvous Plus](/pricing/); joining is always free.",
        ],
      },
      {
        heading: "What the group finds, kept",
        paragraphs: [
          "Next week shouldn't feel like starting over. What people realized out loud gets written down somewhere you can all return to.",
        ],
      },
    ],
    /* Folded into the journey above: each step is one of these moments, drawn. */
    moments: [],
    featureIds: ["shared-spaces", "threads", "scripture-pills", "note-templates"],
    featuresHeading: "What group leadership needs from Harvous",
    featuresLead:
      "Shared Spaces for the room, plus threads, scripture pills, and note templates for the prep leaders already do.",
    compareSlugs: ["groupme", "whatsapp", "band", "planning-center-groups", "flock", "youversion"],
    useCaseSlugs: ["small-group"],
    testimonialId: "joschua",
  },
  {
    slug: "families",
    href: "/for/families/",
    title: "Families",
    tagline: "One Plus for the household, a space to study in together, and notes that stay each person's own.",
    icon: "fa7-solid:house-chimney-user",
    ink: "var(--study-dock-accent-teal)",
    image: "/images/auth-hero/ai_bg_052.webp",
    seoTitle: "For families — one Harvous Plus for your household",
    seoDescription:
      "Harvous Plus covers up to 5 more people in your family, with a Family Space everyone shares. Parents see how their teenagers' study is going, never what they wrote. For ages 13 and up.",
    heroTitle: "Bible study for the whole household.",
    heroLead:
      "Everyone keeps their own notes. You get a space to study in together, one Plus that covers up to 5 more people, and a way to see how your teenagers are doing without reading over their shoulder.",
    sections: [
      {
        heading: "One Plus, the whole family",
        visual: "family-start",
        visualLabel: "Starting a family in Settings: a Family Space, Plus for 5 more people, progress not notes, ages 13 and up",
        feature: "family",
        paragraphs: [
          "Start a family in Settings, name it, and invite up to 5 more people. Each of them gets Review exercises, unlimited history and Connector, covered by your [Harvous Plus](/pricing/). Hosting other shared spaces stays with whoever pays.",
          "If your Plus ever lapses, the family and its space keep working. Only the coverage and new invites stop.",
        ],
      },
      {
        heading: "A Family Space everyone shares",
        visual: "family-space",
        visualLabel: "The Johnson family's space, with notes on Mark from three people in the family",
        feature: "shared-spaces",
        paragraphs: [
          "Every family gets its own shared space, with the same threads, notes and Scripture you use on your own. Read through a book together, keep what came up at the table, or leave a passage for someone to find. Anyone in the family can write there, and parents can arrange it.",
          "What's in the Family Space stays there. Nothing lands in anyone's own notes unless they copy it in.",
        ],
      },
      {
        heading: "Everyone in their place",
        visual: "family-people",
        visualLabel: "The family's people: two parents, a child and an adult member, and an invite waiting for Tyler",
        paragraphs: [
          "Invite each person as a parent, a child or an adult member. Parents invite and arrange the family. Children share their progress. Adult members, like a grown son or a grandparent, share the plan and the space and nothing else.",
          "Each invite is a single-use link for one person, good for a week.",
        ],
      },
      {
        heading: "Progress, not content",
        visual: "family-progress",
        visualLabel: "A parent's view of Kit: active this week, 11 chapters read, 4 notes written, in Psalms, Mark and Romans",
        paragraphs: [
          "Parents see how each child's study is going over the last 30 days: when they were last active, how many chapters they read and in which books, and how many notes they wrote. Never the notes themselves, their highlights, their searches or their Review.",
          "Notes are where people write prayers and doubts, and nobody writes those honestly in an app that reports to a parent. There's no streak or score either. It's there to encourage, not to grade.",
        ],
      },
      {
        heading: "Agreed to, not imposed",
        visual: "family-invite",
        visualLabel: "A family invite telling a teenager exactly what their parents will and won't see before they join",
        paragraphs: [
          "Families are for people 13 and older. Before a teenager joins as a child, the invite spells out what their parents will see and what they never will, and they see exactly the same numbers about themselves afterwards.",
          "A child can ask to become an adult member, and a parent approves it. Anyone can leave the family at any time, without asking.",
        ],
      },
      {
        heading: "Your church, one follow at a time",
        visual: "family-church",
        visualLabel: "A parent following Sunday service and a teenager following Youth at the same church",
        paragraphs: [
          "If your church is on Harvous, each person in the family connects to it on their own and follows the ministries they want: Sunday service for you, Youth for your teenager. What each ministry publishes shows up on that person's Home, beside their own study.",
          "Church connection stays personal, so a teenager's church life is theirs, and the family is where you bring it home.",
        ],
        ctaHref: "/for/churches/",
        ctaLabel: "Harvous for churches",
      },
      {
        heading: "Faith that's practised at home",
        paragraphs: [
          "Harvous won't replace the dinner-table conversation or the church you share. It gives each of you a place to keep what you're learning, and the family a place to keep it together.",
        ],
      },
    ],
    /* Folded into the journey above: each step is one of these moments, drawn. */
    moments: [],
    featureIds: ["family", "shared-spaces", "review-exercises", "connector"],
    featuresHeading: "What a family's Plus covers",
    featuresLead:
      "The study features of Harvous Plus, for up to 5 more people, and a shared space for the household.",
    compareSlugs: ["youversion", "dwell", "abide"],
    useCaseSlugs: ["daily-journal", "small-group"],
  },
  {
    slug: "bible-app-users",
    href: "/for/bible-app-users/",
    title: "Bible app users",
    tagline: "Keep the app you already read in. Harvous is where the notes go.",
    icon: "fa7-solid:mobile-screen",
    ink: "var(--study-dock-accent-neutral)",
    image: "/images/auth-hero/ai_bg_061.webp",
    seoTitle: "For YouVersion and Bible app users — Harvous",
    seoDescription:
      "Keep YouVersion, Dwell, Logos, or your church app for reading. Harvous is the notes hub — scripture-linked, findable, with Suggestions when thoughts fade.",
    heroTitle: "For people who already have a Bible app.",
    heroLead:
      "You're not looking for another place to read Scripture. You already open YouVersion, Dwell, Logos, or your church's app. What you need is somewhere the thoughts stick — linked to the verse, findable later, not trapped in a reading plan streak.",
    sections: [
      {
        heading: "Keep reading where you read",
        visual: "reader",
        feature: "bible-reader",
        paragraphs: [
          "Harvous isn't trying to replace YouVersion, Dwell, or your church's app. Keep your plan, your audio, your streak. And if you ever want to read here, the built-in reader shows your notes in the margin.",
        ],
      },
      {
        heading: "Notes that know which verse they're about",
        visual: "pills",
        feature: "scripture-pills",
        paragraphs: [
          "After a plan day, drop the verse into Harvous and write what stuck. Type a reference and it becomes a pill across translations, so the passage stays one tap from the thought.",
        ],
      },
      {
        heading: "When the plan moves on, your notes don't",
        visual: "suggestions",
        feature: "suggestions",
        paragraphs: [
          "Plans keep going. Suggestions can bring back a fading note, highlight, or passage from your own study, so last week's thought isn't gone just because the plan moved on.",
        ],
      },
      {
        heading: "In the pew or on a plane",
        visual: "offline",
        feature: "offline-sync",
        paragraphs: [
          "Harvous keeps writing without a connection and syncs the moment you're back, so capture doesn't wait on a signal.",
        ],
      },
      {
        heading: "A reminder that carries the passage",
        visual: "reminders",
        feature: "reminders",
        paragraphs: [
          "Optional reminders arrive with the day's verse or the chapter you left off in, and open straight to it. Your Bible app's reminders can keep doing their job. This one is for your notes.",
        ],
      },
      {
        heading: "Keep your Bible app. Add a notes hub.",
        paragraphs: [
          "Your reading habit can stay exactly where it is. Harvous is for the part in between: read a passage, capture what stood out, and find it again when half a phrase is all you remember.",
        ],
      },
    ],
    /* Folded into the journey above: each step is one of these moments, drawn. */
    moments: [],
    featureIds: ["scripture-pills", "bible-reader", "suggestions", "offline-sync", "reminders"],
    featuresHeading: "What dual-app study asks of your notes",
    featuresLead:
      "Scripture that stays linked, a way back to what you saved, and capture that works when you're offline in the pew or on a plane.",
    compareSlugs: ["youversion", "dwell", "logos", "readscripture", "church-notes", "abide"],
    useCaseSlugs: [
      "daily-journal",
      "sermon-notes",
      "book-study",
      "topical-study",
      "deep-study",
      "small-group",
    ],
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
