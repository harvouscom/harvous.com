# Content Agent Context (harvous.com)

## Last Updated
2026-07-28

## Owned files (this repo)

- `src/content/features/**` — feature detail MDX
- `src/content/faq/**` — FAQ MDX
- `src/content/testimonials/**` — testimonials MDX
- `src/content.config.ts` — collection schemas (coordinate before schema changes)
- `.cursor/skills/content-agent/CONTENT_WRITING_GUIDE.md` — thread/note study-copy patterns
- `docs/BRAND_VOICE.md` — brand voice

## Not owned here

App UI cards, inbox, TipTap note panels, dashboard/space pages — **`../harvous`**. Open that workspace for component work. App `content.context.md` remains source of truth for those invariants.

## Invariants

- Follow `docs/BRAND_VOICE.md` + CONTENT_WRITING_GUIDE for study-oriented copy
- Respect collection schemas; don’t invent frontmatter fields
- Stage-honest: don’t mark unshipped product as live
- Blog destination strategy belongs to **marketing-agent** (`.claude/agents/marketing.blog-strategy.md`)

## Known gotchas

- Blog thumbs come from `npm run blog:thumbs` (marketing/shipping concern)
- Product page related-blog strips use category affinity in `src/lib/blog.ts` — don’t hardcode per-page slug lists when shipping posts
- Writing guide historically pointed at app-repo `docs/BRAND_VOICE.md`; in this workspace use `docs/BRAND_VOICE.md` at repo root
- Homepage What’s Included grid is hardcoded in `src/components/WhatsIncluded.astro` (keep at 12). Dual-icon cells: Sorts itself & Pin; Sharing & Shared spaces. Note templates is its own cell → `/features/note-templates/`

## Current state

- Content-agent skill added to harvous.com workspace 2026-07-25 for site MDX + writing guide
- App UI specialist still lives in harvous `.claude/skills/content-agent/`
- 2026-07-28: Added `note-templates` feature MDX + grid cell (`fa6-solid:list-check`); merged Pin into Sorts itself to keep grid at 12
