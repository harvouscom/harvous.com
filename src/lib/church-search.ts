/**
 * Church directory search — proxies Here's My Church so the church interest
 * form (src/components/ChurchInterestForm.astro) can offer a real typeahead
 * without shipping the partner key to the browser.
 *
 * Runtime-neutral: the logic lives here and cloudflare/worker.ts is a thin
 * entry point that supplies config from its `env` binding. It was shared with a
 * Netlify function until that host was retired, which is why the split exists —
 * and it is worth keeping, since nothing here needs a runtime to be tested.
 *
 * Two upstream HMC surfaces, chosen by whether a region is given:
 *  - No `state`: the open site search (`/churches/search?q&country&limit`),
 *    anon key only, sweeps every populated region in the country. No partner
 *    contract, but it's the only way to search a whole country in one call.
 *  - `state` given: the partner `/v1/churches/search?q&state&limit` route
 *    (stable lean contract, x-partner-key required, 120 req/min).
 *
 * @see harvous/server/utils/hmc-partner.ts — same client, app-side
 * @see heresmychurch/docs/future/public-api.md
 */
import {
  HMC_COUNTRY_CODES,
  getHmcRegionsForCountry,
  normalizeHmcRegionCode,
} from './hmc-directory.ts';

type HmcResultRow = {
  id: string;
  shortId: string;
  name: string;
  city: string;
  state: string;
  country: string;
  address?: string | null;
  denomination?: string | null;
  locationLabel: string;
};

type HmcConfig = {
  /** Partner base URL, ends in /v1. */
  baseUrl: string;
  /** Edge-function root (partner base without the trailing /v1). */
  edgeRoot: string;
  anonKey: string;
  partnerKey: string;
};

/** The three secrets, however the host hands them over. */
export type ChurchSearchEnv = Record<string, string | undefined>;

function readConfig(env: ChurchSearchEnv): HmcConfig | null {
  const baseUrl = (env.HERESMYCHURCH_API_BASE ?? '').trim().replace(/\/$/, '');
  const anonKey = (env.HERESMYCHURCH_ANON_KEY ?? '').trim();
  const partnerKey = (env.HERESMYCHURCH_PARTNER_API_KEY ?? '').trim();
  if (!baseUrl || !anonKey || !partnerKey) return null;
  return { baseUrl, edgeRoot: baseUrl.replace(/\/v1$/i, ''), anonKey, partnerKey };
}

function json(body: unknown, init?: { status?: number; cache?: boolean }): Response {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  headers['Cache-Control'] = init?.cache ? 'public, max-age=30' : 'no-store';
  return new Response(JSON.stringify(body), { status: init?.status ?? 200, headers });
}

function regionLabel(country: string, state: string): string {
  const region = getHmcRegionsForCountry(country).find((r) => r.code === state);
  return region?.label ?? state;
}

function buildLocationLabel(row: { city?: string | null; state: string; country: string }): string {
  const label = regionLabel(row.country, row.state);
  return row.city?.trim() ? `${row.city.trim()}, ${label}` : label;
}

function normalizeRow(raw: unknown, country: string): HmcResultRow | null {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  const id = typeof row.id === 'string' ? row.id.trim() : '';
  const name = typeof row.name === 'string' ? row.name.trim() : '';
  const state = typeof row.state === 'string' ? row.state.trim().toUpperCase() : '';
  if (!id || !name || !state) return null;
  const city = typeof row.city === 'string' ? row.city.trim() : '';
  const base = {
    id,
    shortId: typeof row.shortId === 'string' ? row.shortId : '',
    name,
    city,
    state,
    country,
    address: typeof row.address === 'string' ? row.address : null,
    denomination: typeof row.denomination === 'string' ? row.denomination : null,
  };
  const locationLabel =
    typeof row.locationLabel === 'string' && row.locationLabel.trim()
      ? row.locationLabel.trim()
      : buildLocationLabel(base);
  return { ...base, locationLabel };
}

export async function handleChurchSearch(req: Request, env: ChurchSearchEnv): Promise<Response> {
  if (req.method !== 'GET') {
    return json({ error: 'method_not_allowed' }, { status: 405 });
  }

  const config = readConfig(env);
  if (!config) {
    return json({ error: 'not_configured', results: [] }, { status: 503 });
  }

  const url = new URL(req.url);
  const q = (url.searchParams.get('q') ?? '').trim();
  const country = (url.searchParams.get('country') ?? '').trim().toUpperCase();
  const stateRaw = (url.searchParams.get('state') ?? '').trim();
  const limitRaw = Number.parseInt(url.searchParams.get('limit') ?? '8', 10);
  const limit = Math.min(12, Math.max(1, Number.isFinite(limitRaw) ? limitRaw : 8));

  if (!country || !HMC_COUNTRY_CODES.has(country)) {
    return json({ error: 'invalid_country', results: [] }, { status: 400 });
  }

  let state: string | null = null;
  if (stateRaw) {
    const normalized = normalizeHmcRegionCode(stateRaw);
    const belongsToCountry =
      normalized != null && getHmcRegionsForCountry(country).some((r) => r.code === normalized);
    if (!belongsToCountry) {
      return json({ error: 'invalid_state', results: [] }, { status: 400 });
    }
    state = normalized;
  }

  // Below HMC's own 2-char minimum — skip the upstream call entirely.
  if (q.length < 2 || q.length > 100) {
    return json({ results: [] }, { cache: true });
  }

  const upstreamUrl = state
    ? `${config.baseUrl}/churches/search?${new URLSearchParams({ q, state, limit: String(limit) })}`
    : `${config.edgeRoot}/churches/search?${new URLSearchParams({ q, country, limit: String(limit) })}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${config.anonKey}`,
    apikey: config.anonKey,
    Accept: 'application/json',
  };
  if (state) headers['x-partner-key'] = config.partnerKey;

  let response: Response;
  try {
    response = await fetch(upstreamUrl, { headers });
  } catch {
    return json({ error: 'unavailable', results: [] }, { status: 502 });
  }

  if (response.status === 429) {
    return json({ error: 'rate_limited', results: [] }, { status: 429 });
  }
  if (!response.ok) {
    return json({ error: 'unavailable', results: [] }, { status: 502 });
  }

  const body = (await response.json().catch(() => ({}))) as { results?: unknown[] };
  const results = (body.results ?? [])
    .map((row) => normalizeRow(row, country))
    .filter((row): row is HmcResultRow => row != null)
    .slice(0, limit);

  return json({ results }, { cache: true });
}
