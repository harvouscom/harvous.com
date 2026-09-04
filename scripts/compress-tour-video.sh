#!/usr/bin/env bash
# Compress a rendered tour video to fit Cloudflare's 25 MiB per-asset limit.
#
# Workers static assets refuses to upload — or serve, under `wrangler dev` —
# any file over 25 MiB, so a video that ships from public/ has a hard ceiling.
# Two-pass x264 at a bitrate computed from the target size hits it predictably;
# CRF alone cannot promise a size.
#
# Usage: compress-tour-video.sh <input> <output> [target-MiB]
set -euo pipefail

IN="${1:?usage: compress-tour-video.sh <input> <output> [target-MiB]}"
OUT="${2:?usage: compress-tour-video.sh <input> <output> [target-MiB]}"
# 23 MiB, not 25: leaves headroom so a re-render that runs slightly long, or a
# noisier cut, does not silently cross the limit.
TARGET_MIB="${3:-23}"
AUDIO_KBPS=96
LIMIT_BYTES=$((25 * 1024 * 1024))

command -v ffmpeg >/dev/null || { echo "ffmpeg not found (brew install ffmpeg)" >&2; exit 1; }

DURATION="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$IN")"
# Video budget = target, less the audio track, less ~0.5% container overhead.
VIDEO_BPS="$(python3 -c "
target = $TARGET_MIB * 1024 * 1024 * 0.995
audio = $AUDIO_KBPS * 1000 / 8 * $DURATION
print(int((target - audio) * 8 / $DURATION))
")"

echo "Source:   $IN ($(printf '%.1f' "$DURATION")s)"
echo "Target:   ${TARGET_MIB} MiB → ${VIDEO_BPS} bps video + ${AUDIO_KBPS}k audio"

LOG="$(mktemp -t tourpass)"
trap 'rm -f "$LOG"-0.log "$LOG"-0.log.mbtree "$LOG"' EXIT

ffmpeg -hide_banner -loglevel error -y -i "$IN" \
  -c:v libx264 -preset slow -b:v "$VIDEO_BPS" -pass 1 -passlogfile "$LOG" \
  -profile:v high -pix_fmt yuv420p -an -f mp4 /dev/null
ffmpeg -hide_banner -loglevel error -y -i "$IN" \
  -c:v libx264 -preset slow -b:v "$VIDEO_BPS" -pass 2 -passlogfile "$LOG" \
  -profile:v high -pix_fmt yuv420p \
  -c:a aac -b:a "${AUDIO_KBPS}k" -movflags +faststart "$OUT"

SIZE="$(wc -c < "$OUT" | tr -d ' ')"
printf 'Wrote:    %s (%.2f MiB)\n' "$OUT" "$(python3 -c "print($SIZE/1048576)")"

if [ "$SIZE" -ge "$LIMIT_BYTES" ]; then
  echo "FAIL: still at or over Cloudflare's 25 MiB limit — lower the target and re-run." >&2
  exit 1
fi
