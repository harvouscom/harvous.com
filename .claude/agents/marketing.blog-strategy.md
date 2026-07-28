# Harvous Blog — Church Education Editorial Strategy

## Last Updated
2026-07-25 (Shared Spaces live; three-post Spaces batch)

## Source
Product marketing conversation (harvous.com blog direction). Applies whenever marketing-agent drafts, plans, or reviews **harvous.com** blog posts (`src/content/blog/` in this repo).

## Name & surface copy

**Title:** **Bright Enough** (eyebrow still: “The Harvous Blog”)

**Meaning:** *Bright* = light (the glow/shader thumbs) **and** clarity / knowledge that sticks — not flashy inspiration.

**Hero lead (live on `/blog/`):**

> Notes, habits, and teaching that show up after Sunday.

**Do not** revive “Outside the Margins” as the blog name.

**Visual system:** Blog thumbs are atmospheric shaders derived only from `public/images/auth-hero/*` (same pool as use-case / audience cards) — prefer lighter sources; darker only for fade/loss/retention mood. Regenerate with `npm run blog:thumbs` in this repo. No app screenshots, no plain photo crops.

## North star

**Position:** The working library for church educators — teachers, group leaders, pastors who teach, seminary students — focused on **how learning sticks**, not how to have a quiet time.

**Promise:** Come here when preparing to teach, designing a series, or trying to stop good teaching from evaporating by Tuesday.

**Non-promise:** Do not compete with Desiring God, RightNow Media, or Planning Center’s blog. Stay notes-first, practice-first, tool-honest.

**Blog one-liner:**

> Bright Enough — light for the room, and clear enough to keep. How the church teaches, and how learning lasts.

## Product context (do not contradict)

- Harvous is a **notes-first Bible study app** — not a Bible reader, not sermon transcription.
- Longer thesis: **“Education for the church.”** A tool for education. Never a substitute for the body.
- Voice pillars: *Humans help humans. Tools only help.* / *The search is yours* / *Keep your Bible app — add a notes hub.*
- Site audiences already aligned: `/for/teachers/`, `/for/group-leaders/`, `/for/churches/`, `/for/seminary-students/` (`src/lib/for-audiences-data.ts`).
- **Product stage honesty:** Personal prep + teaching workflows work today. **Shared Spaces are live** (host with Harvous Plus; joining is free) — soft CTAs to `/add-ons/shared-spaces/` are fine. Church org / curriculum continuity remains roadmap (interest form only). Write **principles first**, product second; never pitch unshipped features as available.

## Content pillars (only these four)

### 1. Teaching craft (core destination pillar)
Lesson prep, series structure, better questions, scripture in class, sermon → study, closing the loop after Sunday.

- Audience: teachers, group leaders, pastors who teach
- Product bridge (today): threads, folders, scripture-linked notes

### 2. Retention & memory (unfair angle)
Why insights fade, notes that compound, recall habits, “study Bible one note at a time,” Monday follow-through.

- Audience: everyone, framed for educators first
- Product bridge: highlights, recall, daily passage

### 3. Equipping (stage-honest)
Curriculum continuity, shared spaces for classes, org-level learning without becoming a ChMS, tools help / humans teach.

- Audience: churches, staff, pastors
- Category: `equipping` (label: **Equipping**)
- Product bridge: Shared Spaces (live — Plus hosting, join free) + church interest for org/curriculum — **principles first**; never vaporware for what isn’t shipped

### 4. How we think (trust + personality)
Beliefs under the product — theology of tools, why not AI-that-studies-for-you, Proverbs 25:2 / “the search is yours.”

- Category: `how-we-think` (label: **How we think**)

## Editorial POV (every post should reinforce at least one)

1. Humans teach humans. Tools only help.
2. Learning that isn’t kept isn’t learning.
3. Keep your Bible app / reader — add a place for study to live.
4. Education for the church ≠ replacing the gathered body.

## Audience priority (blog identity)

1. Teachers (Sunday school, class, small group) — highest fit
2. Group leaders
3. Pastors who teach (series, sermon → study)
4. Seminary / serious students
5. Daily readers — welcome, but not the hero of blog identity

