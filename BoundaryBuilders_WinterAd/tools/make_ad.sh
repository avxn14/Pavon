#!/usr/bin/env bash
# make_ad.sh [916|45 ...]  render -> encode -> QA -> stills for each format. MUSIC=<clips.json> muxes audio.
set -euo pipefail
cd "$(dirname "$0")/.."
FMTS=${@:-916 45}
for FMT in $FMTS; do
  echo "== $FMT: render"; FMT=$FMT python3 render_ad.py all
  echo "== $FMT: encode"; BITRATE=${BITRATE:-10M} python3 tools/build.py encode frames/$FMT 30 renders/${FMT}_video.mp4
  OUT=final/BoundaryBuilders_WinterSale_${FMT}.mp4
  if [ -n "${MUSIC:-}" ]; then python3 tools/build.py mux renders/${FMT}_video.mp4 "$OUT" "$MUSIC"; else cp renders/${FMT}_video.mp4 "$OUT"; fi
  echo "== $FMT: qa"; FMT=$FMT python3 render_ad.py qa
  echo "== $FMT: stills from the encoded file"; mkdir -p qa/stills_$FMT; rm -f qa/stills_$FMT/*.jpg
  for T in 0 0.5 1.5 2.9 3.6 5.0 6.9 7.6 9.0 10.9 11.6 12.5 13.9 14.0 14.3 15.0 16.5 17.9; do ffmpeg -v error -y -ss $T -i "$OUT" -frames:v 1 -q:v 2 qa/stills_$FMT/t$T.jpg; done
  ffprobe -v error -select_streams v:0 -show_entries stream=codec_name,width,height,r_frame_rate,pix_fmt:format=duration,size -of default=nw=1 "$OUT"
done
