# 사용법: python3 tools/blog-card/add-ai-text.py blog/원고.txt [--table-key]
# 규칙(2026-11-09 사장님): 표마다 '설명 문단'과 표 내용을 한 문단으로 합쳐 직접 쓴다 — 같은 숫자는 '한눈에 정리'에 한 번, 표 아래 설명에 한 번만.
# AI 브리핑이 읽을 수 있게 표 그림 내용을 글자로 '▶ 표 핵심'에, 클립 자리를 인사말 바로 아래(한눈에 정리 위)에 넣는다(이미 있으면 건너뜀).
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
if '--table-key' in sys.argv and '▶ 표 핵심' not in s:  # 기본은 끔: 2026-11-09부터 표 설명은 '설명 문단 하나'로 직접 씀(중복 금지)
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
    mp4 = os.path.basename(clip).replace('.json', '.mp4')
    block = f"🎬 30초 영상으로 먼저 보기\n\n[클립 영상 자리 — {mp4}]\n\n바쁘시면 이 영상만 보셔도 핵심은 다 알 수 있어요. 자세한 숫자와 신청 방법은 아래에 정리했어요.\n\n"
    a2 = s.index('━ 본문 ━'); i = s.index('✅ 한눈에 정리', a2) if '✅ 한눈에 정리' in s else s.index('[구분선]', a2)
    s = s[:i] + block + s[i:]
    s = s.replace('■ 붙여넣기:', f"■ [클립 영상 자리]에는 {mp4} 를 동영상으로 넣기(네이버 글쓰기 위쪽 '동영상' 버튼)\n■ 붙여넣기:", 1)
open(p, 'w', encoding='utf-8').write(s)
print('ok', p)
