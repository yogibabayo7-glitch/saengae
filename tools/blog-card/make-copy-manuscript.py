# 사용법: python3 tools/blog-card/make-copy-manuscript.py 프로그램용원고.html 사진폴더 출력.html
# 사장님 11/27 17:02: "그전에 블로그 원고처럼 만들어줘" — 버튼·자바스크립트 없이, 마우스로 드래그해서 복사하는 원고.
#   제목 상자 / '── 여기부터 복사 ──' 본문 '── 여기까지 복사 ──' / 태그 상자 / 맨 아래 사진 미리보기(복사 범위 밖)
import sys, re, os, base64, html
src, photo_dir, out = sys.argv[1], sys.argv[2], sys.argv[3]
s = open(src, encoding='utf-8').read()
title = html.unescape(re.search(r'<p id="t">(.*?)</p>', s, re.S).group(1))
body = re.search(r'<div id="a">(.*?)</div>\s*<hr>\s*<p id="g">', s, re.S).group(1)
tags = html.unescape(re.search(r'<p id="g">(.*?)</p>', s, re.S).group(1))
# 사진 자리: 굵은 회색 한 줄로 (네이버에 붙여도 눈에 띄게, 사진 넣고 지우기)
body = re.sub(r'<p>\[ 사진 넣는 자리 · (.*?) \]</p>',
              lambda m: f'<p style="font-size:15px;line-height:1.9;margin:0 0 12px;text-align:left;color:#999999"><b>[여기에 사진 넣기 · {m.group(1)}]</b></p>', body)
box = 'border:2px dashed #999;padding:14px 16px;background:#fff'
mark = 'color:#888;margin:14px 0 6px;font-size:14px'
thumbs = ''
for f in sorted(os.listdir(photo_dir)):
    if f.lower().endswith('.webp'):
        b64 = base64.b64encode(open(os.path.join(photo_dir, f), 'rb').read()).decode()
        thumbs += f'<div style="display:inline-block;width:200px;margin:6px;vertical-align:top;font-size:12px;color:#555"><img src="data:image/webp;base64,{b64}" style="width:200px;border:1px solid #ddd"><br>{html.escape(f)}</div>'
page = f'''<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><title>{html.escape(title)}</title></head>
<body style="font-family:'Malgun Gothic',sans-serif;max-width:760px;margin:24px auto;padding:0 12px;line-height:1.7;color:#333">
<div style="background:#FFF4C2;border:1px solid #E6D58A;padding:12px 14px;font-size:15px">
<b>붙여넣는 법</b><br>
① 제목: 점선 상자 안 제목 글자를 마우스로 드래그 → Ctrl+C → 네이버 제목 칸에 Ctrl+V<br>
② 본문: '여기부터 복사' 아래 점선 상자 맨 앞 글자부터 맨 끝 글자까지 드래그 → Ctrl+C → 네이버 본문에 Ctrl+V (Shift 없이)<br>
③ 회색 [여기에 사진 넣기 · 파일 이름] 줄 자리에 같은 폴더 사진을 넣고 그 줄은 지우기 (사진 밑 '사진 설명' 줄은 사진 설명 칸으로)<br>
④ 태그: 맨 아래 점선 상자 글자 드래그 → 복사 → 태그 칸에 붙여넣기</div>
<p style="{mark}">── 제목 (여기부터 복사) ──</p>
<div style="{box};font-size:19px;font-weight:bold">{html.escape(title)}</div>
<p style="{mark}">── 제목 (여기까지) ──</p>
<p style="{mark};margin-top:28px">── 본문 여기부터 복사 ──</p>
<div style="{box}">{body}</div>
<p style="{mark}">── 본문 여기까지 복사 ──</p>
<p style="{mark};margin-top:28px">── 태그 (여기부터 복사) ──</p>
<div style="{box};font-size:15px">{html.escape(tags)}</div>
<p style="{mark}">── 태그 (여기까지) ──</p>
<h3 style="margin-top:36px;font-size:16px">📷 이 글 사진 (같은 폴더에 있어요 · 번호 순서대로 넣기)</h3>
<div>{thumbs}</div>
</body></html>'''
open(out, 'w', encoding='utf-8').write(page)
print('ok', out)
