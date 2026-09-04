/**
 * Netlify entry for the church directory typeahead.
 *
 * A shim, not an implementation — the logic is in src/lib/church-search.ts,
 * shared with cloudflare/worker.ts so the two hosts cannot drift while both
 * are live. This copy exists only for the Netlify rollback path during the
 * Cloudflare soak, and is deleted at cleanup.
 */
import { handleChurchSearch } from '../../src/lib/church-search.ts';

export default async (req: Request): Promise<Response> =>
  handleChurchSearch(req, process.env as Record<string, string | undefined>);
