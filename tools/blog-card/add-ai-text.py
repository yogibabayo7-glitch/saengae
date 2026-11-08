# 사용법: python3 tools/blog-card/add-ai-text.py blog/원고.txt
# AI 브리핑이 읽을 수 있게 표 그림 내용을 글자로 '▶ 표 핵심'에, 클립 나레이션을 '영상 내용'으로 원고에 넣는다(이미 있으면 건너뜀).
import sys, re, json, glob, os
p = sys.argv[1]; s = open(p, encoding='utf-8').read()
blog = os.path.dirname(p); date = os.path.basename(p)[:10]
clean = lambda t: re.sub(r'\s+', ' ', re.sub(r'<br>', ' ', t.replace('*', ''))).strip()
rows = {}
for j in glob.glob(f'{blog}/{date}-*-표.json') + glob.glob(f'{blog}/{date}-*표*.json'):
    try: d = json.load(open(j, encoding='utf-8'))
    except Exception: continue
    for t in d.get('tables', []):
        head = t.get('head', [])
        if len(head) > 2:
            txt = ' / '.join(f"{clean(r[0])} – " + ', '.join(f"{clean(h)}: {clean(v)}" for h, v in zip(head[1:], r[1:])) for r in t['rows'])
        else:
            txt = ' / '.join(f"{clean(r[0])} – {clean(' '.join(r[1:]))}" for r in t['rows'])
        note = clean(re.sub(r'·\s*', '', t.get('note', ''))) if t.get('note') else ''
        rows[t['file']] = txt + (f". {note}" if note and len(note) < 120 else '')
if '▶ 표 핵심' not in s:
    out = []; pending = None
    for line in s.split('\n'):
        m = re.match(r'\[표 이미지 \d+: (.+?)\]', line)
        if m: pending = rows.get(m.group(1))
        if line.strip() == '[구분선]' and pending:
            out += [f'▶ 표 핵심: {pending}', '']; pending = None
        out.append(line)
    s = '\n'.join(out)
clips = glob.glob(f'{blog}/{date}-*-클립.json')
key = lambda c: os.path.basename(c)[:-len('-클립.json')]
clip = next((c for c in clips if os.path.basename(p).startswith(key(c))), None)
if clip and '🎬' not in s:
    c = json.load(open(clip, encoding='utf-8'))
    say = ' '.join(l[1] for sc in c['scenes'] for l in sc['lines'])
    mp4 = os.path.basename(clip).replace('.json', '.mp4')
    block = f"🎬 30초 영상으로 한 번에 보기\n\n[클립 영상 자리 — {mp4}]\n\n영상 내용: {say}\n\n[구분선]\n\n"
    s = s.replace('📱 ', block + '📱 ', 1) if '📱 ' in s else s
    s = s.replace('■ 붙여넣기:', f"■ [클립 영상 자리]에는 {mp4} 를 동영상으로 넣기(네이버 글쓰기 위쪽 '동영상' 버튼)\n■ 붙여넣기:", 1)
open(p, 'w', encoding='utf-8').write(s)
print('ok', p)
