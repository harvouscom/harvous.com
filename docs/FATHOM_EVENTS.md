# Fathom events

Site ID `UOIPAZGI`. Every event name lives in `src/lib/fathom-events.ts`. A link sends an event when it carries `data-fathom-track="<name>"`. One delegated click listener at the end of `src/layouts/BaseLayout.astro` sends it.

Events only count clicks. Fathom has no event properties, so a name has to carry its own context: where the click happened and what it was for.

## Rules

- **Don't rename an event that has data.** A renamed event starts again at zero on the dashboard, and every before-and-after comparison breaks. Add a new name instead.
- **Keep sign up and try separate.** `signup_*` means making an account. `try_*` means opening the app as a guest. They are different intents.
- **Use per-slug names only where the slug is the point.** That covers compare, use case, feature, add-on and Discover listing pages. Anything that appears on every page reports its section, which keeps the dashboard to a few dozen rows.

## Live events

### Into the app

| Event | Where |
|---|---|
| `try_next_sticky` / `try_sticky_<section>` | The sticky "Try Harvous free" pill on every page. The home page keeps the original name; other pages use their first path segment: `compare`, `blog`, `discover`, `release_notes`, `features`, `for`, `use_cases`, `pricing`, `about`, `tour`, `now`, … |
| `try_next_closing` / `try_closing_<section>` | The closing card's button. The same split: the home page keeps the original name. |
| `try_compare_<slug>` | Compare detail and guide pages (CTA plus the closing card) |
| `try_feature_<slug>` | Feature category pages |
| `try_use_case_<slug>` | Use case detail pages |
| `signup_pricing` / `signup_pricing_plus` | The Free and Plus buttons on pricing |
| `signup_addon_<slug>` | Add-on pages (upgrade to Plus) |
| `signin_header` | "Sign in" in the nav, on every page |
| `discover_install_<slug>` | "Add to Harvous" on a Discover listing |

### Interest and navigation

| Event | Where |
|---|---|
| `video_tour_click` | The "Watch me walk through it" video on the home hero |
| `home_tour`, `home_use_cases`, `home_about`, `home_now`, `home_email` | The home page's links deeper into the site, plus the email link in the maker note |
| `home_github`, `home_license` | The home page's open source card: "View on GitHub" and "Read the license" |
| `about_github`, `about_license` | The About page's compact open source card: "View on GitHub" and "Read the license" |
| `blog_home_all`, `blog_home_post` | The home page's Bright Enough strip: "Go to the blog", and any of its three posts |
| `blog_post_related` | "Every post in Bright Enough" at the end of a post |
| `blog_search` | Fired once per page view, the first time a real query runs on /blog/search/ |
| `compare_home_all` | "See how Harvous compares" in the compare section, wherever that section appears: home, tour, pricing, add-on, feature, use case and /for/ pages |
| `compare_hub_card` | A card on /compare/ |
| `compare_detail_related` | A related comparison on a compare page |
| `discover_source_<slug>` | Leaving for a curated listing's original publisher |
| `discover_make_your_own` | "Make your own" on template listings |

### Fallbacks (any link with no event of its own)

| Event | When |
|---|---|
| `contact_email` | A `mailto:` link: footer, support, legal pages |
| `app_open` | Any other link to app.harvous.com, e.g. /3/'s "Open Harvous", /for/churches' sign-up, support's settings link |
| `outbound_click` | A link to another site, e.g. a Discover source, the footer's credit, GitHub |

A link with its own `data-fathom-track` never also sends a fallback.

## Defined but not on the site

These names are kept in `fathom-events.ts` because the dashboard still holds their history. Nothing on the redesigned site sends them now, so a flat line after the cutover is expected:

- `signup_header`, `signup_nav`, `signup_last`, `signup_features`, `signup_included`, `signup_about`, `signup_use_cases`, `signup_compare`, `signup_for`, `signup_for_<slug>`, `signup_compare_<slug>`, `signup_feature_<slug>`, `signup_use_case_<slug>`, `signup_v3`
- `try_hero`, `try_header`, `try_last`, `try_included`, `try_about`, `try_use_cases`, `try_compare`, `try_features`, `try_for`, `try_for_<slug>`, `try_next_hero`
- `compare_home_card`: the home compare tiles are pictures now, not links
- `cta_features`, `cta_faq`, `cta_v3_announce`

## Adding one

1. Add the name to the right group in `fathom-events.ts`, with a comment saying where it fires.
2. Put `data-fathom-track={group.name}` on the link or button.
3. Add a row to this file.
