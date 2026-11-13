/**
 * What each scene opens in Derek's account. These are his choices: studies
 * he's comfortable showing on the homepage. Nothing locked, nothing private.
 *
 * Leave a value null to let the scene pick the first suitable item it finds.
 * Ids come from the URL: app.harvous.com/<noteId>, /read/<book>/<chapter>.
 */
export type Picks = {
  /** Bible reader: a chapter with Derek's highlights and margin notes on it. */
  readerChapter: { book: string; chapter: number };
  /** Bible reader: the verse tapped and highlighted on camera. */
  readerVerse: number;
  /** Scripture scene: the reference typed into the throwaway note. */
  typedReference: string;
  /** Scripture scene: the throwaway note's title. */
  typedTitle: string;
  /** Scripture scene: the line typed before the reference. */
  typedLine: string;
  /** Dock and organize scenes: a real note with pills and tags (id from its URL). */
  studyNote: string;
  /** Threads scene: a thread with several notes in it, by its title. */
  threadTitle: string | null;
};

export const PICKS: Picks = {
  // Exodus is where Derek has studied most; 34:1-7 carries his "What is God like?" note.
  readerChapter: { book: "exodus", chapter: 34 },
  readerVerse: 6,
  typedTitle: "Remain",
  typedReference: "John 15:5",
  typedLine: "Remain is the word that keeps coming back to me. ",
  // "What is God like?" (Exodus 34:1-7): pills, a long body, a dozen tags.
  studyNote: "1794159746694",
  threadTitle: "Holy Spirit",
};
