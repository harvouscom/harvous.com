/**
 * Fathom custom event names for the marketing site (siteID UOIPAZGI).
 * Click tracking is wired in BaseLayout via [data-fathom-track]; the full
 * registry (what fires where, and which names are retired) is docs/FATHOM_EVENTS.md.
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
  /** The /next/ redesign — its own names so the draft never muddies live numbers. */
  nextHero: "try_next_hero",
  nextSticky: "try_next_sticky",
  nextClosing: "try_next_closing",
  /**
   * The sticky pill and the closing card sit on every page, so one name for each
   * says "someone tried it" but not from where. Off the home page they report
   * their section (`try_sticky_compare`, `try_closing_blog`, …); the home page
   * keeps the original names so the history stays continuous.
   */
  sticky: (path: string) => (fathomSection(path) === "home" ? "try_next_sticky" : `try_sticky_${fathomSection(path)}`),
  closing: (path: string) => (fathomSection(path) === "home" ? "try_next_closing" : `try_closing_${fathomSection(path)}`),
} as const;

/**
 * The first path segment of a URL, as a short slug: `/compare/abide/` → "compare",
 * `/` → "home". Keeps per-section event names to a few dozen, never one per page.
 */
export function fathomSection(path: string): string {
  const segment = path.split("?")[0].split("#")[0].split("/").filter(Boolean)[0];
  return segment ? segment.toLowerCase().replace(/[^a-z0-9]+/g, "_") : "home";
}

export const fathomSignin = {
  header: "signin_header",
} as const;

export const fathomCompare = {
  homeCard: "compare_home_card",
  homeAll: "compare_home_all",
  hubCard: "compare_hub_card",
  detailRelated: "compare_detail_related",
} as const;

/**
 * Discover, whose CTAs went untracked while every other one on the site carried
 * an event.
 *
 * Three intents, not one: taking a listing into your own account, leaving for
 * the publisher a curated reference belongs to, and going to read how note
 * templates work. Folding the middle one into `fathomSignup` would count a
 * click on somebody else's video as interest in signing up.
 */
export const fathomDiscover = {
  install: (slug: string) => `discover_install_${slug}`,
  sourceOut: (slug: string) => `discover_source_${slug}`,
  makeYourOwn: "discover_make_your_own",
} as const;

/** Blog: the home page's Bright Enough strip, and the library itself. */
export const fathomBlog = {
  homeAll: "blog_home_all",
  homePost: "blog_home_post",
  postRelated: "blog_post_related",
  search: "blog_search",
} as const;

/** Home-page links that lead deeper into the site rather than into the app. */
export const fathomHome = {
  tour: "home_tour",
  useCases: "home_use_cases",
  about: "home_about",
  now: "home_now",
  email: "home_email",
} as const;

/**
 * Fallbacks applied by BaseLayout to any link that carries no event of its own,
 * so a new CTA is counted from day one. A link's own `data-fathom-track` always
 * wins; these never double-fire.
 */
export const fathomFallback = {
  email: "contact_email",
  app: "app_open",
  outbound: "outbound_click",
} as const;

export const fathomCta = {
  featuresAnchor: "cta_features",
  faqAnchor: "cta_faq",
  videoTour: "video_tour_click",
  /** Homepage hero — the small "Harvous 3 is here" callout linking to /3/. */
  v3Announce: "cta_v3_announce",
} as const;
