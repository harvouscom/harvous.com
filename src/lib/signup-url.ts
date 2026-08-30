/**
 * The app's origin.
 *
 * Overridable so the handoff can be walked end to end against a local app — the one flow on
 * this site whose whole point is what happens *after* the click, and so the one that cannot be
 * checked by looking at this page alone. Unset (every real build) it is production.
 */
const APP_ORIGIN = import.meta.env.PUBLIC_APP_ORIGIN ?? "https://app.harvous.com";

/** App signup base URL for marketing CTAs. */
export const APP_SIGN_UP_URL = "https://app.harvous.com/sign-up";

/**
 * Where "Try it free" goes: straight into the app, reading today's passage, no account.
 *
 * `/read/today` rather than a chapter, because this is a static build — it cannot know what
 * today's passage is, and a link baked at deploy time would be stale by morning. The app
 * resolves it. `?try=1` is what turns the arrival into a guest visit; the app's pre-bundle boot
 * script reads it before React loads, so the shell paints without a redirect through sign-in.
 */
export const APP_TRY_URL = `${APP_ORIGIN}/read/today?try=1`;

export type SignupAttributionParams = {
  /** Audience page slug, e.g. `daily-readers`. */
  audience?: string;
  /** Use-case page slug, e.g. `daily-journal`. */
  useCase?: string;
  /** Optional hub/page source, e.g. `for_hub`. */
  source?: string;
};

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Keep only simple kebab-case slugs so query junk is not forwarded. */
export function sanitizeSignupSlug(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim().toLowerCase();
  return SLUG_RE.test(trimmed) ? trimmed : undefined;
}

/**
 * Build an app sign-up URL with optional marketing attribution query params.
 * Preserves a bare `/sign-up` when nothing is set.
 */
export function buildSignupUrl(params: SignupAttributionParams = {}): string {
  const url = new URL(APP_SIGN_UP_URL);
  const audience = sanitizeSignupSlug(params.audience);
  const useCase = sanitizeSignupSlug(params.useCase);
  const source = sanitizeSignupSlug(params.source);
  if (audience) url.searchParams.set("audience", audience);
  if (useCase) url.searchParams.set("use_case", useCase);
  if (source) url.searchParams.set("source", source);
  return url.toString();
}

/**
 * The try-it-free URL, carrying the same attribution a signup link would.
 *
 * Shares `sanitizeSignupSlug` with `buildSignupUrl` on purpose: a guest who converts three
 * screens later should be attributable to the page that sent them, and the app already parks
 * these params in a cookie so they survive Clerk's multi-step signup.
 */
export function buildTryUrl(params: SignupAttributionParams = {}): string {
  const url = new URL(APP_TRY_URL);
  const audience = sanitizeSignupSlug(params.audience);
  const useCase = sanitizeSignupSlug(params.useCase);
  const source = sanitizeSignupSlug(params.source);
  if (audience) url.searchParams.set("audience", audience);
  if (useCase) url.searchParams.set("use_case", useCase);
  if (source) url.searchParams.set("source", source);
  return url.toString();
}
