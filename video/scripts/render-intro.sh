#!/usr/bin/env bash
# The homepage intro, at full quality for web playback.
#
#   npm run intro:render
#
# 1. A near-lossless master from Remotion at 2560×1440, 60 fps. The captures are
#    2× (2880×1800), so UI text holds up at 1440p and in fullscreen on Retina.
# 2. The web file: H.264 High, CRF 18 with a peak cap (screen content mostly
#    sits far below it), loudness to -16 LUFS / -1.5 dBTP, AAC 192k, and the
#    moov atom up front so playback starts before the download finishes.
#
# The result goes to ../media/harvous-intro.mp4 (Git LFS) and is served from R2
# through the Worker, so Cloudflare's 25 MiB static-asset limit doesn't apply.
set -euo pipefail
cd "$(dirname "$0")/.."

PROPS='{"desktopFrame":"mac-chrome","phoneFrame":"iphone","theme":"light","fps":60}'
MASTER=out/intro-master.mp4
WEB=../media/harvous-intro.mp4

npx remotion render HarvousIntro "$MASTER" \
  --codec=h264 --crf=10 --x264-preset=slow \
  --scale=1.3333333333 \
  --props="$PROPS"

ffmpeg -hide_banner -loglevel error -y -i "$MASTER" \
  -c:v libx264 -preset slow -crf 18 -maxrate 10M -bufsize 20M \
  -profile:v high -level 5.1 -pix_fmt yuv420p \
  -af loudnorm=I=-16:TP=-1.5:LRA=11 -c:a aac -b:a 192k -ar 48000 \
  -movflags +faststart \
  "$WEB"

ffprobe -v error -show_entries stream=width,height,r_frame_rate,codec_name:format=duration,size,bit_rate -of compact "$WEB"
ffmpeg -hide_banner -nostats -i "$WEB" -af ebur128=peak=true -f null - 2>&1 | grep -E " I:| Peak:" | tail -2
