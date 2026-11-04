#!/bin/bash
# review_copy.sh NN  -> qa/NN_slug_REVIEW_COPY.mp4 (1080p at crf 23, about 8 MB, same audio) for sending in chat (the 1080p master stays in final/)
set -e; ROOT="$(cd "$(dirname "$0")/.." && pwd)"; cd "$ROOT"; NN="$1"
SLUG=$(python3 -c "import json,glob,sys;print(json.load(open(sorted(glob.glob('scripts/%s_*.json'%sys.argv[1]))[0]))['id'])" "$NN")
ffmpeg -v error -y -i "final/${SLUG}.mp4" -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart "qa/${SLUG}_REVIEW_COPY.mp4"
ls -la "qa/${SLUG}_REVIEW_COPY.mp4"
