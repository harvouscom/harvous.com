/**
 * Which release notes actually exist, for the app to ask before it links to one.
 *
 * The app version bumps on every commit, so a build is routinely ahead of anything published
 * here — `/release-notes/v2-96-1/` was a 404 while the newest page was `v2-87-2`. The app
 * could not tell the difference from its own origin: a cross-origin `fetch` cannot report a
 * 404 back, and a `no-cors` request comes back opaque. So it linked to the index instead,
 * which is always right and never specific.
 *
 * This is the missing fact, published as a fact. Slugs only, newest first — the app needs to
 * answer one question ("is there a page for this version?") and nothing here should tempt it
 * into rendering our content.
 */
import type { APIRoute } from 'astro';
import { getReleaseNotes } from '../../lib/release-notes-data.ts';

export const GET: APIRoute = () => {
  const slugs = getReleaseNotes().map((note) => note.slug);

  return new Response(JSON.stringify({ slugs }), {
    headers: {
      'Content-Type': 'application/json',
      /*
       * Readable by the app, which is a different origin. Open to anyone because it is a list
       * of URLs already public in the sitemap — there is nothing here to protect.
       */
      'Access-Control-Allow-Origin': '*',
      /* A release ships a few times a week; a day-old answer only ever costs one deep link. */
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
};
