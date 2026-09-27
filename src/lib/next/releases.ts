import { getReleaseNotes, type ChangelogEntry, type ChangelogRelease } from "../release-notes-data.ts";

/*
  Release titles come straight from the app's commit log, and a few are written
  for the builder rather than the reader ("verified on local dev", admin and
  billing plumbing). The release-notes pages show them all; a one-line "shipped
  lately" should lead with something a person studying would notice.
*/
const BACKSTAGE = /\b(dev|verified|admin|billing|invoice|staff|tests?|migration|refactor)\b|#\d+/i;

const readable = (e: ChangelogEntry) => !BACKSTAGE.test(e.title);

/** A release in one line: its first reader-facing feature, else improvement, else fix. */
export function releaseHeadline(r: ChangelogRelease): string | undefined {
  for (const category of ["Feature", "Improvement", "Fix"]) {
    const hit = r.entries.find((e) => e.category === category && readable(e));
    if (hit) return hit.title;
  }
  return undefined;
}

/** The latest releases that have something reader-facing to say. */
export function recentReleases(count: number): { release: ChangelogRelease; headline: string }[] {
  return getReleaseNotes()
    .map((release) => ({ release, headline: releaseHeadline(release) }))
    .filter((r): r is { release: ChangelogRelease; headline: string } => Boolean(r.headline))
    .slice(0, count);
}
