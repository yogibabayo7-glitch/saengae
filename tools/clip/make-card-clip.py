# 사용법: python3 tools/clip/make-card-clip.py 장면.json 출력.mp4
# 생애혜택 클립 (작업 규칙 문서 '최종 클립 화면 2026-11-04' 기준)
# - 세로 1080x1920, 카드 정중앙 고정(폭 960, y=480 칸), 움직임 없음
# - 위아래 바탕 = 요일색을 조금 옅게, 위 띠 가운데 주제 제목(연노랑 #FFF4C2 70px), 아래 띠 자막(흰색 70px 1~2줄)
# - 카드 뒤 진한 남색 3겹 그림자(아래 60·28·8px) + 흰 테두리 4px, 카드 안 요일색은 15% 옅게
# - 카드 판 고정 + 둘째 장부터 판 맨 위 가운데에 번호(하나·둘·셋…) (사용자 11/6)
# - 목소리: sherpa-onnx vits-mimic3-ko_KO-kss_low(무료 여자), 속도 0.9, 문장마다 0.45초 쉼, 음성 보정 후 -14 LUFS
# 장면.json: {"theme":"#4A8C12","title":"주제 제목","scenes":[{"img":"카드.png","lines":[["자막","나레이션(숫자는 한글)"],...]}]}
import json, sys, os, subprocess, wave, tempfile
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import sherpa_onnx

MODEL = os.environ.get('KSS_MODEL', '/home/claude/tts/vits-mimic3-ko_KO-kss_low')
FONT = '/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc'
W, H, CW, TOP, BOX = 1080, 1920, 960, 480, 960

cfg = json.load(open(sys.argv[1], encoding='utf-8'))
out = sys.argv[2]
base = os.path.dirname(os.path.abspath(sys.argv[1]))
tmp = tempfile.mkdtemp()
hexrgb = lambda h: tuple(int(h.lstrip('#')[i:i+2], 16) for i in (0, 2, 4))
theme = hexrgb(cfg['theme'])
LIGHT = float(cfg.get('band_light', os.environ.get('BAND_LIGHT', 0.2)))  # 위아래 바탕: 요일색 20% 옅게 (11/6 사장님: 38%와 비교해 보고 20%가 낫다고 확정)
band = tuple(int(c * (1 - LIGHT) + 255 * LIGHT) for c in theme)
TXT_SHADOW = tuple(int(c * .55) for c in theme)               # 연한 바탕에서도 흰 글씨가 또렷하게 — 요일색을 어둡게 한 그림자
font = lambda s: ImageFont.truetype(FONT, s)

def soften(img):  # 카드 안 요일색(진한 색) 15% 옅게
    a = np.asarray(img.convert('RGB')).astype(np.float32)
    d = np.sqrt(((a - np.array(theme)) ** 2).sum(-1))
    m = (d < 70)[..., None]
    a = np.where(m, a * .85 + 255 * .15, a)
    return Image.fromarray(a.astype(np.uint8))

def center_text(dr, text, y, size, fill, maxw=1000):
    f = font(size)
    lines = text.split('\n')
    lh = int(size * 1.3)
    y0 = y - lh * len(lines) // 2
    for i, t in enumerate(lines):
        w = dr.textlength(t, font=f)
        x, yy = (W - w) / 2, y0 + i * lh
        dr.text((x + 3, yy + 4), t, font=f, fill=TXT_SHADOW, stroke_width=3, stroke_fill=TXT_SHADOW)
        dr.text((x, yy), t, font=f, fill=fill, stroke_width=2, stroke_fill=TXT_SHADOW)

# 토스 미니앱 배지 (토스 외부 광고 가이드: 블랙 기본, 영상 하나에 1개, 아래쪽에 작게, 비율·각도·움직임 변경 금지)
BADGE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'app-kit', 'badge', 'toss-miniapp-badge-black.png')
BADGE_W = 300

