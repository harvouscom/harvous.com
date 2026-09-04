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

type R2Object = {
  size: number;
  httpEtag: string;
  /** Present only for a ranged read. */
  range?: { offset: number; length: number };
  /**
   * Absent when the request was conditional and the object had not changed.
   * R2 leaves it undefined rather than null in that case — a `=== null` check
   * silently falls through and answers 200 with an empty body, which a browser
   * caches over its good copy of the video.
   */
  body?: ReadableStream | null;
  writeHttpMetadata(headers: Headers): void;
};
type R2Bucket = {
  get(
    key: string,
    options?: { range?: Headers; onlyIf?: Headers }
  ): Promise<R2Object | null>;
};

type Env = {
  /** Static assets binding — `dist/`, with `_redirects` and `_headers` applied. */
  ASSETS: { fetch(request: Request): Promise<Response> };
  /** Church interest submissions. See cloudflare/migrations/. */
  DB?: D1Database;
  /** Video, served from R2 rather than static assets — see serveMedia. */
  MEDIA?: R2Bucket;
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

/**
 * Video served out of R2 instead of static assets.
 *
 * Workers static assets sets `Accept-Ranges` on nothing and answers every
 * Range request with the whole file — measured against this Worker's own
 * staging deploy, and against Netlify, which returns a proper 206. The effect
 * in a browser is not subtle: `video.seekable` comes back empty and a seek
 * lands nowhere, so a viewer cannot skip ahead in the five-minute tour until
 * the file has streamed that far on its own.
 *
 * R2 does ranged reads, so the fix is to serve these two files from a bucket
 * and pass the Range header through. The URLs are unchanged — the components
 * still link `/touring-harvous-short.mp4`.
 *
 * The files are ALSO in public/, and so in dist/, which looks redundant and is:
 * that copy exists only for Netlify, which serves them as ordinary files (with
 * its own byte-range support) for as long as it is the rollback. Cloudflare
 * never reads it, because `run_worker_first` names these paths and runs ahead
 * of the asset router. After the DNS cutover the copy in public/ should go.
 */
const MEDIA_KEYS = new Set(['touring-harvous-short.mp4', 'harvous-3-walkthrough.mp4']);

function mediaKey(pathname: string): string | null {
  const key = pathname.slice(1);
  return MEDIA_KEYS.has(key) ? key : null;
}

async function serveMedia(request: Request, env: Env, key: string): Promise<Response> {
  if (!env.MEDIA) {
    return new Response('Media bucket not configured', { status: 503 });
  }

  // R2 parses Range and If-None-Match/If-Modified-Since off the headers itself,
  // but `range` is only passed when the request actually carried one: handed
  // the headers unconditionally it reports a range for a plain GET too, and
  // the response comes back 206 for a request that asked for the whole file.
  const rangeHeader = request.headers.get('range');

  let object: R2Object | null;
  try {
    object = await env.MEDIA.get(key, {
      ...(rangeHeader ? { range: request.headers } : {}),
      onlyIf: request.headers,
    });
  } catch {
    // R2 throws, rather than returning a status, on two kinds of input we do
    // not control: a malformed If-None-Match, and a range starting past the end
    // of the object. Both answered 500 until this existed. Re-read plainly to
    // learn the size, then say something true about which it was.
    object = await env.MEDIA.get(key).catch(() => null);
    if (object === null) return new Response('Not Found', { status: 404 });

    const start = Number(/^bytes=(\d+)-/.exec(rangeHeader ?? '')?.[1] ?? NaN);
    if (Number.isFinite(start) && start >= object.size) {
      return new Response(null, {
        status: 416,
        headers: { 'content-range': `bytes */${object.size}`, 'accept-ranges': 'bytes' },
      });
    }
    // Otherwise the conditional header was the bad part — serve the whole file.
  }

  if (object === null) {
    return new Response('Not Found', { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  // The whole point of the move.
  headers.set('accept-ranges', 'bytes');
  // Matches what Netlify sends today. These filenames are not content-hashed,
  // so a re-render replaces the file at the same URL — revalidation, not a
  // long max-age, is what keeps that honest.
  headers.set('cache-control', 'public, max-age=0, must-revalidate');

  // A conditional request that matched: nothing to send.
  if (!object.body) {
    return new Response(null, { status: 304, headers });
  }

  if (rangeHeader && object.range) {
    const start = object.range.offset;
    const end = start + object.range.length - 1;
    headers.set('content-range', `bytes ${start}-${end}/${object.size}`);
    headers.set('content-length', String(object.range.length));
    return new Response(object.body, { status: 206, headers });
  }

  headers.set('content-length', String(object.size));
  return new Response(object.body, { status: 200, headers });
}

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

    const media = mediaKey(pathname);
    if (media) {
      return serveMedia(request, env, media);
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
