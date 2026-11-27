# 사용법: python3 tools/clip/make-voice.py 장면.json 출력.mp3 출력.srt [injoon|m1]
# 생애혜택 클립 무료 남자 목소리 — 사장님 11/27 확정: 기본은 수퍼톤 M1 (m1). 인준(injoon)은 예비
#  - injoon: 마이크로소프트 ko-KR-InJoonNeural (edge-tts, 무료, speech.platform.bing.com 허용 필요)
#  - m1: 수퍼톤 Supertonic-3 M1 (무료 공개 모델, 처음 한 번 huggingface.co 에서 받음)
# 장면.json 의 lines = [[자막, 나레이션], ...] — 나레이션 숫자는 한글로. 문장 사이 0.45초 쉼, 음량 -14 LUFS.
import json, sys, os, subprocess, tempfile
import numpy as np, soundfile as sf
cfg = json.load(open(sys.argv[1], encoding='utf-8')); out_mp3, out_srt = sys.argv[2], sys.argv[3]
voice = sys.argv[4] if len(sys.argv) > 4 else 'm1'  # 11/27 기본 M1
lines = [ln for sc in cfg['scenes'] for ln in sc['lines']]
tmp = tempfile.mkdtemp(); SR = 44100
def to_arr(path):
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', path, '-ac', '1', '-ar', str(SR), f'{tmp}/c.wav'], check=True)
    x, _ = sf.read(f'{tmp}/c.wav'); return x
if voice == 'm1':
    import supertonic
    tts = supertonic.TTS(); st = tts.get_voice_style('M1')
    def say(text, i):
        wav, _ = tts.synthesize(text, voice_style=st, lang='ko', speed=float(os.environ.get('VOICE_SPEED', '1.0')))
        tts.save_audio(wav, f'{tmp}/s{i}.wav'); return to_arr(f'{tmp}/s{i}.wav')
else:
    def say(text, i):
        cmd = ['edge-tts', '--voice', 'ko-KR-InJoonNeural', '--rate=' + os.environ.get('VOICE_RATE', '-5%'),
               '--text', text, '--write-media', f'{tmp}/s{i}.mp3']
        if os.environ.get('HTTPS_PROXY'): cmd[1:1] = ['--proxy', os.environ['HTTPS_PROXY']]
        subprocess.run(cmd, check=True, capture_output=True); return to_arr(f'{tmp}/s{i}.mp3')
def trim(x, th=0.01):
    idx = np.where(np.abs(x) > th)[0]
    return x[max(idx[0] - 800, 0): idx[-1] + 2000] if len(idx) else x
fmt = lambda s: '%02d:%02d:%02d,%03d' % (s // 3600, s % 3600 // 60, s % 60, round((s - int(s)) * 1000))
parts, srt, t = [], [], 0.0
for i, (sub, nar) in enumerate(lines):
    x = trim(say(nar, i)); dur = len(x) / SR
    srt.append(f'{i+1}\n{fmt(t)} --> {fmt(t+dur)}\n{nar}\n')
    parts += [x, np.zeros(int(SR * 0.45))]; t += dur + 0.45
sf.write(f'{tmp}/all.wav', np.concatenate(parts), SR)
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', f'{tmp}/all.wav', '-af', 'loudnorm=I=-14:TP=-1.5',
                '-b:a', '160k', out_mp3], check=True)
open(out_srt, 'w', encoding='utf-8').write('\n'.join(srt)); print('ok', voice, out_mp3, round(t, 1), 's', len(lines), 'lines')
