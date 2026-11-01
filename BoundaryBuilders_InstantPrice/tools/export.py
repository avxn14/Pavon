#!/usr/bin/env python3
"""export.py: after the owner's OK, re-render, run QA and copy the cards to final/instant_price_<f>.png (sRGB PNG, < 1 MB)."""
import os, sys, subprocess, shutil
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
for f in ("1x1", "4x5", "9x16"): subprocess.run([sys.executable, os.path.join(HERE, "render_cards.py"), f], check=True)
if subprocess.run([sys.executable, os.path.join(HERE, "tools", "qa.py")]).returncode: sys.exit("QA failed; nothing exported")
os.makedirs(os.path.join(HERE, "final"), exist_ok=True)
for f in ("1x1", "4x5", "9x16"):
    dst = os.path.join(HERE, "final", f"instant_price_{f}.png"); shutil.copyfile(os.path.join(HERE, "out", f"card_{f}.png"), dst); print("final:", dst, os.path.getsize(dst) // 1024, "KB")
subprocess.run([sys.executable, os.path.join(HERE, "tools", "preview.py")], check=True); shutil.copyfile(os.path.join(HERE, "out", "preview.png"), os.path.join(HERE, "final", "preview.png"))
