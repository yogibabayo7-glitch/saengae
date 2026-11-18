# 사용법: python3 tools/clip/make-card-clip-hf.py 장면.json 목소리.(mp3|m4a|mp4) 출력.mp4 [자막.srt]
# 생애혜택 클립 — HyperFrames(무료, 내 컴퓨터에서 렌더링) 버전. 화면 규칙은 make-card-clip.py와 같음.
# - 세로 1080x1920, 카드 판 정중앙 고정(960x960, y=480) — 카드 자체는 확대·이동·흔들림 없음 (11/4 규칙 유지)
# - 바뀐 점: 카드가 바뀔 때 0.35초 부드럽게 겹쳐 바뀜, 자막은 0.25초 살짝 떠오름, 번호 배지는 톡 나타남
# - 목소리: 이미 만든 소리를 그대로 씀(타입캐스트 필재 mp3 등). 음높이는 건드리지 않고 음량만 -14 LUFS
# - 문장 시간: srt가 있으면 srt 순서대로, 없으면 소리의 쉼(무음)으로 자동으로 찾음
# - 마지막 장면 아래: 흰 둥근 띠 "토스 앱에서 생애혜택 안내소 검색" ('생애혜택 안내소'만 요일색, 11/17 규칙)
# - 비용 0원: HyperFrames는 Apache 2.0 무료. 'hyperframes cloud render'(HeyGen 서버, 유료)는 쓰지 않음
import json, sys, os, re, subprocess, shutil, tempfile, html
import numpy as np
from PIL import Image

HF_DIR = os.environ.get('HF_DIR', '/home/claude/hf')  # npm i hyperframes gsap 를 해 둔 폴더
NUMS = ['하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉', '열']

cfg_path, voice_in, out = sys.argv[1], sys.argv[2], sys.argv[3]
srt = sys.argv[4] if len(sys.argv) > 4 else None
cfg = json.load(open(cfg_path, encoding='utf-8'))
base = os.path.dirname(os.path.abspath(cfg_path))
hexrgb = lambda h: tuple(int(h.lstrip('#')[i:i+2], 16) for i in (0, 2, 4))
theme = hexrgb(cfg['theme'])
LIGHT = float(cfg.get('band_light', 0.2))
band = tuple(int(c * (1 - LIGHT) + 255 * LIGHT) for c in theme)
shadow = tuple(int(c * .55) for c in theme)
css = lambda c: '#%02x%02x%02x' % c

proj = tempfile.mkdtemp(prefix='hfclip-')
os.makedirs(f'{proj}/assets')
shutil.copy(f'{HF_DIR}/node_modules/gsap/dist/gsap.min.js', f'{proj}/gsap.min.js')
# 글꼴을 프로젝트에 같이 넣어 어느 컴퓨터에서든 같은 글씨로 나오게
FONT = os.environ.get('CLIP_FONT', '/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc')
shutil.copy(FONT, f'{proj}/assets/clipfont' + os.path.splitext(FONT)[1])
FONT_URL = 'assets/clipfont' + os.path.splitext(FONT)[1]

# 1) 목소리: 음높이 그대로, 음량만 -14 LUFS
voice = f'{proj}/assets/voice.m4a'
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', voice_in, '-vn', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=7',
                '-ar', '44100', '-c:a', 'aac', '-b:a', '160k', voice], check=True)
total = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', voice]))

# 2) 문장마다 시작 시간
lines = [(si, li, sub) for si, sc in enumerate(cfg['scenes']) for li, (sub, _) in enumerate(sc['lines'])]
if srt:
    ts = re.findall(r'(\d+):(\d+):(\d+)[,.](\d+)\s*-->', open(srt, encoding='utf-8-sig').read())
    starts = [int(h) * 3600 + int(m) * 60 + int(s) + int(ms) / 1000 for h, m, s, ms in ts]
    if len(starts) != len(lines):
        sys.exit(f'srt 문장 수({len(starts)})와 장면 문장 수({len(lines)})가 달라요. 장면.json 문장을 srt에 맞춰 주세요.')
    starts[0] = 0.0