## Deliberately avoid

- Generic “5 tips for quiet time” SEO bait
- Competing with sermon archives or commentary sites
- Overclaiming church org / curriculum features still coming soon (Shared Spaces are live — don’t bury that, and don’t invent org features)
- AI devotionals / “let the app do the searching”
- Card-heavy “resource hub” tone like generic ministry SaaS blogs
- Posts that could live on Crosswalk with the Harvous logo swapped out

## Formats that build a destination

| Cadence | Format | Role |
|---|---|---|
| Weekly or biweekly | Practice essays (800–1500 words) | Authority |
| Monthly | Series playbook (e.g. teaching through a book) | Bookmarkability |
| Occasional | Templates (lesson prep outline, series map, post-Sunday follow-up) | Return utility |
| Rare | Using Harvous posts | Conversion / practice in the app — keep thin |

Win on **reusable frameworks** (“the lesson prep stack,” “the series thread,” “the Monday retention loop”), not one-off inspiration.

## Category direction (harvous.com)

Live category slugs / labels:

- `teaching` — Teaching (craft)
- `retention` — Retention (memory / notes practice)
- `equipping` — Equipping (whole-church continuity / systems, principles-first)
- `how-we-think` — How we think (beliefs, POV, theology of tools)
- `using-harvous` — Using Harvous (thin; practice in the app)
- `study-habits` / `scripture-study` — legacy; prefer educator pillars for new drafts

(Schema lives in harvous.com `src/content.config.ts`.)

## Authors (byline + end close)

Authors live in harvous.com `src/lib/blog.ts` (`BLOG_AUTHORS`). Posts show a light “By …” meta line and a compact `BlogAuthorClose` after the prose.

| `authorId` | Who | When |
|---|---|---|
| `bright-enough` | Bright Enough (house) | **Default** for teaching, retention, equipping, study-habits, scripture-study |
| `derek` | Derek Castelli (team) | **Default** for `how-we-think` and `using-harvous`; also any post with `authorId: derek` |
| *(new team id)* | Future teammates | Register in `BLOG_AUTHORS`, then set `authorId` on the post |
| *(guest id)* | Guest contributors | Register once (name, `kind: "guest"`, role, optional avatar/href), set `authorId` on the post |

**Resolution:** `authorId` frontmatter wins; else category default (`how-we-think` / `using-harvous` → derek; otherwise Bright Enough). Guests always need an explicit `authorId`. Do not attribute house-voice teaching/retention essays to Derek unless intentional.

## Product-page affinity (auto embeds)

`/for/*`, `/use-cases/*`, and feature detail pages surface a **From Bright Enough** strip via category maps in `src/lib/blog.ts` (`BLOG_CATEGORY_AUDIENCES`, `BLOG_CATEGORY_USE_CASES`, plus feature ids from `BLOG_CATEGORY_FEATURE_IDS`). Newest matching posts win (cap 3). **No per-page slug lists** — pick the right `category` and the post appears.

| Category | Typical product homes |
|---|---|
| `teaching` | teachers, group-leaders, seminary; small-group / sermon-notes / book-study |
| `retention` | teachers, churches, daily-readers; daily-journal; recall |
| `equipping` | churches, group-leaders, teachers; small-group |
| `study-habits` | daily-readers, sunday-note-takers, prayer-journaling |
| `using-harvous` | daily-readers, teachers; threads (via feature bridge) |
| `scripture-study` | going-through-a-book, following-a-theme, seminary; book/topical/deep study |
| `how-we-think` | **none by default** (belief essays stay off product pages unless opted in) |

**Optional frontmatter (exceptions only):**

- `forSlugs` / `useCaseSlugs` — extra (or sole) product homes beyond category
- `featureIds` — closing bridge override; also unions into feature-page embeds
- `hideFromRelated: true` — keep a post out of all product strips

Do **not** edit `for-audiences-data.ts` / `use-cases-data.ts` when shipping a new post.

## Current blog state (as of 2026-07-28)

