// 11/26 모두의카드 청소년 속보: 국토부 '12월부터 청소년도 모두의카드 이용 가능!' 카드 1장을 글자 그대로 다시 그림
// (학생 캐릭터·카드 그림·카드사 로고는 빼고 카드 이름만 원문 순서대로)
const {chromium}=require('playwright');const path=require('path');
const out=process.argv[2]||'.';const name=process.argv[3]||'card';
const G='#2f9e5b',G2='#e9f8ef',Y='#fff36b';
const c13=[['농협','NH 모두의카드 체크',''],['신한','모두의카드 체크',''],['우리','모두의카드 체크',''],['이즐','이즐 모두의카드','*실물/모바일'],['코레일','모바일 Rail+','*모바일'],
['토스뱅크','체크카드<br>(K-패스)',''],['티머니','모두의카드','*실물/모바일'],['하나','모두의카드 체크카드',''],['IBK기업은행','K-패스(체크)',''],['KB','모두의카드 체크','']];
const c18=[['카카오뱅크','The 체크카드<br>with 모두의 카드',''],['케이뱅크','ONE 체크카드<br>(K-패스)','']];
const tile=([a,b,n])=>`<div class="t"><div class="a">${a}</div><div class="b">${b}</div>${n?`<div class="n">${n}</div>`:''}</div>`;
const html=`<html><head><style>*{margin:0;box-sizing:border-box}body{font-family:'Noto Sans CJK KR',sans-serif;word-break:keep-all}
.c{width:1080px;height:1350px;position:relative;background:#fff;overflow:hidden}
.hd{background:linear-gradient(120deg,${G} 0%,#5cc47e 100%);padding:86px 60px 40px;border-bottom-left-radius:90px}
.top{position:absolute;top:30px;left:60px;right:60px;display:flex;justify-content:space-between;font-size:28px;font-weight:700;color:#fff}
.pill{display:inline-block;border:4px solid #fff;color:#fff;font-size:36px;font-weight:900;padding:6px 34px;border-radius:40px}
h1{font-size:74px;font-weight:900;line-height:1.2;color:${Y};margin-top:20px;letter-spacing:-2px}
.sec{margin:30px 60px 0;font-size:38px;font-weight:900;color:#1b1b1b}
.lab{margin:18px 60px 0;font-size:32px;font-weight:800;color:#333}.lab span{background:${G2};color:${G};border-radius:20px;padding:2px 16px;margin-right:12px}
.g{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin:16px 60px 0}
.t{background:${G2};border:3px solid #bfe8cf;border-radius:22px;padding:18px 8px;text-align:center;min-height:180px;display:flex;flex-direction:column;justify-content:center}
.a{font-size:32px;font-weight:900;color:${G}}.b{font-size:27px;font-weight:700;color:#222;margin-top:8px;line-height:1.3}.n{font-size:21px;color:#888;margin-top:6px}
.g2{grid-template-columns:repeat(2,1fr);width:700px}
.foot{position:absolute;line-height:1.4;bottom:16px;left:0;right:0;text-align:center;font-size:23px;color:#8a919c}
</style></head><body><div class="c">
<div class="hd"><div class="top"><span>모두의카드</span><span>자료: 국토교통부</span></div><div class="pill">모두의카드</div><h1>12월부터 청소년도<br>모두의카드 이용 가능!</h1></div>
<div class="sec">📢 청소년 이용 가능 카드 안내</div>
<div class="lab"><span>13+</span>13세 이상부터 발급 가능한 카드</div>
<div class="g">${c13.map(tile).join('')}</div>
<div class="lab" style="margin-top:28px"><span>18+</span>18세 이상부터 발급 가능한 카드</div>
<div class="g g2">${c18.map(tile).join('')}</div>
<div class="foot">국토교통부 '청소년도 발급할 수 있는 모두의카드 상품목록' 내용<br>생애혜택 안내소 · blog.naver.com/saengae-hyetaek</div>
</div></body></html>`;
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1080,height:1350}});
await pg.setContent(html);await pg.waitForTimeout(200);await pg.screenshot({path:path.join(out,name+'.png')});await b.close();console.log('ok')})();
