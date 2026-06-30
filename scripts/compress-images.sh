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

compress() {
  "$DINKY" compress-image "$@" -f webp --smart-quality --strip-metadata -o "$PUB" --json
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
compress "$PUB"/images/auth-hero/*.webp -w 1920

echo "Done. WebP files written next to sources under public/."
