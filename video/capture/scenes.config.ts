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
  /** Dock scene: a dotted dictionary word in the passage to tap (null: the first one in view). */
  dictionaryWord: string | null;
  /** Organize scene: the topic folder opened at the end, by name. */
  folderName: string;
};

export const PICKS: Picks = {
  // Exodus is where Derek has studied most. Chapter 33 carries two of his
  // notes ("Presence over promise", "When worship goes wrong"); verse 14 is
  // "My Presence will go with you".
  readerChapter: { book: "exodus", chapter: 33 },
  readerVerse: 14,
  typedTitle: "Remain",
  typedReference: "John 15:5",
  typedLine: "Remain is the word that keeps coming back to me. ",
  // "Presence over promise" (Exodus 33:1-3, sermon notes): seven clean pills,
  // a long body, and another note on the same passage. ("What is God like?"
  // was used before, but its Exodus 34 pill is in the old chapter-only format.)
  studyNote: "1793554701858",
  threadTitle: "Holy Spirit",
  dictionaryWord: "Moses",
  folderName: "Exodus",
};