- **Named Bright Enough** on `/blog/` (hero + meta description); category tags are icon + gray (no colored pills); story rows use shader thumbs; post pages use BlogTryHarvous bridge (not homepage DownloadCTA)
- Sparse `<mark>` highlights applied across posts for must-stick phrases (no bold+mark stacking); H2s capped at ≤33 chars for What’s covered TOC
- **25 posts** published (`draft: false`) including Shared Spaces batch (2026-07-25), how-we-think field note `remembering-is-the-point` (2026-07-26), and retention deep dive `why-scripture-engagement-stalls` (2026-07-28; featured on About via AboutResearchGap); multi-author closes + product-page related strips live
- Categories: `teaching`, `retention`, `equipping`, `how-we-think`, `using-harvous`, plus legacy `study-habits` / `scripture-study`
- **Shared Spaces live** on product pages; older equipping posts updated so they no longer call Spaces “on the road”
- Drafts visible in **`astro dev` only** via `src/lib/blog.ts` (`includeBlogDrafts`); production builds hide drafts
- Blog in main header + footer Company nav; RSS not added yet
- **Notes from Harvous pack drafted** (not production-published): `docs/notes-from-harvous/` — validate with `npm run notes-from-harvous:publish -- --validate-only`; publish blocked on APPROVAL/SIGNOFF

## 90-day proof-of-concept outline

**Month 1 — Own the problem**

- Why church education evaporates by Monday
- How teachers can prep a lesson that leaves a trail
- Notes-first vs AI devotionals (belief essay)
- A simple lesson-prep framework (template)

**Month 2 — Own the practice**

- Series: teaching through a book / topical class / sermon series → small group follow-up

**Month 3 — Own the system**

- Honest church-education systems pieces + soft funnel to Shared Spaces (live) and church interest for org/curriculum — principles first

## Success metrics (not vanity traffic)

Winning when:

- Teachers bookmark frameworks and share with co-teachers
- Search/referral for “lesson prep,” “small group retention,” “sermon to study” — not “quiet time ideas”
- Church interest form mentions find Harvous via teaching content
- Blog feels continuous with “Education for the church,” not bolted-on SEO

## Tone

Warm, founder-adjacent, anti-hype; concrete daily scenes; clear “what we’re not”; dignifies the user’s own searching. Align with `docs/BRAND_VOICE.md` and site about/audience copy. Prefer first-person or clear editorial voice over corporate plural.

**Plain words over clever packaging:**
- No jargon nicknames in the reader’s face (“delta,” “primitive,” “flywheel”) unless you immediately define them in ordinary speech — prefer the ordinary phrase instead (“what changed this pass,” “the note,” “the trail”)
- No staccato slogan triads as closers (“Teach the hour. / Leave the delta. / Come back richer.”). Close in sentences a tired teacher would say out loud
- Framework names are fine when they help (“lesson-prep stack,” “Monday retention loop”); don’t invent cute labels for a one-off bullet list

## Section headings (H2) — What’s covered TOC

Bright Enough posts surface every `##` heading in the **What’s covered** TOC (panel + sticky select). Those labels must stay short enough to scan in a single TOC line and a compact dropdown — long H2s wrap and look broken.

**Hard limit: each `##` ≤ 33 characters** (count every character including spaces and punctuation; curly quotes count). This is non-negotiable for new drafts and for any post you touch.

**Write for the TOC, not a subtitle:**
- Prefer concrete nouns / framework names (“Monday retention loop”, “Capture then return”)
- Avoid long clauses and parentheticals that pad length
- Do not put the essay thesis in an H2 — save that for body copy / `<mark>` lines
- `###` subheads are not in the TOC; they can be slightly longer if needed, but still keep them tight

**Bad → good (real miss, 2026-07-16):**
| Too long | ≤33 rewrite |
| --- | --- |
| What to do with a room of “we’ve heard this” (44) | When the room’s heard it before (31) |
| A simple return ritual (30–40 minutes) (38) | A 30–40 minute return ritual (28) |
| A word to the tired excellent teacher (37) | For the tired excellent teacher (31) |

