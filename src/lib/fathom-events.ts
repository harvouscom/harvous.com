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
  useCaseDetail: (slug: string) => `signup_use_case_${slug}`,
  compareDetail: (slug: string) => `signup_compare_${slug}`,
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
} as const;
