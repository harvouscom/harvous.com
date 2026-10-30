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
`../media/touring-harvous-short.mp4` (Git LFS) via
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

## Narration in Derek's voice

Voiceover comes from Derek's ElevenLabs clone ("Derek", Multilingual v2). That
model stays closest to his voice; v3 and v4 come out too bubbly.

1. Put an ElevenLabs API key in `video/.env` (gitignored):

   ```bash
   ELEVENLABS_API_KEY=...
   ```

2. Write the script as `narration/<name>.json`. Use one scene per line of
   voiceover, written the way Derek talks: short sentences, "So…", "which I
   think is pretty neat." See [`narration/example.json`](narration/example.json).

3. Generate the audio:

   ```bash
   npm run narrate -- <name>              # only new or edited lines spend credits
   npm run narrate -- <name> --redo intro # new take of one line
   npm run narrate -- <name> --dry-run    # preview what would be generated
   ```

   This writes `footage/narration/<name>/<scene>.mp3` and a `manifest.json` with
   each line's duration. Neighboring lines are sent along with each request, so
   intonation carries across cuts.

4. Audition it in Studio (`npm run dev` → **NarrationPreview**). Set the
   `script` prop to `<name>`.

5. Use it in a composition. Load the manifest in `calculateMetadata` with
   `loadNarration(name)`, then render `<NarrationTrack manifest={manifest} />`.
   `placeNarration()` gives each line's start frame if you want to sync visuals
   to it. Both helpers are in [`src/narration.tsx`](src/narration.tsx).

If a line sounds flat, `--redo` it before you touch the settings, because takes
vary. To change the delivery for a whole script, add `"voiceSettings"` to its
JSON (for example `{ "stability": 0.3 }`). The defaults are in
`scripts/narrate.mjs`.

## Editing the cut

Timeline lives in [`src/clips.ts`](src/clips.ts). Adjust `startSec` / `endSec` (source seconds) and chapter `label`s. Duration recalculates automatically.