**Before shipping / before PR:** run a character count on every `##` line in the MDX. If any exceed 33, rewrite — do not ship. When editing an older post, tighten any over-limit H2s in that file in the same pass.

## Inline highlights (`<mark>`) — Bright Enough visual rhythm

Use the site’s marker highlight (same as testimonials / What’s Included: global `mark` styles in harvous.com `src/styles/global.css`) to pull the eye to **what must stick**.

**In MDX:** wrap short phrases in `<mark>…</mark>` (default warm highlighter). Optional variants when useful: `mark-blue`, `mark-mint`, `mark-peach` — prefer default amber unless the section already uses that pastel.

**When to highlight (thoughtful, sparse):**
- The thesis or takeaway of a section (framework names, the “so what”)
- A boundary line (“tools only help,” “learning that isn’t kept…”)
- A memorable practice cue teachers will quote later

**Budget:** about **2–5 marks per post** (rarely more). Never highlight whole sentences routinely; prefer 2–8 words. Never highlight links, headings, or every list item.

**Avoid:** decorating for decoration; highlighting product pitch; stacking marks in the same paragraph; using marks instead of structure (lists / role cards / TOC still carry the layout).

**Notes from Harvous:** if the companion note compresses a marked line, keep at most **one** highlight in the short HTML note — same phrase when possible.

## Sources policy (blog + Notes from Harvous)

Outbound links exist for **credibility + reader help** first. Any SEO/backlink value is a side effect — never link for juice.

### Hard rules

- **Budget:** **0–3 primary** authority destinations per piece (0 is fine for pure practice/template posts). Never a link farm.
- **Never invent stats.** If you can’t name (and link) the source, cut the claim. Ban uncitable “studies show…”
- Prefer **stable URLs** (org hubs, APA teacher-ready reviews, open journal features, major practice hubs) over blog roundups or affiliate lists.
- Same URLs may appear on blog + Notes from Harvous when both surfaces share a claim.

### How to cite (blog MDX)

Bright Enough supports **two** citation shapes. Prefer both when a post makes research-backed claims:

1. **Inline natural anchors** (primary) — put the main idea in the sentence and link the phrase readers should follow:
   - Good: `…what they [practice retrieving](https://www.retrievalpractice.org/), not only what they once heard.`
   - Never: “click here” / bare URLs in body copy

2. **GFM footnotes** (secondary / supporting) — for a second source, a short attribution, or a denser cite without breaking the essay voice:
   ```md
   Learning lasts when people get a chance to retrieve what they heard.[^rp]

   [^rp]: For a teacher-facing overview of retrieval practice, see [retrievalpractice.org](https://www.retrievalpractice.org/).
   ```
   - Max **~3 footnotes** per post
   - Footnote bodies stay short (one sentence + link); don’t paste abstracts
   - Place footnote definitions at the **end of the MDX body** (before any closing components)
   - Enabled via `remark-gfm` in harvous.com `astro.config.mjs`; styled under `.prose-post`

3. **Further reading** (optional) — a short end list (**2–4 links**) only when footnotes aren’t enough and the teacher would actually bookmark the shelf. Don’t duplicate every footnote URL.

**Notes from Harvous:** keep cites lighter — usually one `<a href>` inline; skip footnote UI in TipTap notes.

### When to use which

| Situation | Prefer |
|---|---|
| One core claim the sentence is about | Inline link on the key phrase |
| Supporting study / second authority | Footnote |
| Scripture quotation | Inline link on the reference (Bible Gateway etc.) |
| Pure template / checklist post | Usually **0** authority links |

### Voice when citing

Sources should sound like Bright Enough, not a lit review:

- Translate research into teacher language (“coming back to it later beats highlighting once”)
- **One named idea + one primary link** beats three named researchers in the body
- Footnotes can carry the slightly denser attribution
- Keep founder-adjacent warmth; avoid “According to a 2006 meta-analysis…” in body unless the piece is explicitly POV/science-facing (`how-we-think` can lean slightly more explicit)

### Category source packs (starter shelf)

When a claim needs authority, prefer these durable shelves by category.

#### `retention`

**Use for:** forgetting, retrieval, spaced return, Monday follow-through, “highlights aren’t enough.”

