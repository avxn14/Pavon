#!/usr/bin/env python3
"""retime.py: set the `beats` in src/config.ts from the voice-over's word timestamps.
Input: public/audio/voiceover.words.json = [{"text": "...", "start": s, "end": s}, ...] (ElevenLabs transcription words).
Beats are anchored on words of the script; each beat = audio.voStart + word start."""
import json, os, re, sys
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cfg_path = os.path.join(HERE, "src", "config.ts"); cfg = open(cfg_path, encoding="utf-8").read()
words = json.load(open(os.path.join(HERE, "public", "audio", "voiceover.words.json"), encoding="utf-8"))
if isinstance(words, dict): words = words.get("words", words)
norm = lambda s: re.sub(r"[^a-z0-9']", "", str(s).lower())
W = [(norm(w.get("text") or w.get("word", "")), float(w["start"])) for w in words if norm(w.get("text") or w.get("word", ""))]
vo_start = float(re.search(r"voStart:\s*([\d.]+)", cfg).group(1))
def find(seq, after=0.0):
    """start time of the first word of `seq` (list of normalised words) occurring at/after `after`"""
    for i in range(len(W) - len(seq) + 1):
        if W[i][1] >= after and all(W[i + k][0] == seq[k] for k in range(len(seq))): return W[i][1]
    raise SystemExit(f"anchor not found in transcript: {' '.join(seq)}")
t_spring = find(["don't", "put"])
t_theres = find(["there's", "your", "price"])
t_metal = find(["metal"], t_theres)
t_cedar = find(["cedar"], t_metal)
t_yes = find(["and", "yes"], t_cedar)
t_this = find(["this", "is", "your", "last"], t_yes)
t_last = find(["last", "chance"], t_this)
t_lock = find(["lock"], t_last)
beats = {"urgency1": t_spring, "priceScreen": t_theres, "metal": t_metal, "cedar": t_cedar, "urgency2": t_yes, "urgency3": t_this, "lastChance": t_last, "endCard": t_lock}
for k, v in beats.items():
    cfg, n = re.subn(rf"(\n\s*{k}:\s*)[\d.]+", rf"\g<1>{vo_start + v:.2f}", cfg, count=1)
    if not n: raise SystemExit(f"beat {k} not found in config.ts")
cfg = cfg.replace("ESTIMATED from the script until the real voice-over is in", "from the voice-over's word timestamps")
open(cfg_path, "w", encoding="utf-8").write(cfg)
print("beats (video seconds):", {k: round(vo_start + v, 2) for k, v in beats.items()})
