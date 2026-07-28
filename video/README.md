# Harvous feature tour (Remotion)

Polished cut of the long founder tour (`../public/touring-new-harvous-share.mp4`) for the marketing site lightbox.

Target length: **~3–5 minutes** of feature-focused footage with intro/outro cards and soft crossfades.

## Setup

```bash
cd video
npm i
# Footage: ../public/touring-new-harvous-share.mp4 (via remotion.config publicDir)
```

## Preview

```bash
npm run dev
```

Opens Remotion Studio for the `HarvousTour` composition.

## Render into the site

```bash
npm run render:site
```

Writes `../public/touring-harvous-short.mp4` (Git LFS).

Or render locally only:

```bash
npm run render
```

## Editing the cut

Timeline lives in [`src/clips.ts`](src/clips.ts). Adjust `startSec` / `endSec` (source seconds) and chapter `label`s. Duration recalculates automatically.
