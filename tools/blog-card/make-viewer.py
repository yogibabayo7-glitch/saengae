# 사용법: python3 tools/blog-card/make-viewer.py  (저장소 뿌리에서)
# blog/날짜-*.txt 원고를 읽어 이미지까지 보이는 미리보기 페이지를 viewer/ 폴더에 만든다.
import re, html, shutil, json, glob, os, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BLOG = os.path.join(ROOT, 'blog')
OUT = os.path.join(ROOT, 'viewer')
DAYS = '월화수목금토일'
COLOR = {'money': '#d9480f', 'digital': '#1c5fd4', 'job': '#4a8c12', 'guide': '#0f8a6c', 'news': '#de5353'}

shutil.rmtree(OUT, ignore_errors=True)
os.makedirs(os.path.join(OUT, 'img'))

HID = re.compile(r'⟦([^|⟧]+)\|(https?://[^⟧\s]+)⟧')  # 글자에 숨긴 링크: ⟦보이는 글자|주소⟧ (사장님 11/26 '글씨에 링크')
def esc(s):
    links = []
    def keep(m):
        links.append((m.group(1), m.group(2))); return f'\x00{len(links)-1}\x00'
    s = html.escape(HID.sub(keep, s))
    s = re.sub(r'(https?://[^\s<]+)', r'<a href="\1" target="_blank">\1</a>', s)
    return re.sub(r'\x00(\d+)\x00', lambda m: f'<a href="{html.escape(links[int(m.group(1))][1])}" target="_blank">{html.escape(links[int(m.group(1))][0])}</a>', s)
def unhide(s): return HID.sub(lambda m: m.group(1), s)

# 사장님(11/25): 원고 페이지에는 '이번 주(월~일, 한국 시간) 쓸 글'만 보이게 — 지난 주 글·다음 주 글은 숨김(많아지면 찾기 힘듦).
#   원고 파일은 저장소에 그대로 둠(매일 점검이 씀). SHOW_FROM/SHOW_ALSO 로 지난 글을 다시 넣지 않는다.
_today = (datetime.datetime.utcnow() + datetime.timedelta(hours=9)).date()
_mon = _today - datetime.timedelta(days=_today.weekday())
SHOW_FROM, SHOW_TO = _mon.isoformat(), (_mon + datetime.timedelta(days=6)).isoformat()
posts = []
for path in sorted(glob.glob(os.path.join(BLOG, '20??-??-??-*.txt'))):
    name = os.path.basename(path)
    date = name[:10]
    if not (SHOW_FROM <= date <= SHOW_TO): continue
    raw = open(path, encoding='utf-8').read()
    if '━ 제목 ━' not in raw or '━ 본문 ━' not in raw: continue
    head, rest = raw.split('━ 제목 ━', 1)
    title = rest.split('━ 본문 ━')[0].strip('━ \n')
    body = rest.split('━ 본문 ━')[1].split('━ 태그')[0].strip('━ \n')
    tags = rest.split('━ 태그')[1].split('\n', 1)[1].strip() if '━ 태그' in rest else ''
    notes = [l[1:].strip() for l in head.splitlines() if l.startswith('■')]
    rep = re.search(r'대표 이미지:\s*(\S+\.png)', head)
    card = [rep.group(1)] if rep and os.path.exists(os.path.join(BLOG, rep.group(1))) else \
        [f for f in os.listdir(BLOG) if f.startswith(date) and f.endswith('-카드.png')]
    cardjson = card[0].replace('.png', '.json') if card else None
    theme = 'guide'
    if cardjson and os.path.exists(os.path.join(BLOG, cardjson)):
        theme = json.load(open(os.path.join(BLOG, cardjson), encoding='utf-8')).get('theme', 'guide')

    def img(f):
        shutil.copy(os.path.join(BLOG, f), os.path.join(OUT, 'img', f))
        return f'<figure><img src="img/{html.escape(f)}" alt="{html.escape(f)}" loading="lazy"></figure>'

    parts, plain = [], []
    for block in re.split(r'\n\s*\n', body):
        lines = block.strip().splitlines()
        if not lines: continue
        out = []
        for l in lines:
            l = l.strip()
            if l == '[대표 이미지]' and card:
                out.append(img(card[0])); plain.append('[대표 이미지]')
            elif m := re.match(r'\[표 이미지 \d+: (.+?)\]', l):
                out.append(img(m.group(1))); plain.append(l.split(':')[0] + ']')
            elif l.startswith('[사진 설명]'):
                cap = l[len('[사진 설명]'):].strip()
                out.append(f'<div class="cap"><span>사진 설명</span><p>{esc(cap)}</p><button data-copy="{html.escape(cap)}">복사</button></div>')
            elif l == '[구분선]':
                out.append('<div class="hr"><i></i><b>◆</b><i></i></div>'); plain.append('[구분선]')
            elif l.startswith('[') and l.endswith(']'):
                out.append(f'<p class="todo">{esc(l)}</p>'); plain.append(l)
            elif l.startswith('👉 쉽게 말하면'):
                rest = l[len('👉 쉽게 말하면'):].lstrip(':： ')
                _c = COLOR.get(theme, '#de5353')
                # 사장님 11/25: 글 길이에 따라 막대가 아래로 같이 늘어나게 → 2칸 표(왼쪽 좁은 칸 = 글 색 막대, 오른쪽 = 연노랑 글)
                out.append(f'<table class="easy" style="width:100%;border-collapse:collapse;border:0;margin:4px 0 14px"><tr><td style="width:6px;padding:0;background-color:{_c};border:0"></td><td style="padding:6px 12px;border:0;font-size:16px;line-height:1.75"><b style="color:{_c}">👉 쉽게 말하면:</b> {esc(rest)}</td></tr></table>'); plain.append(unhide(l))
            else:
                cls = ' class="h"' if re.match(r'^[^\w\s\[·▶①②③④⑤"\'(]', l) and len(l) < 40 else ''
                out.append(f'<p{cls}>{esc(l)}</p>'); plain.append(unhide(l))
        parts.append('\n'.join(out))
        plain.append('')
    d = datetime.date.fromisoformat(date)
    key = ['mon','tue','wed','thu','fri','sat','sun'][d.weekday()] + d.strftime('%m%d')
    if any(q['key'] == key for q in posts): key += '-' + str(sum(q['key'].startswith(key) for q in posts) + 1)
    posts.append(dict(key=key, label=f'{d.month}/{d.day}({DAYS[d.weekday()]})' + (' 마감' if notes and '마감' in notes[0] else ''), title=title,
                      notes=notes, body='\n'.join(parts), plain='\n'.join(plain).strip(),
                      tags=tags, color=COLOR.get(theme, '#0f8a6c')))

