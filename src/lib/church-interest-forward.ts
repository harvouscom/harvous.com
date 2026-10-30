/**
 * "Someone filled in the church form" — handed on to Harvous's own request queue.
 *
 * The Worker saves the submission to D1 and emails Derek, as it always has; this then forwards a
 * copy to the app (`POST /api/church-applications/intake`), where it shows up in /admin/churches
 * under Requests as "From harvous.com · No account yet". When that person later signs in to
 * Harvous with the same email, the request becomes theirs and can be approved.
 *
 * Best-effort by design, like the email: it runs in `waitUntil` after the row is committed, so a
 * slow or failing app never turns a saved submission into an error the visitor sees. D1 stays the
 * record of what was sent.
 *
 * Server to server: authenticated by a shared secret (HARVOUS_INTAKE_SECRET here, the same value
 * as the app's HARVOUS_SITE_INTAKE_SECRET). Unset = no forwarding, nothing else changes.
 *
 * @see cloudflare/worker.ts — the caller
 * @see src/lib/church-interest.ts — the record this carries
 */

import type { ChurchInterestRecord } from './church-interest.ts';

export type ForwardConfig = {
  url: string;
  secret: string;
};

export function readForwardConfig(env: Record<string, string | undefined>): ForwardConfig | null {
  const url = (env.HARVOUS_INTAKE_URL ?? '').trim();
  const secret = (env.HARVOUS_INTAKE_SECRET ?? '').trim();
  if (!url || !secret) return null;
  return { url, secret };
}

/** What the app reads (server/utils/church-applications.ts `cleanSiteIntake`). */
export function forwardPayload(r: ChurchInterestRecord): Record<string, string | null> {
  return {
    name: r.name,
    email: r.email,
    role: r.role,
    roleOther: r.roleOther,
    interests: r.interests,
    churchName: r.churchName,
    churchCity: r.churchCity,
    churchState: r.churchState,
    churchCountry: r.churchCountry,
    churchDenomination: r.churchDenomination,
    hmcChurchId: r.hmcChurchId,
  };
}

const FORWARD_TIMEOUT_MS = 8000;

/** Returns whether the app accepted it; never throws. */
export async function forwardChurchInterest(r: ChurchInterestRecord, config: ForwardConfig): Promise<boolean> {
  try {
    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-harvous-intake-secret': config.secret,
      },
      body: JSON.stringify(forwardPayload(r)),
      signal: AbortSignal.timeout(FORWARD_TIMEOUT_MS),
    });
    if (!response.ok) {
      console.warn('[church-interest] forward to Harvous failed', response.status);
      return false;
    }
    return true;
  } catch (error) {
    console.warn('[church-interest] forward to Harvous failed', error instanceof Error ? error.message : error);
    return false;
  }
}
