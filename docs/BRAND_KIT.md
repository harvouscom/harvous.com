# Harvous brand kit

The visual rules. See them live at **/brand/** (noindex, not in the nav), which
draws every swatch and sample from the real tokens. The voice lives in
[BRAND_VOICE.md](./BRAND_VOICE.md).

The look in three words: **quiet, bright, hand-made.**

## Where the tokens live

| File | Holds |
| --- | --- |
| `src/styles/global.css` | Core colours (`--color-*`), content pills (`--pill-*`), radii, shadows, the old `--tint-*` washes |
| `src/styles/brand.css` | Mesh families (`--mesh-<family>-a/b/c/base`), grain, `.nx-mesh` |
| `src/styles/fonts.css` | Google Sans Flex and Caveat, both self-hosted |
| `src/styles/next.css` | Layout and type classes: `nx-display`, `nx-title`, `nx-kicker`, `nx-lead`, `nx-btn`, `--nx-hand` |
| `src/lib/next/content.ts` | `stageMesh(family)`, `backdropSrc(id)` |

## Marks

- The app icon (`/images/harvous-2-icon.webp`, `-sm`) **is** the logo. Don't
  recolour it, crop its corners or put it in a container.
- Lockup: icon and "Harvous" in Google Sans Flex 600, letter-spacing −0.03em.
  The name's cap height is about 0.8 of the icon's height, with a gap of a third of the icon.
- Here's My Church keeps its own icon and purple. Never re-tint it to match Harvous.

## Colour

- The ground is near-white (`--color-paper`), with cool greys for text and rules.
- `--color-accent` (blue) means "go": links and the one primary CTA on a view.
  Don't use it for decoration.
- The five `--pill-*` colours name kinds of content: note, scripture,
  highlight, folder, thread. They're highlighter fills. Before you set text in
  one, mix it toward ink, or use `--pill-highlight-ink` for yellow.
- `--pill-thread` (green) is site taxonomy only. Mock app UI draws threads
  neutral, as the app does.

## Type

- **Google Sans Flex** for everything.
  - Headings: 600, tight tracking (display −0.03em, title −0.025em).
  - Body: 400 at 1.6 line height, `--color-ink-soft`.
  - Kickers: 600, small caps-tracked.
- **Caveat** (`--nx-hand`) is the margin hand: one line at a time, for asides
  and annotations. Never use it for body copy or buttons.

## Grounds: meshes, skies and thumbnails

There are three image families, and each has a job.

**1. Mesh gradients (`.nx-mesh`) go behind app mocks and illustrations.**

A mesh has three parts:
- a near-white centre, so a white card always reads
- two to four soft pools of one colour family in the corners
- fine grain

Meshes sit between the other two families: they're calmer than the skies and
have more colour than the thumbnails. The palettes were sampled from both.

| Family | Use it for |
| --- | --- |
| `sky` | Default. Reading, notes, anything calm |
| `amber` | Daily passage, reminders, warmth |
| `mint` | Growth: suggestions, review |
| `violet` | Scripture, the reader |
| `coral` | People: groups, churches |
| `blue` (alias `teal`) | Tools: search, library, Connector |

The table is a guide, not a lock. In a row of panels, rotating families is
fine. Use one family per panel.

To apply a mesh:

```astro
<!-- fixed family -->
<div class="nx-mesh nx-mesh--amber">…</div>

<!-- family from data -->
<div class="nx-mesh" style={stageMesh(tint)}>…</div>
```

Unknown families fall back to `sky`. Dark mode is handled by the tokens: each
family pulls toward the night ground, so a panel glows rather than glares.

**2. Painted skies (`/images/auth-hero/ai_bg_*.webp`) are for moments.**
- Use them for a hero, a pull quote (the About page's name panel), or a
  lock-screen wallpaper.
- Never put one behind a mock that has to be read: there's too much going on.
- The light skies are 044, 045, 047, 050, 051, 053, 058, 072, 075, 076 and 077.
- Get one with `backdropSrc(id)`.

**3. Bright Enough thumbnails (`/blog-thumbs/*-feat.webp`) are for the blog only.**
- They're airy and mostly white, with colour pooled at the edges.
- They're generated from the skies by `scripts/generate-blog-thumbs.mjs`.

## App UI in pictures

- Show the app, never stock photos of people holding phones.
- Build mocks from the real app's pieces (`ShowcaseVisual`, `AppNote`, the
  `aui-*` classes).
- Show only shipped behaviour. The native apps are not shipped.
- Quote only NLT text the app actually shows.
- Name things the way the app does: "Coming later" (`SOON_LABEL`), not "Coming soon".
