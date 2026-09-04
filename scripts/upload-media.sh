#!/usr/bin/env bash
# Push media/ into the R2 bucket the Worker serves it from.
#
# The videos live in public/ AND in R2, on purpose, for as long as Netlify is
# the rollback. Netlify can only serve what is in the build, and it does byte
# ranges natively. Cloudflare cannot — static assets have no range support —
# so its Worker intercepts these paths ahead of the asset router and serves
# them from R2 instead. See serveMedia in cloudflare/worker.ts.
#
# AFTER THE DNS CUTOVER: delete them from public/, drop the LFS fetch from
# .github/workflows/cloudflare-deploy.yml, and point this script at wherever
# they end up living. The copy in dist/ is dead weight the moment Netlify is
# retired.
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
  path="$ROOT/public/$name"
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
