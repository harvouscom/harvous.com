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
import { parseChurchInterest } from '../src/lib/church-interest.ts';

type D1Result = { success: boolean };
type D1PreparedStatement = {
  bind(...values: unknown[]): D1PreparedStatement;
  run(): Promise<D1Result>;
};
type D1Database = { prepare(query: string): D1PreparedStatement };

type Env = {
  /** Static assets binding — `dist/`, with `_redirects` and `_headers` applied. */
  ASSETS: { fetch(request: Request): Promise<Response> };
  /** Church interest submissions. See cloudflare/migrations/. */
  DB?: D1Database;
  HERESMYCHURCH_API_BASE?: string;
  HERESMYCHURCH_ANON_KEY?: string;
  HERESMYCHURCH_PARTNER_API_KEY?: string;
};

/** Trailing slash tolerated so a hand-typed URL behaves like the one the form sends. */
function isChurchSearch(pathname: string): boolean {
  return pathname === '/api/church-search' || pathname === '/api/church-search/';
}

/** The church interest form posts to its own page — Netlify Forms' convention. */
function isChurchInterest(pathname: string): boolean {
  return pathname === '/for/churches' || pathname === '/for/churches/';
}

const SUCCESS_PATH = '/for/churches/?submitted=1#interest';

/** A form navigation asks for HTML; the form's own fetch() does not. */
function wantsHtml(request: Request): boolean {
  return (request.headers.get('accept') ?? '').includes('text/html');
}

function submissionResponse(
  request: Request,
  body: Record<string, unknown>,
  status: number
): Response {
  // No-JS submits by navigating, so answer with somewhere to land. 303 so the
  // browser follows with GET and a reload does not repost.
  if (wantsHtml(request) && status === 200) {
    return new Response(null, { status: 303, headers: { Location: SUCCESS_PATH } });
  }
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

/** Bigger than any real submission, small enough that nothing is worth buffering. */
const MAX_BODY_BYTES = 16 * 1024;

async function handleChurchInterest(request: Request, env: Env): Promise<Response> {
  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('application/x-www-form-urlencoded')) {
    return submissionResponse(request, { error: 'unsupported_media_type' }, 415);
  }

  const declared = Number(request.headers.get('content-length') ?? '0');
  if (declared > MAX_BODY_BYTES) {
    return submissionResponse(request, { error: 'payload_too_large' }, 413);
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return submissionResponse(request, { error: 'payload_too_large' }, 413);
  }

  const parsed = parseChurchInterest(new URLSearchParams(raw));
  if (!parsed.ok) {
    return submissionResponse(request, { error: parsed.error, field: parsed.field }, 400);
  }

  // A honeypot hit is answered exactly like a success and stored nowhere.
  if (parsed.record === null) {
    return submissionResponse(request, { ok: true }, 200);
  }

  if (!env.DB) {
    // Better a visible error than a form that swallows what someone typed.
    return submissionResponse(request, { error: 'not_configured' }, 503);
  }

  const r = parsed.record;
  try {
    await env.DB.prepare(
      `INSERT INTO church_interest (
         id, created_at, name, email, role, role_other, interests,
         church_name, church_city, church_state, church_country,
         church_country_other, church_denomination, hmc_church_id, hmc_short_id
       ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)`
    )
      .bind(
        crypto.randomUUID(),
        new Date().toISOString(),
        r.name,
        r.email,
        r.role,
        r.roleOther,
        r.interests,
        r.churchName,
        r.churchCity,
        r.churchState,
        r.churchCountry,
        r.churchCountryOther,
        r.churchDenomination,
        r.hmcChurchId,
        r.hmcShortId
      )
      .run();
  } catch {
    return submissionResponse(request, { error: 'storage_failed' }, 500);
  }

  return submissionResponse(request, { ok: true }, 200);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);

    // Only POST is intercepted here; a GET is the page itself, below.
    if (request.method === 'POST' && isChurchInterest(pathname)) {
      return handleChurchInterest(request, env);
    }

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
