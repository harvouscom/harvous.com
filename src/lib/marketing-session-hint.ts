/** Must match spa/src/utils/marketing-session-hint.ts — parent-domain cookie from the app. */
export const HV_SIGNED_IN_COOKIE = "hv_signed_in";

export function hasMarketingSessionHint(): boolean {
  if (typeof document === "undefined") return false;
  return new RegExp(`(?:^|;\\s*)${HV_SIGNED_IN_COOKIE}=1(?:;|$)`).test(document.cookie);
}
