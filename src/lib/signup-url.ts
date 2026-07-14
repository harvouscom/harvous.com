/** App signup base URL for marketing CTAs. */
export const APP_SIGN_UP_URL = "https://app.harvous.com/sign-up";

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