tabs = ''.join(f'<a class="tab" href="#{p["key"]}" style="--c:{p["color"]}">{p["label"]}<small>{html.escape(p["title"][:14])}…</small></a>' for p in posts)
sections = ''
for p in posts:
    notes = ''.join(f'<li>{esc(n)}</li>' for n in p['notes'])
    sections += f'''<section id="{p['key']}" style="--c:{p['color']}">
<details class="notes"><summary>📋 올리기 전 확인할 것</summary><ul>{notes}</ul></details>
<div class="label">제목 <button data-copy="{html.escape(p['title'])}">제목 복사</button></div>
<h1>{html.escape(p['title'])}</h1>
<div class="label">본문 <span><button class="rich">본문 색 포함 복사</button> <button data-copy="{html.escape(p['plain'])}">본문 글자 전체 복사</button></span></div>
<article>{p['body']}</article>
<div class="label">태그 <button data-copy="{html.escape(p['tags'])}">태그 복사</button></div>
<p class="tags">{html.escape(p['tags'])}</p>
</section>'''

page = f'''<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>생애혜택 안내소 블로그 원고</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700;900&display=swap" rel="stylesheet">
<style>
*{{box-sizing:border-box}}body{{margin:0;font-family:'Noto Sans KR',sans-serif;background:#f4f5f7;color:#222;word-break:keep-all}}
header{{position:sticky;top:0;z-index:5;background:#fff;border-bottom:1px solid #e5e5e5;padding:10px 12px}}
header h2{{margin:0 0 8px;font-size:15px;color:#555}}
.tabs{{display:flex;gap:8px;overflow-x:auto}}
.tab{{flex:1;min-width:110px;text-decoration:none;color:#333;border:2px solid #ddd;border-radius:14px;padding:8px 10px;font-weight:900;font-size:17px;text-align:center}}
.tab small{{display:block;font-weight:400;font-size:12px;color:#888;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}}
.tab.on{{background:var(--c);border-color:var(--c);color:#fff}}.tab.on small{{color:#ffffffcc}}
main{{max-width:720px;margin:0 auto;padding:14px 12px 60px}}
section{{display:none}}section.on{{display:block}}
.notes{{background:#fffbe6;border:1px solid #f3e1a0;border-radius:12px;padding:10px 14px;margin-bottom:16px;font-size:14px}}
.notes summary{{font-weight:700;cursor:pointer}}.notes li{{margin:6px 0}}
.label{{display:flex;justify-content:space-between;align-items:center;font-size:13px;color:#888;margin:18px 0 6px;font-weight:700}}
h1{{font-size:22px;line-height:1.4;margin:0;background:#fff;padding:16px;border-radius:12px;border-left:6px solid var(--c)}}
article{{background:#fff;border-radius:12px;padding:18px 16px}}
article p{{font-size:16px;line-height:1.75;margin:0 0 10px}}
article p.h{{font-size:19px;font-weight:900;color:var(--c);margin-top:6px}}
article table.easy td{{vertical-align:top}}
article p.todo{{background:#fff0f0;color:#c92a2a;border:1px dashed #f08c8c;border-radius:8px;padding:6px 10px;font-size:14px}}
figure{{margin:6px 0 4px}}figure img{{width:100%;display:block;border-radius:10px;box-shadow:0 2px 10px #0002}}
.cap{{background:#f1f3f5;border-radius:8px;padding:8px 10px;margin:0 0 14px;font-size:13px;color:#555;display:flex;gap:8px;align-items:flex-start}}
.cap span{{flex:none;font-weight:700;color:#868e96}}.cap p{{margin:0;font-size:13px;line-height:1.55;flex:1}}
.hr{{display:flex;align-items:center;gap:10px;margin:22px 20%}}.hr i{{flex:1;height:1px;background:#ccc}}.hr b{{color:#aaa;font-size:10px}}
.tags{{background:#fff;border-radius:12px;padding:12px 16px;color:var(--c);line-height:1.8;margin:0}}
button{{border:0;background:var(--c,#333);color:#fff;border-radius:8px;padding:6px 12px;font-size:13px;font-weight:700;cursor:pointer;flex:none}}
.cap button{{padding:4px 8px;font-size:12px}}
.toast{{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#222;color:#fff;padding:10px 18px;border-radius:20px;font-size:14px;opacity:0;transition:.2s;pointer-events:none}}
.toast.on{{opacity:.92}}
a{{color:#1c5fd4}}
</style></head><body>
<header><h2>생애혜택 안내소 · 블로그 원고 (눌러서 보기)</h2><nav class="tabs">{tabs}</nav></header>
<main>{sections}</main><div class="toast" id="t">복사했어요</div>
<script>
const keys=[...document.querySelectorAll('section')].map(s=>s.id);
function show(){{let k=location.hash.slice(1);if(!keys.includes(k))k=keys[0];
document.querySelectorAll('section').forEach(s=>s.classList.toggle('on',s.id===k));
document.querySelectorAll('.tab').forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+k));scrollTo(0,0);}}
addEventListener('hashchange',show);show();
document.addEventListener('click',async e=>{{const r=e.target.closest('button.rich');if(!r)return;
const t=document.getElementById('t');const a=r.closest('section').querySelector('article').cloneNode(true);
a.querySelectorAll('figure').forEach((f,i)=>{{const q=document.createElement('p');q.textContent=i?'[표 이미지 '+i+']':'[대표 이미지]';f.replaceWith(q)}});
a.querySelectorAll('.cap').forEach(c=>{{const q=document.createElement('p');q.textContent='[사진 설명] '+c.querySelector('p').textContent;c.replaceWith(q)}});
a.querySelectorAll('.hr').forEach(h=>{{const q=document.createElement('p');q.textContent='[구분선]';h.replaceWith(q)}});
const cc=getComputedStyle(r.closest('section')).getPropertyValue('--c').trim()||'#de5353';
a.querySelectorAll('p.h').forEach(h=>{{h.innerHTML='<b style="font-size:19px;color:'+cc+'">'+h.innerHTML+'</b>'}});
a.querySelectorAll('p').forEach(q=>{{q.removeAttribute('class');q.setAttribute('style','color:#333333;font-size:16px;line-height:1.9;text-align:left')}});
a.querySelectorAll('td').forEach(td=>{{if(!td.style.backgroundColor)td.style.color='#333333'}});
a.querySelectorAll('table').forEach(t=>t.removeAttribute('class'));
const htmlStr='<div style="color:#333333">'+a.innerHTML+'</div>';try{{await navigator.clipboard.write([new ClipboardItem({{'text/html':new Blob([htmlStr],{{type:'text/html'}}),'text/plain':new Blob([a.innerText],{{type:'text/plain'}})}})]);t.textContent='색 포함 복사! 네이버에서 Ctrl+V(Shift 없이)';}}
catch(_){{t.textContent='복사가 안 돼요. 글자 전체 복사를 써 주세요';}}t.classList.add('on');setTimeout(()=>t.classList.remove('on'),2200);}});
document.addEventListener('click',async e=>{{const b=e.target.closest('button[data-copy]');if(!b)return;
const t=document.getElementById('t');try{{await navigator.clipboard.writeText(b.dataset.copy);t.textContent='복사했어요';}}
catch(_){{t.textContent='복사가 안 돼요. 글자를 길게 눌러 복사해 주세요';}}t.classList.add('on');setTimeout(()=>t.classList.remove('on'),1500);}});
</script></body></html>'''
open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8').write(page)
print('ok', len(posts), 'posts →', OUT)
