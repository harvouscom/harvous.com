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

## The homepage intro (`HarvousIntro`)

Derek's narrated intro: his voice over his own account, in a drawn browser
window and phone, with Screen Studio-style zooms, a drawn cursor, a few
clean marks, and his words on screen as he says them. It plays inside the
hero's lightbox, so the site around it does the selling. There's no end card,
no byline and no call to action. Every
piece can be redone on its own, so when Harvous changes, re-shoot only the
scenes that changed.

### 1. Capture (`capture/`)

```bash
npm run intro:login                               # once: sign in by hand in the Chrome window, then close it
npm run intro:capture -- --scene reader --device desktop
npm run intro:capture -- --all                    # every scene on every device it's shot on
npm run intro:prep                                # after any capture: copies site assets, writes the takes manifest
```

- Scenes are in `capture/scenes/`, in story order. What each one opens
  (chapter, verse, typed line, thread) is in `capture/scenes.config.ts`.
- Captures run against **production** app.harvous.com in a persistent Chrome
  profile (`capture/.profile`, gitignored). A local build can't show the real
  account, because dev Clerk has a different user id.
- **The guard** (`capture/guard.ts`) answers every non-GET API call with an empty
  200 unless the scene allows it. Visits, Review answers, highlights, attendance
  and XP never reach the account. A highlight made on camera is kept in memory
  and mixed into the chapter refetch, so it stays painted.
- The Scripture scene is the only one that really writes. It creates a
  throwaway note, and cleanup deletes exactly that note, after checking its
  title, its typed line and that it was created during the take. Note deletion
  is permanent, so those checks matter.
- **Slow motion.** Chrome's screencast manages about 22 fps at 2880×1800, so the
  page runs at ⅓ speed while recording (`capture/timescale.ts`) and the frames
  are retimed 3× faster. Motion comes out at about 60 fps. `--slow 1` turns it off.
- Each take is `footage/intro/takes/<scene>-<device>.mp4` (gitignored), plus:
  - `.events.json`: pointer path, clicks, named marks and element anchors.
  - `.guard.json`: every write the guard saw.

### 2. Voice and sound

```bash
npm run narrate -- intro --dry-run      # see what would be generated
npm run narrate -- intro                # Derek's clone, one mp3 per line
npm run intro:ambience                  # two looping outdoor beds: soft wind, far-off birds
npm run intro:music -- --redo          # ambient bed composed to the edit, a section per chapter (key needs Music)
npm run intro:app-sounds                # the app's own interface sounds (cuelume), rendered to files
npm run intro:stumbles                  # flags um/uh/"you know"/repeats in what Scribe heard
npm run intro:captions                  # Scribe word timings → the on-screen subtitles and harvous-intro.vtt
```

The script is `narration/intro.json`. The opening and closing lines are from
the About page letter (`src/components/FounderLetter.astro`). Until the audio
exists, the composition times each line at 2.3 words a second.

- A line can carry a `say` alongside its `text` when it should be spoken
  differently from how it reads. "Proverbs 25:2" is said as "Proverbs
  twenty-five, two". The captions keep the `text`.
- `narrate` sends only the previous line as context. Sending the next one too
  made the clone start saying it at the end of a clip; the composition also
  cuts every clip a breath after its last heard word (plan.ts `playSeconds`).
- The clone sometimes adds an "um" or repeats a word. The captions step
  writes what Scribe heard to `footage/narration/intro/<id>.words.json`, so
  check those (`npm run intro:stumbles`), and re-voice a line with
  `npm run narrate -- intro --redo <id>`. The word timings are cached by the
  audio's own hash, so a new take of the same words is transcribed again.

### 3. Compose (`src/intro/`)

- The story is how Harvous becomes your study Bible: Today, a new note with
  a scripture pill, the scripture dock staying with you, tags and folders made
  for you, Threads, the reader with your notes in the margin, then Review.
  Every scene uses Derek's real notes; only the pill is typed into a
  throwaway note.
- `timeline.ts` is the story. Each beat has its narration lines, its take
  (started from a capture mark), its mesh family, its chapter marker, and its
  zooms and marks, all keyed to capture mark and anchor names rather than
  seconds.
- A beat lasts at least until its take's `until` mark (or the take's end),
  so nothing is cut before you see it land. Neighbouring beats
  overlap while one hands over to the next: panes slide across, the first
  window rises in, the last lifts away. `npm run intro:timing` prints where
  everything lands.
