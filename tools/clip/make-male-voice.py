# 사용법: python3 tools/clip/make-male-voice.py 장면.json 출력.mp3 출력.srt
# 무료 중후한 남자 목소리(사장님 11/23): 무료 KSS 모델(sherpa-onnx)로 읽은 뒤
# rubberband로 음높이를 한 옥타브쯤 낮추고(말소리 모양은 유지) 울림을 8% 낮춰 중저음 남자 목소리로 바꿈. 비용 0원.
# 장면.json 의 lines = [[자막, 나레이션], ...] — 나레이션 숫자는 한글로.
import json, sys, os, subprocess, tempfile
import numpy as np, soundfile as sf, sherpa_onnx
cfg = json.load(open(sys.argv[1], encoding='utf-8')); out_mp3, out_srt = sys.argv[2], sys.argv[3]
PITCH = float(os.environ.get('MALE_PITCH', '0.47')); FORM = float(os.environ.get('MALE_FORMANT', '0.92'))
d = os.environ.get('KSS_MODEL', '/home/claude/tts/vits-mimic3-ko_KO-kss_low') + '/'
tts = sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(
    vits=sherpa_onnx.OfflineTtsVitsModelConfig(model=d + 'ko_KO-kss_low.onnx', lexicon='', tokens=d + 'tokens.txt',
                                               data_dir=d + 'espeak-ng-data'), num_threads=4)))
tmp = tempfile.mkdtemp(); parts = []; t = 0.0; srt = []
fmt = lambda s: '%02d:%02d:%02d,%03d' % (s // 3600, s % 3600 // 60, s % 60, round((s - int(s)) * 1000))
lines = [ln for sc in cfg['scenes'] for ln in sc['lines']]
for i, (sub, nar) in enumerate(lines):
    a = tts.generate(nar, sid=0, speed=float(os.environ.get('VOICE_SPEED', '0.9')))
    sf.write(f'{tmp}/r{i}.wav', np.array(a.samples), a.sample_rate)
    af = (f'aresample=44100,rubberband=pitch={PITCH}:formant=preserved:pitchq=quality,'
          f'asetrate=44100*{FORM},aresample=44100,atempo={1/FORM}')
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', f'{tmp}/r{i}.wav', '-af', af, '-ac', '1', f'{tmp}/m{i}.wav'], check=True)
    x, sr = sf.read(f'{tmp}/m{i}.wav'); dur = len(x) / sr
    srt.append(f'{i+1}\n{fmt(t)} --> {fmt(t+dur)}\n{nar}\n')
    parts += [x, np.zeros(int(sr * 0.45))]; t += dur + 0.45
sf.write(f'{tmp}/all.wav', np.concatenate(parts), sr)
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', f'{tmp}/all.wav', '-af',
                'highpass=f=50,equalizer=f=120:t=q:w=1:g=3,equalizer=f=3000:t=q:w=1:g=3,equalizer=f=7500:t=q:w=2:g=-3,'
                'acompressor,loudnorm=I=-14:TP=-1.5', '-b:a', '160k', out_mp3], check=True)
open(out_srt, 'w', encoding='utf-8').write('\n'.join(srt)); print('ok', out_mp3, round(t, 1), 's', len(lines), 'lines')
