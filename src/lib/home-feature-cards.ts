/** Feature bento cards — shared by homepage and use case detail pages. */
export const HOME_FEATURE_CARDS = [
  {
    pills: ["note"] as const,
    title: "Take notes like Google Docs",
    body: "Rich text formatting is, of course, there from creating headings to adding bullets, dividers, and links.",
    image: "/app-note.png",
    imageAlt: "Writing a note in Harvous with rich-text formatting",
  },
  {
    pills: ["scripture"] as const,
    title: "Just type the reference",
    body: "Instead of a Bible reader just type the Scripture reference you want and open it. Available in 11 English translations.",
    image: "/app-scripture.png",
    imageAlt: "A scripture reference opened inline with a translation picker",
  },
  {
    pills: ["highlight"] as const,
    title: "Highlight text and annotate",
    body: "Select text to highlight and add an annotation. You can even do this within the Scripture you add.",
    image: "/app-highlight.png",
    imageAlt: "A highlighted phrase with an annotation",
  },
  {
    pills: ["folder", "thread"] as const,
    title: "Auto or manually organized",
    body: "Notes, by default, automatically organize into folders with tags. Manually connect notes together to create threads.",
    image: "/app-organize.png",
    imageAlt: "Notes auto-organized into folders, with threads connecting them",
  },
] as const;
