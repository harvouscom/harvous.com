/**
 * Fathom custom event names for the marketing site (siteID UOIPAZGI).
 * Click tracking is wired in BaseLayout via [data-fathom-track].
 */
export const fathomSignup = {
  header: "signup_header",
  /** Homepage hero — legacy name kept for dashboard continuity. */
  hero: "signup_nav",
  last: "signup_last",
  features: "signup_features",
  included: "signup_included",
  about: "signup_about",
  useCasesHub: "signup_use_cases",
  compareHub: "signup_compare",
  pricing: "signup_pricing",
  /** Pricing page — Harvous Plus upgrade CTA. */
  pricingPlus: "signup_pricing_plus",
  useCaseDetail: (slug: string) => `signup_use_case_${slug}`,
  forHub: "signup_for",
  forDetail: (slug: string) => `signup_for_${slug}`,
  compareDetail: (slug: string) => `signup_compare_${slug}`,
  featureDetail: (slug: string) => `signup_feature_${slug}`,
  addonDetail: (slug: string) => `signup_addon_${slug}`,
  /** The /3/ release page — returning users opening the app, not new sign-ups. */
  v3: "signup_v3",
} as const;

/**
 * "Try it free" — going into the app as a guest, which is a different intent from signing up
 * and so a different event. Deliberately not folded into `fathomSignup`: those names go back
 * years on the dashboard, and repointing one at a new CTA would silently break every
 * before-and-after comparison drawn against it.
 */
export const fathomTry = {
  hero: "try_hero",
  header: "try_header",
  last: "try_last",
  included: "try_included",
  about: "try_about",
  useCasesHub: "try_use_cases",
  compareHub: "try_compare",
  features: "try_features",
  forHub: "try_for",
  useCaseDetail: (slug: string) => `try_use_case_${slug}`,
  forDetail: (slug: string) => `try_for_${slug}`,
  compareDetail: (slug: string) => `try_compare_${slug}`,
  featureDetail: (slug: string) => `try_feature_${slug}`,
} as const;

export const fathomSignin = {
  header: "signin_header",
} as const;

export const fathomCompare = {
  homeCard: "compare_home_card",
  homeAll: "compare_home_all",
  hubCard: "compare_hub_card",
  detailRelated: "compare_detail_related",
} as const;

export const fathomCta = {
  featuresAnchor: "cta_features",
  faqAnchor: "cta_faq",
  videoTour: "video_tour_click",
} as const;