| Prefer | URL / note |
|---|---|
| Retrieval Practice hub (default first cite) | https://www.retrievalpractice.org/ |
| APA teacher-ready review (practice testing + spaced practice) | https://www.apa.org/pubs/journals/features/stl-0000024.pdf |
| Dunlosky et al. strategy review (when naming techniques vs. reread) | https://journals.sagepub.com/doi/10.1177/1529100612453266 |

#### `teaching`

**Use for:** questions that open the text, prep that sticks, classroom/group transfer, return after the hour.

| Prefer | URL / note |
|---|---|
| Same retrieval / spacing core as `retention` | Use when the essay is about return after the hour |
| APA teacher-ready review | Same `stl-0000024` PDF when discussing practice testing in class/group |
| Established education writing on questioning / formative check | Durable org or university teaching centers — **skip** thin ministry SEO tip-lists |

#### `equipping`

**Use for:** continuity, handoffs, org learning principles (not vendor feature lists).

| Prefer | URL / note |
|---|---|
| Established ministry / church-education practice writing | Continuity and handoff principles |
| Learning-transfer ideas (from the retention shelf, sparingly) | When arguing systems should support return, not only content delivery |

**Avoid:** ChMS vendor blogs, affiliate “best church software” roundups, vaporware product comparisons.

#### `how-we-think`

**Use for:** theology of tools, AI boundaries, “the search is yours.”

| Prefer | URL / note |
|---|---|
| Unofficial Rules for AI Apps for Christians | https://faith.tools/posts/unofficial-rules-for-ai-apps-for-christians |
| Stable Scripture text | https://www.biblegateway.com/ (link the specific passage) |
| theologian-agent | Involve when the post teaches Scripture or makes theological claims |

#### `using-harvous` / `study-habits` / `scripture-study`

Light product or habit practice. Cite only when a habit claim truly needs science — usually **0–1** inline link from the retention shelf (optional one footnote). Don’t over-cite.

### Drafting / review gate

Before handing off a post:

1. List outbound authority destinations (primary inline + footnotes). Stay within budget.
2. Each must (a) support a real claim and (b) come from the category pack or an equally durable peer.
3. If a claim can’t be sourced, rewrite or cut it.
4. Confirm footnote syntax renders (`[^id]` + `[^id]: …` at end). When editing older posts, add a missing cite only where the claim already implies research.

## Dual-format: Notes from Harvous

Public essays and in-app notes share one editorial brain.

| Surface | Where | Length | Form |
|---|---|---|---|
| Blog | harvous.com `src/content/blog/` | 800–1400 words | MDX essays |
| Notes from Harvous | app curated pack `docs/notes-from-harvous/` | ~300–700 words HTML | TipTap `default` notes |

**Rules:**
- Draft blog (or shared outline) first, then **compress** into note HTML — do not paste the full essay into the app
- Follow `.claude/skills/content-agent/CONTENT_WRITING_GUIDE.md` for note titles (≤50 chars), HTML, scripture refs, and **no standalone discussion-prompt list notes**
- Soft “also in the app” CTAs on the blog **only after** the pack is published — no vapor join links
- Notes may link out to live blog URLs; blog may soft-CTA `/for/teachers/`, `/for/group-leaders/`, `/for/churches/` without requiring the pack
- Pack identity: space **Notes from Harvous**; thread **How the church teaches (and how learning lasts)**
- Production publish stays behind Easter-style APPROVAL / SIGNOFF — draft pack freely; don’t claim it’s live until signed off

## Coordination

- **This repo (harvous.com)** owns post MDX, categories, `/blog/` pages — strategy + marketing-agent skill live here under `.claude/agents/` and `.cursor/skills/marketing-agent/`.
- **Notes from Harvous pack** lives in the sibling app repo (`../harvous/docs/notes-from-harvous/`).
- **Release notes / changelog / admin publish** — sibling **harvous** app repo; must not claim unshipped product.
- Soft product CTAs: teachers/group pages, Shared Spaces add-on, church interest form — never hard-sell features that aren’t live.
