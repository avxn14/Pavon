#!/usr/bin/env bash
# stills:  tools/render.sh stills      -> out/still_*.png (2 s, 13.4 s, end card) for approval
# videos:  tools/render.sh 4x5|9x16|all -> out/instant_price_<fmt>.mp4
set -euo pipefail; cd "$(dirname "$0")/.."; mkdir -p out
case "${1:-stills}" in
  stills) for f in 60:2s 402:13s 840:end; do fr=${f%%:*}; nm=${f##*:}; npx remotion still --config=remotion.config.ts --browser-executable=/opt/pw-browsers/chromium --chrome-mode=chrome-for-testing src/index.ts InstantPrice45 "out/still_${nm}.png" --frame "$fr"; done ;;
  4x5)  npx remotion render --config=remotion.config.ts --browser-executable=/opt/pw-browsers/chromium --chrome-mode=chrome-for-testing src/index.ts InstantPrice45  out/instant_price_4x5.mp4 ;;
  9x16) npx remotion render --config=remotion.config.ts --browser-executable=/opt/pw-browsers/chromium --chrome-mode=chrome-for-testing src/index.ts InstantPrice916 out/instant_price_9x16.mp4 ;;
  all)  "$0" 4x5; "$0" 9x16 ;;
esac
