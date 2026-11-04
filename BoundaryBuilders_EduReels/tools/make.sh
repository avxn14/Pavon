#!/bin/bash
# tools/make.sh NN   one command per video (except new voice-over, which only a Claude chat can make)
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; cd "$ROOT"
NN="$1"; [ -z "$NN" ] && { echo "usage: tools/make.sh NN"; exit 1; }
SCRIPT=$(ls scripts/${NN}_*.json 2>/dev/null | head -1); [ -z "$SCRIPT" ] && { echo "no scripts/${NN}_*.json"; exit 1; }
SLUG=$(python3 -c "import json,sys;print(json.load(open(sys.argv[1]))['id'])" "$SCRIPT")
STRETCH=$(python3 -c "import json,sys;print(json.load(open(sys.argv[1])).get('stretch',1.2))" "$SCRIPT")
echo "== 1. promo check on the script"; tools/check_promo.sh "$SCRIPT"
echo "== 2. VO check (sha1 of each beat's spoken text vs audio/vo/${NN}_hashes.json)"
NEED=$(python3 - "$SCRIPT" "$NN" <<'PY'
import json, sys, hashlib, os
S=json.load(open(sys.argv[1])); NN=sys.argv[2]; hp=f"audio/vo/{NN}_hashes.json"
H=json.load(open(hp)) if os.path.exists(hp) else {}
need=[]
for i,b in enumerate(S["beats"]):
    k=f"b{i+1}"; h=hashlib.sha1(b["vo"].replace("*","").encode()).hexdigest()
    if not os.path.exists(f"audio/vo/{NN}_{k}.mp3") or H.get(k)!=h: need.append(f"{k}: {b['vo'].replace('*','')}")
print("\n".join(need))
PY
)
if [ -n "$NEED" ]; then echo "STOP: these beats need new voice-over (ask Claude in a chat to generate them as audio/vo/${NN}_bK.mp3 and update ${NN}_hashes.json):"; echo "$NEED"; exit 2; fi
echo "== 3. audiofix (${STRETCH}x, gaps 0.25 s, -42 dB)"
for f in audio/vo/${NN}_b*.mp3; do python3 tools/audiofix.py "$f" "${f%.mp3}.caf" "$STRETCH" 0.25 -42; done
echo "== 4. plan"; VID=$NN python3 render.py plan
echo "== 5. render all frames"; VID=$NN python3 render.py all
echo "== 6. encode"; python3 tools/build.py encode "frames/$NN" 30 "renders/${NN}_video.mp4"
echo "== 7. mux"; python3 tools/build.py mux "renders/${NN}_video.mp4" "final/${SLUG}.mp4" "renders/${NN}_clips.json"
echo "== 8. cover"; VID=$NN python3 render.py cover
echo "== 9. QA"; VID=$NN python3 render.py qa
TOTAL=$(python3 -c "import json;print(json.load(open('renders/${NN}_plan.json'))['total'])")
python3 tools/mp4check.py "final/${SLUG}.mp4" "$TOTAL"
python3 - "$NN" "$TOTAL" <<'PY'
import json, sys, subprocess, os
NN, total = sys.argv[1], float(sys.argv[2]); P=json.load(open(f"renders/{NN}_plan.json")); S=json.load(open(sorted(__import__('glob').glob(f"scripts/{NN}_*.json"))[0]))
ts=[0,0.5,1.5]+[round((P["scenes"][i]+P["scenes"][i+1])/2,2) for i in range(len(P["scenes"])-1)]+[P["scenes"][-2], round(total-0.1,2)]
out=f"qa/{NN}_stills"; subprocess.run(["rm","-rf",out]); subprocess.run(["python3","tools/frames.py",f"final/{S['id']}.mp4",out]+[str(t) for t in ts],check=True)
from PIL import Image
for f in sorted(os.listdir(out)):
    if f.endswith(".png") and not f.endswith("_375.png"):
        im=Image.open(os.path.join(out,f)); im.resize((375,667), Image.LANCZOS).save(os.path.join(out,f[:-4]+"_375.png"))
print("stills:", out)
PY
echo "== 10. promo check on the rendered on-screen strings"; tools/check_promo.sh "qa/${NN}_strings.txt"
echo "DONE final/${SLUG}.mp4"
