#!/bin/bash
# check_promo.sh [files...]   default: scripts/*.json captions.md qa/*_strings.txt
# Any hit stops the build. Scans script JSON (VO, on-screen text, cover titles, captions, hashtags, alt text),
# captions.md and the visible on-screen strings dumped by render.py qa. Never scans HTML/JS source.
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FILES=()
for a in "$@"; do case "$a" in /*) FILES+=("$a");; *) FILES+=("$PWD/$a");; esac; done
cd "$ROOT"
if [ ${#FILES[@]} -eq 0 ]; then FILES=(scripts/*.json captions.md qa/*_strings.txt); fi
EXIST=(); for f in "${FILES[@]}"; do [ -f "$f" ] && EXIST+=("$f"); done
[ ${#EXIST[@]} -eq 0 ] && { echo "check_promo: nothing to scan"; exit 0; }
WORDS='price|pricing|prices|cost|costs|sale|sales|deal|deals|promo|promotion|promotions|discount|discounts|offer|offers|special|specials|free quote|quote|quotes|instant price|book now|limited time|call now|call us|call today|contact us|hire us|dm for pricing|starting at|cheap|cheaper|affordable|budget|estimate|estimates|free estimate|financing|warranty|guarantee|guaranteed|lowest|best price|per square foot|sq ft|sqft|per foot|per panel|per-panel|per-sq-ft|per-foot|link in bio'
HITS=0
if grep -n -F '$' "${EXIST[@]}"; then HITS=1; fi
if grep -n -i -w -E "$WORDS" "${EXIST[@]}"; then HITS=1; fi
if [ $HITS -ne 0 ]; then echo "check_promo: FAIL (see lines above)"; exit 1; fi
echo "check_promo: PASS (${#EXIST[@]} files clean)"
