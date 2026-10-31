// 사용법: node make-card.cjs card.json out.png
// card.json: {theme:"guide|money|digital|job", badge, title:["줄1","*강조*줄2"], sub, chips:[["월","지원금·혜택"],...]}
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const c=JSON.parse(fs.readFileSync(process.argv[2]));const out=process.argv[3];
const T={guide:['#e6faf3','#a9e8d4','#0f8a6c'],money:['#fff6e3','#ffd98a','#d9480f'],digital:['#e8f1ff','#a9c8ff','#1c5fd4'],job:['#fff0e8','#ffc4a3','#c2410c']}[c.theme||'guide'];
const logo='data:image/png;base64,'+fs.readFileSync(path.join(__dirname,'logo.png')).toString('base64');
const hl=s=>s.replace(/\*(.+?)\*/g,`<span class="hl">$1</span>`);
const chips=(c.chips||[]).map(([d,t])=>`<div class="chip"><b>${d}</b>${t}</div>`).join('');
const html=`<html><head><style>
*{margin:0;box-sizing:border-box}body{font-family:'Noto Sans CJK KR',sans-serif}
.card{width:1080px;height:1080px;background:linear-gradient(160deg,${T[0]} 0%,#fff 55%,${T[1]} 140%);position:relative;padding:80px 90px 60px;display:flex;flex-direction:column}
.badge{align-self:flex-start;background:${T[2]};color:#fff;font-size:42px;font-weight:700;padding:14px 34px;border-radius:60px}
.title{margin-top:40px;font-size:${c.size||104}px;font-weight:900;line-height:1.22;color:#1b1b1b;letter-spacing:-3px}
.hl{color:${T[2]};background:linear-gradient(transparent 62%,${T[1]} 62%)}
.sub{margin-top:24px;font-size:46px;font-weight:500;color:#444;line-height:1.4}
.chips{margin-top:32px;display:flex;flex-direction:column;gap:14px}
.chip{font-size:46px;font-weight:700;color:#222;background:#fff;border:3px solid ${T[1]};border-radius:24px;padding:10px 24px}
.chip b{display:inline-block;width:68px;height:68px;line-height:66px;text-align:center;border-radius:50%;background:${T[2]};color:#fff;margin-right:22px;font-size:38px}
.foot{margin-top:auto;display:flex;align-items:center;gap:22px}
.foot img{width:96px;height:96px;border-radius:50%;border:4px solid #fff;box-shadow:0 4px 14px rgba(0,0,0,.12)}
.foot .n{font-size:40px;font-weight:800;color:#222}.foot .u{font-size:28px;color:#777;margin-top:2px}
</style></head><body><div class="card">
<div class="badge">${c.badge}</div>
<div class="title">${c.title.map(hl).join('<br>')}</div>
${c.sub?`<div class="sub">${hl(c.sub)}</div>`:''}
${chips?`<div class="chips">${chips}</div>`:''}
<div class="foot"><img src="${logo}"><div><div class="n">생애혜택 안내소</div><div class="u">blog.naver.com/saengae-hyetaek</div></div></div>
</div></body></html>`;
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1080}});await p.setContent(html);await p.waitForTimeout(300);await p.screenshot({path:out});await b.close();})();
