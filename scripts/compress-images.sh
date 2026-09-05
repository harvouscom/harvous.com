#!/usr/bin/env bash
# Compress harvous.com public images with the Dinky CLI (WebP, smart quality).
# Build Dinky once: cd ~/dinky/DinkyCoreImage && swift build -c release
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PUB="$ROOT/public"

DINKY="${DINKY:-${DINKY_BIN:-}}"
if [[ -z "$DINKY" ]]; then
  for candidate in \
    "$HOME/dinky/DinkyCoreImage/.build/release/dinky" \
    "$HOME/dinky/DinkyCoreImage/.build/debug/dinky"; do
    if [[ -x "$candidate" ]]; then
      DINKY="$candidate"
      break
    fi
  done
fi

if [[ -z "$DINKY" || ! -x "$DINKY" ]]; then
  echo "dinky CLI not found. Set DINKY=/path/to/dinky or build DinkyCoreImage." >&2
  exit 1
fi

# Pixel width, or empty if nothing here can read it. sips ships with macOS;
# ffprobe is the fallback for anyone without it.
image_width() {
  local w
  w="$(sips -g pixelWidth "$1" 2>/dev/null | awk '/pixelWidth:/ { print $2 }')"
  [ -n "$w" ] || w="$(ffprobe -v error -show_entries stream=width -of csv=p=0 "$1" 2>/dev/null | head -1)"
  printf '%s' "$w"
}

compress() {
  # Output beside the source, not at the top of public/. Every call passes
  # files from one directory, so the first argument decides where they land —
  # with a flat -o "$PUB" the WebP for public/tour/x.png was written to
  # public/x.webp, where OptimizedImage (which looks for a sibling) never
  # finds it, and the PNG ships unoptimized.
  local outdir
  outdir="$(cd "$(dirname "$1")" && pwd)"

  # Dinky does not overwrite. Handed an existing target it writes "name
  # copy.webp", then "name copy 2.webp", then "copy 3" — so every re-run of this
  # script left another full set behind. That had reached 52 files and 5.7 MB of
  # unreferenced duplicates before anyone noticed. Clear the target first.
  local arg base target
  for arg in "$@"; do
    case "$arg" in -*) continue ;; esac
    [ -f "$arg" ] || continue
    base="$(basename "${arg%.*}")"
    target="$outdir/$base.webp"
    # Never delete the source. The auth-hero pass compresses .webp in place, so
    # there the target IS the input — clearing it first destroyed eighteen
    # source files before this guard existed.
    [ "$target" = "$(cd "$(dirname "$arg")" && pwd)/$(basename "$arg")" ] && continue
    rm -f "$target"
  done
  "$DINKY" compress-image "$@" -f webp --smart-quality --strip-metadata -o "$outdir" --json
}

echo "→ Hero + feature screenshots (max 1920px)"
compress \
  "$PUB/app-full.png" \
  "$PUB/app-note.png" \
  "$PUB/app-scripture.png" \
  "$PUB/app-highlight.png" \
  "$PUB/app-organize.png" \
  -w 1920

echo "→ Open Graph + founder assets"
compress "$PUB/og.png" -w 1200
compress "$PUB/derek-signiture.png" -w 800 --content-hint graphic
compress "$PUB/derek-avatar.jpeg" -w 512

echo "→ Icons"
compress \
  "$PUB/images/harvous-icon-sm.png" \
  "$PUB/images/harvous-2-icon.png" \
  "$PUB/icons/app-icon.png" \
  -w 256 --content-hint graphic

echo "→ Use-case hero backgrounds"
# Only the ones still wider than 1920. These are already WebP, so handing the
# whole glob to the compressor re-encodes them in place on every run — lossy
# each time, and not even reliably smaller: one 36K file came back 316K,
# because re-encoding an already-compressed image at a higher quality inflates
# it without recovering any detail. All eighteen are at 1920 now, so with this
# filter the pass correctly does nothing until someone drops in a bigger one.
auth_wide=()
for shot in "$PUB"/images/auth-hero/*.webp; do
  [ -f "$shot" ] || continue
  w="$(image_width "$shot")"
  # Unknown width: leave it alone. Skipping costs nothing; re-encoding does.
  [ -n "$w" ] || { echo "  skip (cannot read width): $(basename "$shot")"; continue; }
  (( w > 1920 )) && auth_wide+=("$shot")
done
if (( ${#auth_wide[@]} )); then
  compress "${auth_wide[@]}" -w 1920
else
  echo "  all within 1920 — nothing to do"
fi

# Tour screenshots land here at the 3.0 cutover (see src/lib/app-tour-chapters.ts
# and the extra shots in src/pages/3.astro). OptimizedImage serves the WebP
# sibling when it exists, so each PNG needs one — this is the step that makes it.
echo "→ Tour screenshots (public/tour)"
shopt -s nullglob
tour_shots=("$PUB"/tour/*.png)
shopt -u nullglob
if (( ${#tour_shots[@]} )); then
  compress "${tour_shots[@]}" -w 1920
else
  echo "  none yet — drop tour-*.png into public/tour/ and re-run"
fi

echo "Done. WebP files written next to sources under public/."
