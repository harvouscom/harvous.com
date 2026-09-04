# Harvous feature tour (Remotion)

Polished cut of the long founder tour (`footage/touring-new-harvous-share.mp4`) for the marketing site lightbox.

Target length: **~3–5 minutes** of feature-focused footage with intro/outro cards and soft crossfades.

## Setup

```bash
cd video
npm i
# Footage: footage/touring-new-harvous-share.mp4 (via remotion.config publicDir)
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

Renders to `out/tour-full.mp4`, then compresses that into
`../public/touring-harvous-short.mp4` (Git LFS) via
[`scripts/compress-tour-video.sh`](../scripts/compress-tour-video.sh).

The compression step is not optional polish. Cloudflare Workers static assets
refuses to upload — or serve, under `wrangler dev` — any file over 25 MiB, and
a straight Remotion render of this cut lands around 63 MB. The script does a
two-pass x264 encode at a bitrate computed from a 23 MiB target (headroom under
the limit) and exits non-zero if the result still crosses 25 MiB. Requires
`ffmpeg`.

Or render locally only:

```bash
npm run render
```

## Editing the cut

Timeline lives in [`src/clips.ts`](src/clips.ts). Adjust `startSec` / `endSec` (source seconds) and chapter `label`s. Duration recalculates automatically.
