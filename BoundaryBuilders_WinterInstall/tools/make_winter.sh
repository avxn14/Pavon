#!/usr/bin/env bash
# make_winter.sh [916|45 ...]: render -> encode -> mux music -> QA -> stills. Finals: final/winter_install_9x16.mp4, final/winter_install_4x5.mp4
set -euo pipefail
cd "$(dirname "$0")/.."
FMTS=${@:-916 45}
for FMT in $FMTS; do
  case $FMT in 916) OUT=final/winter_install_9x16.mp4;; 45) OUT=final/winter_install_4x5.mp4;; esac
  echo "== $FMT: render"; FMT=$FMT python3 render_winter.py all
  echo "== $FMT: encode"; BITRATE=${BITRATE:-9M} python3 tools/build.py encode frames/$FMT 30 renders/${FMT}_video.mp4
  if [ -n "${MUSIC:-}" ]; then python3 tools/build.py mux renders/${FMT}_video.mp4 "$OUT" "$MUSIC"; else cp renders/${FMT}_video.mp4 "$OUT"; fi
  echo "== $FMT: qa"; FMT=$FMT python3 render_winter.py qa
  echo "== $FMT: motion"; python3 tools/motion_check.py frames/$FMT $( [ $FMT = 916 ] && echo 450 || echo 300 ) 608 18.0 || true
  mkdir -p qa/stills_$FMT; rm -f qa/stills_$FMT/*.jpg
  for T in 0 0.5 1.5 2.9 3.1 5 6.9 7.1 8.5 9.1 10.5 11 12 14.9 15.1 16.5 17.9 18 18.5 19.5 19.97; do ffmpeg -v error -y -ss $T -i "$OUT" -frames:v 1 -q:v 2 qa/stills_$FMT/t$T.jpg; done
  ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate:format=duration,size -of compact "$OUT" | tr '\n' ' '; echo
done