def put_badge(img):
    b = Image.open(BADGE).convert('RGBA')
    b = b.resize((BADGE_W, round(b.height * BADGE_W / b.width)), Image.LANCZOS)
    img.alpha_composite(b, ((W - b.width) // 2, H - b.height - 36))

NUMS = ['하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉', '열']

def frame(card_path, sub, path, num=None, badge=False):
    # 가운데 카드 판은 크기·위치 고정(960x960, y=480) — 카드 그림만 그 안에서 바뀜
    bg = Image.new('RGB', (W, H), band)
    px, py, pw, ph = (W - CW) // 2, TOP, CW, BOX
    sh = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    for off, blur, alpha in ((60, 40, 90), (28, 18, 110), (8, 6, 140)):
        layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        ImageDraw.Draw(layer).rounded_rectangle([px, py + off, px + pw, py + ph + off], 28, fill=(11, 31, 58, alpha))
        sh = Image.alpha_composite(sh, layer.filter(ImageFilter.GaussianBlur(blur)))
    bg = Image.alpha_composite(bg.convert('RGBA'), sh)
    dr = ImageDraw.Draw(bg)
    dr.rounded_rectangle([px - 4, py - 4, px + pw + 4, py + ph + 4], 30, fill='white')
    card = soften(Image.open(os.path.join(base, card_path)))
    s = min(pw / card.width, ph / card.height)
    card = card.resize((int(card.width * s), int(card.height * s)), Image.LANCZOS)
    cw, ch = card.size
    mask = Image.new('L', card.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, cw, ch], 26, fill=255)
    bg.paste(card, (px + (pw - cw) // 2, py + (ph - ch) // 2), mask)
    dr = ImageDraw.Draw(bg)
    if num:  # 카드 맨 윗부분 가운데 번호 (하나·둘·셋…)
        f = font(52); tw = dr.textlength(num, font=f); bw, bh = tw + 80, 92
        bx, by = (W - bw) / 2, py - bh / 2
        dr.rounded_rectangle([bx - 4, by - 4, bx + bw + 4, by + bh + 4], (bh + 8) / 2, fill='white')
        dr.rounded_rectangle([bx, by, bx + bw, by + bh], bh / 2, fill=theme)
        dr.text(((W - tw) / 2, by + 10), num, font=f, fill='white')
    center_text(dr, cfg['title'], TOP // 2 - 20, 70, (255, 244, 194))
    sub_y = TOP + BOX + (H - TOP - BOX) // 2
    if badge: sub_y -= 50  # 배지 자리만큼 자막을 조금 위로
    center_text(dr, sub, sub_y, 70, 'white')
    if badge: put_badge(bg)
    bg.convert('RGB').save(path)

tts = sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(
    vits=sherpa_onnx.OfflineTtsVitsModelConfig(model=f'{MODEL}/ko_KO-kss_low.onnx', tokens=f'{MODEL}/tokens.txt', data_dir=f'{MODEL}/espeak-ng-data'),
    num_threads=2)))
sr = None; pcm = []; segs = []; t = 0.0; n = 0
for si, sc in enumerate(cfg['scenes']):
    num = None if si == 0 else NUMS[si - 1]  # 첫 장(대표)은 번호 없음, 다음부터 하나·둘·셋…
    last_scene = si == len(cfg['scenes']) - 1
    for li, (sub, say) in enumerate(sc['lines']):
        a = tts.generate(say, sid=0, speed=0.9)
        sr = a.sample_rate
        x = np.array(a.samples, dtype=np.float32)
        gap = np.zeros(int(sr * .45), dtype=np.float32)
        x = np.concatenate([x, gap]); dur = len(x) / sr
        pcm.append(x)
        img = os.path.join(tmp, f'f{n:02d}.png'); frame(sc['img'], sub, img, num, badge=cfg.get('badge', True) and last_scene and li == len(sc['lines']) - 1)
        segs.append((img, dur)); t += dur; n += 1
raw = os.path.join(tmp, 'raw.wav')
with wave.open(raw, 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
    w.writeframes((np.clip(np.concatenate(pcm), -1, 1) * 32767).astype(np.int16).tobytes())
voice = os.path.join(tmp, 'voice.m4a')
af = ('highpass=f=80,equalizer=f=250:t=q:w=1:g=-2,equalizer=f=3000:t=q:w=1:g=4,'
      'equalizer=f=7500:t=q:w=1:g=-3,acompressor=threshold=-18dB:ratio=3:attack=5:release=80,loudnorm=I=-14:TP=-1.5:LRA=7')
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', raw, '-af', af, '-ar', '44100', '-c:a', 'aac', '-b:a', '160k', voice], check=True)
lst = os.path.join(tmp, 'list.txt')
with open(lst, 'w') as f:
    for img, d in segs: f.write(f"file '{img}'\nduration {d:.3f}\n")
    f.write(f"file '{segs[-1][0]}'\n")
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-i', voice,
                '-vf', 'fps=30,format=yuv420p', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20',
                '-c:a', 'copy', '-shortest', '-movflags', '+faststart', out], check=True)
print('ok', out, f'{t:.1f}s', n, 'lines')