else:
    log = subprocess.run(['ffmpeg', '-i', voice, '-af', 'silencedetect=n=-40dB:d=0.35', '-f', 'null', '-'],
                         capture_output=True, text=True).stderr
    ends = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', log) if float(x) < total - 0.3]
    starts = [0.0] + ends
    if len(starts) != len(lines):
        sys.exit(f'쉼으로 찾은 문장 수({len(starts)})와 장면 문장 수({len(lines)})가 달라요. srt를 함께 주세요.')
bounds = starts + [total]

# 3) 카드 그림: 카드 안 요일색 15% 옅게 (기존 규칙 그대로)
def soften(src, dst):
    a = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
    m = (np.sqrt(((a - np.array(theme)) ** 2).sum(-1)) < 70)[..., None]
    Image.fromarray(np.where(m, a * .85 + 255 * .15, a).astype(np.uint8)).save(dst)

# 장면마다 시작·끝
scene_t = {}
for k, (si, li, sub) in enumerate(lines):
    s, e = bounds[k], bounds[k + 1]
    a, b = scene_t.get(si, (s, e)); scene_t[si] = (min(a, s), max(b, e))

X = 0.35  # 카드가 겹쳐 바뀌는 시간
cards, subs, js = [], [], []
for si, sc in enumerate(cfg['scenes']):
    soften(os.path.join(base, sc['img']), f'{proj}/assets/card{si}.png')
    s, e = scene_t[si]
    d = (e - s) + (X if si < len(cfg['scenes']) - 1 else 0)
    cards.append(f'<div id="c{si}" class="clip card" data-start="{s:.3f}" data-duration="{d:.3f}" data-track-index="1">'
                 f'<img src="assets/card{si}.png"/></div>')
    if si > 0:
        js.append(f'tl.fromTo("#c{si}",{{opacity:0}},{{opacity:1,duration:{X},ease:"power1.inOut"}},{s:.3f});')
        cards.append(f'<div id="n{si}" class="clip num" data-start="{s:.3f}" data-duration="{e - s:.3f}" data-track-index="3">{NUMS[si - 1]}</div>')
        js.append(f'tl.fromTo("#n{si}",{{scale:.6,opacity:0}},{{scale:1,opacity:1,duration:.3,ease:"back.out(2.2)"}},{s + .1:.3f});')
for k, (si, li, sub) in enumerate(lines):
    s, e = bounds[k], bounds[k + 1]
    last = k == len(lines) - 1
    txt = '<br>'.join(html.escape(t) for t in sub.split('\n'))
    subs.append(f'<div id="s{k}" class="clip sub{" lastsub" if last else ""}" data-start="{s:.3f}" data-duration="{e - s:.3f}" data-track-index="2"><span>{txt}</span></div>')
    js.append(f'tl.fromTo("#s{k} span",{{opacity:0,y:24}},{{opacity:1,y:0,duration:.25,ease:"power2.out"}},{s:.3f});')
    if last:
        subs.append(f'<div id="toss" class="clip toss" data-start="{s:.3f}" data-duration="{e - s:.3f}" data-track-index="4">'
                    f'토스 앱에서 <b>생애혜택 안내소</b> 검색</div>')
        js.append(f'tl.fromTo("#toss",{{opacity:0,y:20}},{{opacity:1,y:0,duration:.3,ease:"power2.out"}},{s + .2:.3f});')