- The look comes from the site itself:
  - Mesh grounds per chapter (`src/stage/Mesh.tsx`, from `brand.css`; the
    painted skies stay out from behind the mocks).
  - The blog's icon blocks: each chapter opens on its block tumbling into the
    middle of the stage with the name beneath, before the window rises in
    (`src/stage/IconBlock.tsx`).
  - Meshes move: each chapter has a motion (`drift`, `swirl`, `tide`) on top of
    its colour family.
  - Each chapter's block and ground use the site's feature colours: the
    feature's category (Activity, Read, Write, Find, Share) tints the tile,
    inks the icon by the feature's tier, and picks the mesh
    (`FEATURE_CATEGORY` in IconBlock.tsx, from feature-categories-data.ts).
- Arrivals (`enter` in timeline.ts): `rise` (title, then the window floats up
  with a slight tilt and a light sweep), `frosted` (same screen: blur behind
  the title, clear into the next take), `zoom` (push into the pill, open
  pushed in on the next one), `pane`.
- Chapter starts snap to the music's beat grid (`TEMPO_BPM`), and the music
  is composed with one section per chapter at those exact lengths, so changes
  in the music land on the cuts. Re-run `intro:music -- --redo` after the
  timing moves.
- The app's sounds play on the take's clicks (`sounds` per beat, by click
  order), rendered from the same cuelume cues and settings the app uses. Only
  the small ticks are used; the page-turn and panel sounds were too much.
  - The app's own easing curves (`src/stage/motion.ts`, from
    `prototype-tokens.css`).
  - Callouts follow the size of the thing being shown:
    - Small things (a pill, the margin rules) get a magnifier
      (`kind: "loupe"`): a ringed circle over the spot showing it larger, from
      the same frame of the take. Aim with `focus` (fractions of the anchor's
      box) or `point` (take pixels, read off a frame).
    - Bigger things (a card, a list, a panel) get a crop
      (`zooms: [{ mode: "crop" }]`): the window stays put and the footage
      zooms and pans inside it, to `point` if given. `move` slows a pan (a
      drift down a list), `until` ends it at a mark.
    - `mode: "stage"` (the default) pushes the whole stage in, chrome and all.
  - Takes play on the beat's clock (`TakeVideo` places every frame), so the
    footage, cursor, magnifiers and camera never drift apart.
  - `pace` on a beat holds the footage at a mark while the voice catches up,
    or changes its speed from there (the walk into a note goes by at 2×).
    Pick a hold point where the cursor is at rest. A `vo` entry can be
    `{ id, at }` to start a line when the take reaches a mark.
- The close is a bento like the homepage's (`bento` on the last beat): six
  cards in the site's tones (sky, cream, lilac, mint, peach, pink), each with a
  stage in its tone's mesh, over a neutral `stone` ground so the cards carry
  the colour. They open on the chapters you saw, then trade them, one card at
  a time, for everything else on harvous.com. No app, no end card.
- Subtitles (`Subtitles` in `Intro.tsx`, timing in `words.ts`) show one short
  phrase at a time, each word rising in as it's spoken: large over the
  opening, small and low over the app. The player's captions track uses the
  same timing and is off by default.
- Frames are in `src/frames/` and swap through props:
  - `desktopFrame`: `mac-chrome` | `mac-safari` | `windows-chrome`
  - `phoneFrame`: `iphone` | `iphone-safari` | `android-chrome`
  - `theme`: `light` | `dark`
- The camera and cursor are in `src/camera/`, the notes in `src/annotations/`.

```bash
npm run dev                             # Studio → HarvousIntro (props panel has the frame switches)
npm run intro:draft                     # half-size review render → out/intro-draft.mp4
npx remotion render HarvousIntro out/intro-windows.mp4 --props='{"desktopFrame":"windows-chrome","phoneFrame":"android-chrome","theme":"light"}'
npm run intro:render                    # final: 2560×1440 60 fps master, then the web file at ../media/harvous-intro.mp4
```

### 4. Ship

`harvous-intro.mp4` is served from R2 like the walkthrough (it's listed in the
Worker's `MEDIA_KEYS`, `wrangler.jsonc`, `scripts/upload-media.sh` and the dev
proxy). Upload first, then deploy:

```bash
npm run media:upload        # from the repo root
```
