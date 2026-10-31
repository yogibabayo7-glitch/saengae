// 사용법: node make-table.cjs tables.json 출력폴더
// tables.json: {theme:"guide|money|digital|job", tables:[{file:"이름.png", title:"제목", head:["칸1","칸2"], rows:[["a","*강조*b"],...], note:"아래 작은 글씨"}]}
// 폭 1080px, 높이는 내용만큼. *글자* = 테마 색 굵게.
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const c=JSON.parse(fs.readFileSync(process.argv[2]));const outDir=process.argv[3]||'.';
const T={guide:['#e6faf3','#a9e8d4','#0f8a6c'],money:['#fff6e3','#ffd98a','#d9480f'],digital:['#e8f1ff','#a9c8ff','#1c5fd4'],job:['#fff0e8','#ffc4a3','#c2410c']}[c.theme||'guide'];
const hl=s=>String(s).replace(/\*(.+?)\*/g,`<b class="hl">$1</b>`);
const page=t=>`<html><head><style>
*{margin:0;box-sizing:border-box}body{font-family:'Noto Sans CJK KR',sans-serif;background:#fff;word-break:keep-all}
.wrap{width:1080px;padding:56px 60px 48px;background:linear-gradient(170deg,${T[0]} 0%,#fff 60%)}
h1{font-size:58px;font-weight:900;color:#1b1b1b;letter-spacing:-2px;margin-bottom:30px}
h1:before{content:'';display:inline-block;width:14px;height:52px;background:${T[2]};border-radius:7px;margin-right:20px;vertical-align:-6px}
table{width:100%;border-collapse:separate;border-spacing:0;border:3px solid ${T[1]};border-radius:24px;overflow:hidden;background:#fff}
th{background:${T[2]};color:#fff;font-size:38px;font-weight:800;padding:20px 24px;text-align:left}
td{font-size:${t.head.length>2?36:40}px;font-weight:600;color:#222;padding:22px 24px;border-top:2px solid ${T[0]};line-height:1.35;vertical-align:middle}
tr:nth-child(even) td{background:${T[0]}55}
td:first-child{font-weight:800;color:#333;white-space:nowrap;width:${t.firstWidth||'30%'}}
.hl{color:${T[2]};font-weight:900;white-space:nowrap}
.note{margin-top:22px;font-size:32px;color:#555;line-height:1.45}
.foot{margin-top:26px;font-size:28px;color:#999;text-align:right}
</style></head><body><div class="wrap" id="w">
<h1>${t.title}</h1>
<table><tr>${t.head.map(h=>`<th>${h}</th>`).join('')}</tr>
${t.rows.map(r=>`<tr>${r.map(x=>`<td>${hl(x)}</td>`).join('')}</tr>`).join('')}</table>
${t.note?`<div class="note">${hl(t.note)}</div>`:''}
<div class="foot">생애혜택 안내소 · blog.naver.com/saengae-hyetaek</div>
</div></body></html>`;
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:800}});
for(const t of c.tables){await p.setContent(page(t));await p.waitForTimeout(200);
await (await p.$('#w')).screenshot({path:path.join(outDir,t.file)});console.log('ok',t.file);}
await b.close();})();