title = '<br>'.join(html.escape(t) for t in cfg['title'].split('\n'))
T, B = css(theme), css(shadow)
page = f'''<!doctype html>
<html lang="ko" data-resolution="portrait"><head><meta charset="UTF-8"/>
<meta name="viewport" content="width=1080, height=1920"/>
<script src="gsap.min.js"></script>
<style>
@font-face{{font-family:'ClipFont';src:url('{FONT_URL}');font-weight:700}}
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{width:1080px;height:1920px;overflow:hidden;background:{css(band)}}}
#root{{position:relative;width:1080px;height:1920px;font-family:'ClipFont',sans-serif;font-weight:700}}
.plate{{position:absolute;left:56px;top:476px;width:968px;height:968px;background:#fff;border-radius:30px;
  box-shadow:0 60px 80px rgba(11,31,58,.35),0 28px 36px rgba(11,31,58,.43),0 8px 12px rgba(11,31,58,.55)}}
.card{{position:absolute;left:60px;top:480px;width:960px;height:960px;border-radius:26px;overflow:hidden;background:#fff}}
.card img{{width:100%;height:100%;object-fit:contain;display:block}}
.ttl,.sub{{position:absolute;left:0;width:1080px;text-align:center;color:#fff;line-height:1.3;
  -webkit-text-stroke:2px {B};paint-order:stroke fill;text-shadow:3px 4px 0 {B},3px 4px 6px {B}}}
.ttl{{top:0;height:480px;display:flex;align-items:center;justify-content:center;font-size:70px;color:#FFF4C2}}
.sub{{top:1440px;height:480px;display:flex;align-items:center;justify-content:center;font-size:70px}}
.sub span{{display:inline-block}}
.lastsub{{height:380px}}
.num{{position:absolute;top:434px;left:50%;margin-left:-100px;width:200px;height:92px;border-radius:46px;background:{T};
  border:4px solid #fff;color:#fff;font-size:52px;display:flex;align-items:center;justify-content:center}}
.toss{{position:absolute;top:1790px;left:50%;margin-left:-330px;width:660px;height:84px;border-radius:42px;background:#fff;
  color:#333;font-size:40px;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 14px rgba(0,0,0,.18)}}
.toss b{{color:{T};margin:0 10px}}
</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{total:.3f}" data-width="1080" data-height="1920">
<div class="ttl">{title}</div>
<div class="plate"></div>
{''.join(cards)}
{''.join(subs)}
<audio id="vo" class="clip" data-start="0" data-duration="{total:.3f}" data-track-index="9" src="assets/voice.m4a"></audio>
</div>
<script>
window.__timelines = window.__timelines || {{}};
const tl = gsap.timeline({{ paused: true }});
{chr(10).join(js)}
window.__timelines["main"] = tl;
tl.seek(0);
</script></body></html>'''
open(f'{proj}/index.html', 'w', encoding='utf-8').write(page)
shutil.copy(f'{HF_DIR}/t1/hyperframes.json', proj) if os.path.exists(f'{HF_DIR}/t1/hyperframes.json') else None
env = dict(os.environ, HYPERFRAMES_NO_TELEMETRY='1', HYPERFRAMES_SKIP_SKILLS='1')
q = os.environ.get('HF_QUALITY', 'looks')
if os.environ.get('HF_ONLY_PROJECT'): print('project:', proj); sys.exit(0)
subprocess.run(['npx', '--prefix', HF_DIR, 'hyperframes', 'render', '-o', os.path.abspath(out), '-q', q, '-f', '30'],
               cwd=proj, env=env, check=True)
# HyperFrames가 소리를 섞으며 음량을 바꾸므로, 화면은 그대로 두고 -14 LUFS로 맞춘 목소리를 다시 붙임
tmpv = os.path.abspath(out) + '.v.mp4'
os.replace(os.path.abspath(out), tmpv)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', tmpv, '-i', voice, '-map', '0:v', '-map', '1:a', '-c', 'copy',
                '-shortest', '-movflags', '+faststart', os.path.abspath(out)], check=True)
os.remove(tmpv)
print('ok', out, f'{total:.1f}s', len(lines), 'lines', 'project:', proj)
