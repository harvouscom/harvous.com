/**
 * The four blocks under the homepage hero — one per content pill the hero
 * cycles through (note, scripture, highlight, folder + thread), each with the
 * close-up that shows it. They were FeatureBento until the tour replaced it;
 * they're back inside the tour because they're the visual link from the hero's
 * cycling pill to the section beneath it, and nothing else on the page makes
 * that connection.
 *
 * Three close-ups are surfaces 3.0 didn't change — the editor, the expanded
 * Scripture pill, the highlight annotation — so they're still true. The old
 * organize shot was the sidebar's folder view, which 3.0 removed, so that card
 * points at a slot instead: drop `tour-organize.png` into public/tour/ (a note
 * in its auto-folder with tags, and a thread beside it) and AppTour swaps it
 * in; until then the card shows its pills.
 */
export type PillType = "note" | "scripture" | "highlight" | "folder" | "thread";

export type HomeFeatureCard = {
  pills: PillType[];
  title: string;
  body: string;
  /** Close-up at 1054×480. May not exist yet — AppTour checks on disk. */
  image?: string;
  imageAlt?: string;
};

export const HOME_FEATURE_CARDS: HomeFeatureCard[] = [
  {
    pills: ["note"],
    title: "Take notes like Google Docs",
    body: "Rich text is there — headings, bullets, dividers, links. Type @ to mention a note, folder, thread, or resource as a pill.",
    image: "/app-note.png",
    imageAlt: "Writing a note in Harvous with rich-text formatting",
  },
  {
    pills: ["scripture"],
    title: "Just type the reference",
    body: "Type a reference and it becomes a pill in your note, in 11 translations. Open the chapter instead, and your notes and highlights for it are already there in the margin.",
    image: "/app-scripture.png",
    imageAlt: "A scripture reference opened inline with a translation picker",
  },
  {
    pills: ["highlight"],
    title: "Highlight text and annotate",
    body: "Select text to highlight and add an annotation. You can even do this within the Scripture you add.",
    image: "/app-highlight.png",
    imageAlt: "A highlighted phrase with an annotation",
  },
  {
    pills: ["folder", "thread"],
    title: "Auto or manually organized",
    body: "Notes file themselves into folders with tags as you write. Connect notes by hand to make a thread you can follow later.",
    image: "/tour/tour-organize.png",
    imageAlt: "A note in its auto-folder with its tags, and a thread connecting it to others",
  },
];
