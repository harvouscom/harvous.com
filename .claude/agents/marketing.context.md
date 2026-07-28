# Marketing Agent Context (harvous.com)

## Last Updated
2026-07-28

## Owned files (this repo)

- `src/content/blog/**` — Bright Enough MDX posts
- `.claude/agents/marketing.blog-strategy.md` — church-education editorial strategy
- `src/lib/blog.ts` — authors, category→product affinity, thumb helpers (coordinate carefully)
- `src/lib/addons-data.ts`, `for-audiences-data.ts`, `use-cases-data.ts`, `pricing-data.ts` — product/marketing page copy
- `src/content/faq/**` — FAQ MDX
- `docs/BRAND_VOICE.md` — brand voice (copied for this workspace)
- `scripts/generate-blog-thumbs.mjs` / `npm run blog:thumbs` — shader thumbs

## Sibling app repo (not owned here)

Changelog, release notes, admin API featured cards, and `docs/notes-from-harvous/` publish live in **`../harvous`**. Do not invent those paths in this repo. Open the app workspace for those tasks.

## Knowledge memory (blog / editorial)

Full strategy: **`.claude/agents/marketing.blog-strategy.md`**

Quick recall:

- **Name:** **Bright Enough** (`/blog/` — light + knowledge that sticks)
- **Hero lead:** Notes, habits, and teaching that show up after Sunday
- **H2s:** ≤33 characters each
- **Marks:** 2–5 sparse `<mark>` phrases per post
- **Sources:** 0–3 durable cites; inline + GFM footnotes
- **North star:** Working library for church educators — how learning sticks
- **Pillars:** teaching · retention · equipping · how-we-think (+ thin `using-harvous`)
- **Shared Spaces:** live (Plus hosting, join free). Church org / curriculum: roadmap
- TipTap `editor-agent` / app `content-agent` UI ownership is unrelated — blog editorial is **marketing-agent**

## Invariants

- Follow `marketing.blog-strategy.md` — no quiet-time SEO / Crosswalk-swap posts
- Soft CTAs; stage-honest product claims
- Bright Enough `##` ≤ 33 characters
- Plain voice over clever packaging
- Never claim church org curriculum as shipped

## Current state

- Shared Spaces batch shipped 2026-07-25: `keep-what-the-group-finds`, `host-a-space-for-your-group`, `when-co-leaders-share-a-trail`
- How we think field note shipped 2026-07-26: `remembering-is-the-point` (notes ≠ goal; own study Bible; today + church-education direction)
- 24 blog posts total; thumbs via `npm run blog:thumbs`
- Feature tour: Remotion project in `video/` renders `public/touring-harvous-short.mp4` (~5 min); chronological cut with folders/search/share; Google Sans labels; Plyr lightbox CTA “Watch the tour”
