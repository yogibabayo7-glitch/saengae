# 사용법: python3 tools/blog-card/make-saengae-html.py blog/원고.txt 사진이름표.json 출력.html
# '블로그 자동 올리기' 프로그램(생애혜택 안내소)이 읽는 원고 형식으로 바꾼다:
#   <p id="t">제목</p> / <div id="a">본문</div><hr><p id="g">태그</p>
#   사진 자리 = <p>[ 사진 넣는 자리 · 파일이름 ]</p>  (동영상 자리는 프로그램이 건너뜀 → 사장님이 직접 넣기)
# 사진이름표.json: {"대표": "01-...webp", "1": "02-...webp", ...}  (표 이미지 번호 → 폴더 사진 파일 이름)
# 규칙: 전부 왼쪽 정렬, 소제목 앞 빈 줄, 요일색 소제목
import sys, re, json, html

src, names, out = sys.argv[1], json.load(open(sys.argv[2], encoding='utf-8')), sys.argv[3]
COLOR = {'money': '#D9480F', 'digital': '#1C5FD4', 'job': '#4A8C12', 'news': '#DE5353'}
theme = COLOR[names.get('theme', 'money')]
raw = open(src, encoding='utf-8').read()
title = raw.split('━ 제목 ━')[1].split('━ 본문 ━')[0].strip('━ \n')
body = raw.split('━ 본문 ━')[1].split('━ 태그')[0].strip('━ \n')
tags = raw.split('━ 태그')[1].split('\n', 1)[1].strip() if '━ 태그' in raw else ''

# ── '📚 함께 보면 좋은 글' 자동으로 붙이기 (사장님 11/25: 앞으로 모든 원고에 자동으로)
#    blog/글주소-연결줄.json 에서 이 글 카테고리의 줄을 찾아, 그 줄에서 주소가 있는 가장 최근 글(자기 자신 제외)을 '▶ 이어서 보기'로.
#    모양: '▶ 이어서 보기: 제목' 한 줄 + 그 밑 줄에 주소(링크). 블로그 소개 글도 같은 모양으로 맨 끝에.
import os
_notes = raw.split('━ 제목 ━')[0]
_reg_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'blog', '글주소-연결줄.json')
if not re.search(r'^■ (마감글|카테고리: 정책 속보)', _notes, re.M) and os.path.exists(_reg_path):
    reg = json.load(open(_reg_path, encoding='utf-8'))
    cat = re.search(r'■ 카테고리:\s*([^→/\n]+)', _notes)
    line = None
    if cat:
        for k, v in reg['카테고리→줄'].items():
            if k in cat.group(1): line = v
    m_line = re.search(r'^■ 연결 줄:\s*(\S+)', _notes, re.M)   # 원고 메모로 줄을 직접 지정할 수도 있음
    if m_line: line = m_line.group(1)
    # 이 글이 이미 연결 줄에 올라 있으면 그 줄을 쓰고, 줄에서 이 글 바로 뒤(더 예전) 글부터 찾음
    own = next((k for k, v in reg['posts'].items() if v['t'] == title), None)
    seq = reg['lines'].get(line, [])
    if own:
        for ln, ks in reg['lines'].items():
            if own in ks: line, seq = ln, ks[ks.index(own)+1:]; break
    tgt = None
    for key in seq:
        pst = reg['posts'][key]
        if pst['u'] and pst['t'] != title:
            tgt = pst; break
    sec = '📚 함께 보면 좋은 글\n\n'
    if tgt: sec += f"▶ 이어서 보기: {tgt['t']}\n{tgt['u']}\n\n"
    sec += f"▶ 생애혜택 안내소는 이런 블로그예요 (월 지원금 · 수 디지털 · 금 재취업)\n{reg['intro']['u']}\n"
    if '📚 함께 보면 좋은 글' in body:
        body = re.sub(r'📚 함께 보면 좋은 글.*?(?=\n\[구분선\]|\Z)', lambda _m: sec.rstrip('\n'), body, count=1, flags=re.S)
    else:
        body = body.rstrip() + '\n\n[구분선]\n\n' + sec
    print('📚 이어서 보기 →', tgt['d']+' '+tgt['t'] if tgt else '(줄 끝: 소개 글만)', '| 줄:', line)

