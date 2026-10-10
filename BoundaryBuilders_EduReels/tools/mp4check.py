#!/usr/bin/env python3
"""mp4check.py <file.mp4> [expectedDuration]: 1080x1920, 30 fps, H.264, exactly one AAC audio track starting at 0, moov before mdat, under 100 MB."""
import sys, json, subprocess, struct, os
p = sys.argv[1]; exp = float(sys.argv[2]) if len(sys.argv) > 2 else None
info = json.loads(subprocess.run(["ffprobe","-v","error","-show_streams","-show_format","-of","json",p],capture_output=True,text=True).stdout)
vs = [s for s in info["streams"] if s["codec_type"]=="video"]; au = [s for s in info["streams"] if s["codec_type"]=="audio"]
ok = True
def chk(c, msg):
    global ok
    print(("PASS " if c else "FAIL ") + msg); ok = ok and c
v = vs[0] if vs else {}
chk(len(vs)==1 and v.get("codec_name")=="h264", f"video codec {v.get('codec_name')}")
chk(v.get("width")==1080 and v.get("height")==1920, f"size {v.get('width')}x{v.get('height')}")
chk(v.get("r_frame_rate")=="30/1" and v.get("avg_frame_rate")=="30/1", f"fps {v.get('r_frame_rate')} avg {v.get('avg_frame_rate')}")
chk(len(au)==1 and au[0].get("codec_name")=="aac", f"audio tracks {len(au)} codec {[a.get('codec_name') for a in au]}")
chk(au and abs(float(au[0].get("start_time",0)))<0.001, f"audio start {au[0].get('start_time') if au else None}")
order=[]; sz=os.path.getsize(p)
with open(p,"rb") as fh:
    pos=0
    while pos < sz:
        fh.seek(pos); hdr=fh.read(8)
        if len(hdr)<8: break
        n,typ=struct.unpack(">I4s",hdr); typ=typ.decode("latin1")
        if n==1: n=struct.unpack(">Q",fh.read(8))[0]
        if n==0: n=sz-pos
        order.append(typ); pos+=n
chk("moov" in order and "mdat" in order and order.index("moov")<order.index("mdat"), f"atom order {order}")
chk(sz < 100*1024*1024, f"size {sz/1e6:.1f} MB")
d=float(info["format"]["duration"]); print(f"duration {d:.3f}s bitrate {int(info['format']['bit_rate'])/1e6:.2f} Mbps")
if exp is not None: chk(abs(d-exp)<=0.1, f"duration matches plan {exp:.3f} within 0.1s")
chk(24.0 <= d <= 35.0, "length 24-35 s")
sys.exit(0 if ok else 1)
