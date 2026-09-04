/**
 * Church interest submissions — parsing and validation.
 *
 * Runtime-neutral, like src/lib/church-search.ts: the Worker calls this, and
 * anything else that needs to understand a submission can too.
 *
 * The form (src/components/ChurchInterestForm.astro) posts urlencoded to
 * `/for/churches/` — its own page. That is Netlify Forms' convention, and
 * keeping it means the markup and the client script are identical on both
 * hosts: Netlify scrapes and stores it as it always has, and the Cloudflare
 * Worker intercepts the POST before the asset router can answer it with the
 * page. Nothing about the browser's side of this changed in the migration.
 *
 * @see cloudflare/worker.ts — the POST branch
 * @see cloudflare/migrations/0001_church_interest.sql — the table this fills
 */

import { HMC_COUNTRY_CODES } from './hmc-directory.ts';

/** Mirrors the `role` select. */
const ROLES = new Set(['pastor', 'staff', 'group-leader', 'teacher', 'other']);

/** Mirrors the `interests` checkboxes. */
const INTERESTS = new Set([
  'shared-spaces',
  'church-org-curriculum',
  'chms-integrations',
  'getting-set-up',
]);

/** Generous, but bounded — a real submission is nowhere near these. */
const LIMITS = {
  name: 200,
  email: 320,
  churchName: 200,
  churchCity: 120,
  churchState: 100,
  churchCountryOther: 100,
  churchDenomination: 120,
  roleOther: 120,
  hmcId: 64,
} as const;

export type ChurchInterestRecord = {
  name: string;
  email: string;
  role: string;
  roleOther: string | null;
  /** Comma-separated, each value from INTERESTS. */
  interests: string;
  churchName: string;
  churchCity: string | null;
  churchState: string | null;
  churchCountry: string;
  churchCountryOther: string | null;
  churchDenomination: string | null;
  hmcChurchId: string | null;
  hmcShortId: string | null;
};

export type ParseResult =
  | { ok: true; record: ChurchInterestRecord }
  /**
   * A honeypot hit. The caller should answer as though it succeeded and store
   * nothing — telling a bot it was spotted only teaches it to try again.
   */
  | { ok: true; record: null; spam: true }
  | { ok: false; error: string; field?: string };

function str(form: URLSearchParams, key: string): string {
  return (form.get(key) ?? '').trim();
}

/** Optional field: empty becomes null, and anything over the cap is a rejection. */
function optional(
  form: URLSearchParams,
  key: string,
  max: number
): { ok: true; value: string | null } | { ok: false } {
  const value = str(form, key);
  if (!value) return { ok: true, value: null };
  if (value.length > max) return { ok: false };
  return { ok: true, value };
}

/**
 * Deliberately loose. The point is to catch a typo or a junk value, not to
 * adjudicate RFC 5322 — the address gets confirmed by someone replying to it.
 */
function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(value);
}

export function parseChurchInterest(form: URLSearchParams): ParseResult {
  // The honeypot is hidden from people and irresistible to bots.
  if (str(form, 'bot-field')) return { ok: true, record: null, spam: true };

  const name = str(form, 'name');
  if (!name) return { ok: false, error: 'missing_name', field: 'name' };
  if (name.length > LIMITS.name) return { ok: false, error: 'name_too_long', field: 'name' };

  const email = str(form, 'email');
  if (!email) return { ok: false, error: 'missing_email', field: 'email' };
  if (email.length > LIMITS.email || !looksLikeEmail(email)) {
    return { ok: false, error: 'invalid_email', field: 'email' };
  }

  const role = str(form, 'role');
  if (!ROLES.has(role)) return { ok: false, error: 'invalid_role', field: 'role' };

  // At least one, and nothing the form does not offer.
  const interests = form.getAll('interests').map((v) => v.trim()).filter(Boolean);
  if (interests.length === 0) return { ok: false, error: 'missing_interests', field: 'interests' };
  if (interests.some((v) => !INTERESTS.has(v))) {
    return { ok: false, error: 'invalid_interests', field: 'interests' };
  }

  const churchName = str(form, 'churchName');
  if (!churchName) return { ok: false, error: 'missing_church_name', field: 'churchName' };
  if (churchName.length > LIMITS.churchName) {
    return { ok: false, error: 'church_name_too_long', field: 'churchName' };
  }

  // "other" is a real option in the country select — the form asks for the name
  // in a free-text field when it is chosen.
  const churchCountry = str(form, 'churchCountry').toUpperCase();
  const isOther = churchCountry === 'OTHER';
  if (!isOther && !HMC_COUNTRY_CODES.has(churchCountry)) {
    return { ok: false, error: 'invalid_country', field: 'churchCountry' };
  }

  const roleOther = optional(form, 'roleOther', LIMITS.roleOther);
  const churchCity = optional(form, 'churchCity', LIMITS.churchCity);
  const churchState = optional(form, 'churchState', LIMITS.churchState);
  const churchCountryOther = optional(form, 'churchCountryOther', LIMITS.churchCountryOther);
  const churchDenomination = optional(form, 'churchDenomination', LIMITS.churchDenomination);
  const hmcChurchId = optional(form, 'hmcChurchId', LIMITS.hmcId);
  const hmcShortId = optional(form, 'hmcShortId', LIMITS.hmcId);

  for (const [field, result] of [
    ['roleOther', roleOther],
    ['churchCity', churchCity],
    ['churchState', churchState],
    ['churchCountryOther', churchCountryOther],
    ['churchDenomination', churchDenomination],
    ['hmcChurchId', hmcChurchId],
    ['hmcShortId', hmcShortId],
  ] as const) {
    if (!result.ok) return { ok: false, error: 'field_too_long', field };
  }

  return {
    ok: true,
    record: {
      name,
      email,
      role,
      roleOther: roleOther.ok ? roleOther.value : null,
      interests: interests.join(','),
      churchName,
      churchCity: churchCity.ok ? churchCity.value : null,
      churchState: churchState.ok ? churchState.value : null,
      churchCountry,
      churchCountryOther: churchCountryOther.ok ? churchCountryOther.value : null,
      churchDenomination: churchDenomination.ok ? churchDenomination.value : null,
      hmcChurchId: hmcChurchId.ok ? hmcChurchId.value : null,
      hmcShortId: hmcShortId.ok ? hmcShortId.value : null,
    },
  };
}