# ── 빠뜨림 막기 (사장님 11/25): '📚 함께 보면 좋은 글'에 '▶ 이어서 보기' 줄이 없으면 원고를 만들지 않는다.
#    마감글·정책 속보는 예외 — 원고 맨 위 ■ 메모에 '마감글' 또는 '카테고리: 정책 속보'가 있으면 통과(속보는 연결 줄에 안 넣음, 11/25 규칙).
#    주소 자리([... 주소 ...])가 남아 있으면 경고: 발행기록 시트 '네이버 글 주소' 칸에서 찾아 넣을 것.
if not re.search(r'^■ (마감글|카테고리: 정책 속보)', raw.split('━ 제목 ━')[0], re.M):
    if '📚 함께 보면 좋은 글' not in body or '▶ 이어서 보기' not in body:
        sys.exit("❌ 멈춤: '📚 함께 보면 좋은 글'에 '▶ 이어서 보기' 줄이 없어요. 발행기록 시트 J칸(이어서 보기)과 I칸(글 주소)을 보고 넣으세요.")
    if re.search(r'\[[^\]]*주소[^\]]*\]', body):
        print("⚠ 경고: 아직 채우지 못한 글 주소 자리가 있어요 → 발행기록 시트 I칸 확인 / 없으면 사장님께 그 글 주소를 여쭤보기")

P = 'style="font-size:16px;line-height:1.9;margin:0 0 12px;text-align:left"'
E = '<p><br></p>'
def esc(t):
    t = html.escape(t)
    return re.sub(r'(https?://[^\s<]+)', r'<a href="\1">\1</a>', t)

# '▶ 제목' 다음 줄이 주소 하나뿐이면 → 제목 글자 속에 링크를 숨김(붙여 넣어도 링크 카드 안 뜨게, 사장님 11/18·11/25)
# (사장님 11/25 01:07) 숨긴 링크 말고: '▶ 제목' 줄 그대로 두고 그 밑 줄에 주소를 링크로 보이게 → 합치지 않음
# body = re.sub(r'(▶[^\n]*)\n(https?://\S+)\s*(?=\n|$)', lambda m: m.group(1)+' ⟦'+m.group(2)+'⟧', body)
def linkify(l):
    m = re.match(r'(▶\s*)(.*?)\s*⟦(\S+)⟧$', l)
    if not m: return None
    return f'<p {P}>{m.group(1)}<a href="{m.group(3)}" style="color:{theme};text-decoration:underline">{html.escape(m.group(2))}</a></p>'

outp = []
for block in re.split(r'\n\s*\n', body):
    lines = [l.strip() for l in block.strip().splitlines() if l.strip()]
    if not lines: continue
    if lines[0] == '✅ 한눈에 정리':
        outp += [E, f'<p {P}><b style="font-size:18px;color:{theme}">✅ 한눈에 정리</b></p>']
        outp += [f'<p {P}>{esc(l)}</p>' for l in lines[1:]]
        continue
    for l in lines:
        if l == '[대표 이미지]':
            outp.append(f'<p>[ 사진 넣는 자리 · {names["대표"]} ]</p>')
        elif m := re.match(r'\[표 이미지 (\w+): .+\]', l):
            outp.append(f'<p>[ 사진 넣는 자리 · {names[m.group(1)]} ]</p>')
        elif l.startswith('[클립 영상 자리'):
            mp4 = l.split('—')[-1].strip(' ]')
            outp.append(f'<p>[ 사진 넣는 자리 · 클립 영상(직접 넣기) · {mp4} ]</p>')
        elif l.startswith('[사진 설명]'):
            continue  # 사진 밑 설명은 프로그램이 사진 설명 칸에 넣음
        elif l.startswith('👉 쉽게 말하면'):
            rest = l[len('👉 쉽게 말하면'):].lstrip(':： ')
            outp.append(f'<table style="width:100%;border-collapse:collapse;border:0;margin:4px 0 14px"><tr><td style="width:6px;padding:0;background-color:{theme};border:0"></td><td style="padding:10px 14px;background-color:#fff8e1;border:0;font-size:16px;line-height:1.75;text-align:left"><b style="color:{theme}">👉 쉽게 말하면:</b> {esc(rest)}</td></tr></table>')
        elif linkify(l):
            outp.append(linkify(l))
        elif l == '[구분선]':
            outp.append('<hr>')
        elif l.startswith('[') and l.endswith(']'):
            outp.append(f'<p {P}><span style="color:#999999">{esc(l)}</span></p>')
        elif re.match(r'^[^\w\s\[·▶👉]', l) and len(l) < 40:  # 이모지로 시작하는 소제목
            outp += [E, f'<p {P}><b style="font-size:19px;color:{theme}">{esc(l)}</b></p>']
        else:
            outp.append(f'<p {P}>{esc(l)}</p>')

doc = f'''<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><title>{html.escape(title)}</title></head><body>
<p id="t">{html.escape(title)}</p>
<div id="a">
{chr(10).join(outp)}
</div>
<hr>
<p id="g">{html.escape(tags)}</p>
</body></html>
'''
open(out, 'w', encoding='utf-8').write(doc)
print('ok', out, len(outp), 'blocks')
