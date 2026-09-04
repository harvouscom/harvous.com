/**
 * Cloudflare Worker in front of the static site.
 *
 * Almost nothing runs here. The site is 493 prerendered pages served from
 * Workers static assets; the Worker exists for the one path that needs a
 * server — the church directory typeahead, which holds the Here's My Church
 * partner key.
 *
 * Everything else is handed to `env.ASSETS`, which runs the full asset
 * pipeline: `_redirects` (public/_redirects), `_headers`, directory-index
 * resolution for Astro's `/about/index.html` layout, and the 404 page.
 *
 * @see src/lib/church-search.ts — the handler, shared with the Netlify shim
 * @see wrangler.jsonc — assets config and `run_worker_first`
 */
import { handleChurchSearch } from '../src/lib/church-search.ts';

type Env = {
  /** Static assets binding — `dist/`, with `_redirects` and `_headers` applied. */
  ASSETS: { fetch(request: Request): Promise<Response> };
  HERESMYCHURCH_API_BASE?: string;
  HERESMYCHURCH_ANON_KEY?: string;
  HERESMYCHURCH_PARTNER_API_KEY?: string;
};

/** Trailing slash tolerated so a hand-typed URL behaves like the one the form sends. */
function isChurchSearch(pathname: string): boolean {
  return pathname === '/api/church-search' || pathname === '/api/church-search/';
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (isChurchSearch(pathname)) {
      return handleChurchSearch(request, {
        HERESMYCHURCH_API_BASE: env.HERESMYCHURCH_API_BASE,
        HERESMYCHURCH_ANON_KEY: env.HERESMYCHURCH_ANON_KEY,
        HERESMYCHURCH_PARTNER_API_KEY: env.HERESMYCHURCH_PARTNER_API_KEY,
      });
    }

    // Includes unmatched /api/* — `run_worker_first` sends those here, and the
    // asset pipeline answers them with the 404 page rather than inventing one.
    //
    // Note this handler is not on the path of a normal page view at all: the
    // asset router answers matching paths before the Worker is invoked.
    // Anything that must apply to every response (staging's noindex, security
    // headers) belongs in `_headers`, not here.
    return env.ASSETS.fetch(request);
  },
};
