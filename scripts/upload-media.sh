#!/usr/bin/env bash
# Push media/ into the R2 bucket the Worker serves it from.
#
# These are render inputs to the site, not build assets: they never enter dist/.
# Static assets cannot do byte ranges, and video without ranges cannot be
# seeked, so the Worker serves them from R2 instead. media/ is where they are
# versioned (Git LFS); R2 is where they are served from.
# See serveMedia in cloudflare/worker.ts.
#
# Run after changing a video, then deploy. Uploading is idempotent.
#
#   npm run media:upload            # the real bucket
#   npm run media:upload -- --local # wrangler's local R2, for `wrangler dev`
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BUCKET="harvous-com-media"
# Anything not listed in MEDIA_KEYS in the Worker is unreachable, so keep the
# two in step.
FILES=(touring-harvous-short.mp4 harvous-3-walkthrough.mp4)

# --remote is what makes wrangler talk to the real bucket rather than local state.
TARGET="--remote"
[ "${1:-}" = "--local" ] && TARGET="--local"

for name in "${FILES[@]}"; do
  path="$ROOT/media/$name"
  [ -f "$path" ] || { echo "missing: $path" >&2; exit 1; }
  # A Git LFS pointer is a few hundred bytes of text; uploading one would
  # replace the video with gibberish and the failure would be silent.
  if [ "$(wc -c < "$path")" -lt 100000 ]; then
    echo "refusing to upload $name — it is $(wc -c < "$path") bytes, likely an LFS pointer. Run: git lfs pull" >&2
    exit 1
  fi
  echo "→ $name ($(du -h "$path" | cut -f1))"
  npx wrangler r2 object put "$BUCKET/$name" \
    --file "$path" --content-type video/mp4 $TARGET
done

echo "Done. The Worker serves these at / — see MEDIA_KEYS in cloudflare/worker.ts."
