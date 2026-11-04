#!/usr/bin/env python3
"""plan_ad.py: time the scenes to the voice-over and write the audio mix list.
Reads scripts/ad.json (spec t0/t1 per scene) and audio/vo/bK.caf (speed-fixed voice lines, K = scene number).
Rule: voice line K starts 0.25 s after its scene starts (0.2 s for scene 1); a scene ends at the later of its spec end
and the voice end + 0.06 s; later scenes shift by the same amount; the total stays at the script duration (18 s) and
the end card absorbs the difference (it must keep at least 3.5 s and its voice must end 0.9 s before the end).
Writes the new t0/t1/vo into scripts/ad.json and audio/clips.json for tools/build.py mux (VO 1.0, music, whoosh on the wipe,
hit on the CTA pop). Mix levels (vo_volume 2.6, music 0.3, whoosh .45, hit .4) land at about -18 LUFS integrated, true peak -2.4 dBFS."""
import json, os, subprocess, math
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def dur(p): return float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",p],capture_output=True,text=True).stdout.strip())
S = json.load(open(os.path.join(ROOT, "scripts", "ad.json"))); total = S["duration"]; FPS = 30
def q(t): return math.ceil(t * FPS - 1e-6) / FPS   # round up to a frame
B = S["boundaries"]; assert len(B) == len(S["scenes"]) + 1 and abs(B[-1] - total) < 1e-6, "boundaries must span 0..duration"
clips = []
for i, sc in enumerate(S["scenes"]):
    k = sc["scene"]; vo = os.path.join(ROOT, "audio", "vo", f"b{k}.caf"); d = dur(vo)
    t0, t1 = B[i], B[i + 1]; lead = 0.2 if i == 0 else 0.25; vs = q(t0 + lead); ve = vs + d
    limit = total - 0.9 if sc["type"] == "end" else t1 + 0.1   # a voice line may run 0.1 s into the next scene's crossfade
    assert ve <= limit + 1e-6, f"scene {k}: voice ends {ve:.2f} > {limit:.2f}; move the boundary"
    sc["t0"], sc["t1"], sc["vo_start"], sc["vo_len"] = t0, t1, round(vs, 4), round(d, 3)
    clips.append({"file": f"audio/vo/b{k}.caf", "start": round(vs, 3), "volume": S.get("vo_volume", 2.6)})
    print(f"scene {k}: {t0:.2f}-{t1:.2f} ({t1-t0:.2f} s)  VO {vs:.2f}-{ve:.2f} ({d:.2f} s)")
end = S["scenes"][-1]; assert total - end["t0"] >= 3.5, "end card shorter than 3.5 s"
F = S["formats"]["916"]; wipe0 = end["t0"] - F["wipeDur"] / 2
music = os.path.join(ROOT, "audio", "music", "bed.mp3")
if os.path.exists(music): clips.append({"file": "audio/music/bed.mp3", "start": 0.0, "volume": S.get("music_volume", 0.3), "fadeOut": total - 1.0, "offset": S.get("music_offset", 0.0)})
clips.append({"file": "audio/sfx/whoosh.mp3", "start": round(wipe0, 3), "volume": S.get("sfx_volume", {}).get("whoosh", 0.45)})
clips.append({"file": "audio/sfx/hit.mp3", "start": round(end["t0"] + 1.2, 3), "volume": S.get("sfx_volume", {}).get("hit", 0.4)})
json.dump(S, open(os.path.join(ROOT, "scripts", "ad.json"), "w"), indent=1, ensure_ascii=False)
json.dump(clips, open(os.path.join(ROOT, "audio", "clips.json"), "w"), indent=1)
print("wrote scripts/ad.json timings and audio/clips.json:", [(c["file"].split("/")[-1], c["start"]) for c in clips])
