// 11/26 모두의카드 청소년 속보: 국토부 '12월부터 청소년도 모두의카드 이용 가능!' 카드를 다시 그림
// 사장님(11/26): 카드 실물 사진(blog/카드사진-모두의카드, prep-modoo-cards-1126.py로 다듬음)을 3줄 × 4칸 표로. 학생 캐릭터는 뺌.
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');
const out=process.argv[2]||'.';const name=process.argv[3]||'card';
const DIR=path.join(__dirname,'../../blog/카드사진-모두의카드');
const G='#2f9e5b',G2='#e9f8ef',Y='#fff36b';
const cards=[['01-농협','농협','NH 모두의카드 체크','13'],['02-신한','신한','모두의카드 체크','13'],['03-우리','우리','모두의카드 체크','13'],['04-이즐','이즐','이즐 모두의카드','13','실물/모바일'],
['05-코레일','코레일','모바일 Rail+','13','모바일'],['06-토스뱅크','토스뱅크','체크카드(K-패스)','13'],['07-티머니','티머니','모두의카드','13','실물/모바일'],['08-하나','하나','모두의카드 체크카드','13'],
['09-IBK','IBK기업은행','K-패스(체크)','13'],['10-KB','KB','모두의카드 체크','13'],['11-카카오뱅크','카카오뱅크','The 체크카드 with 모두의 카드','18'],['12-케이뱅크','케이뱅크','ONE 체크카드(K-패스)','18']];
const uri=f=>'data:image/png;base64,'+fs.readFileSync(path.join(DIR,f+'.png')).toString('base64');
const num=['①','②','③','④','⑤','⑥','⑦','⑧','⑨','⑩','⑪','⑫'];
const tile=([f,a,b,age,n],i)=>`<div class="t"><div class="no">${num[i]}</div><div class="age ${age==='18'?'a18':''}">${age}+</div>
<div class="img"><img src="${uri(f)}" class="${f.startsWith('05')?'sq':''}"></div><div class="a">${a}</div><div class="b">${b}</div>${n?`<div class="n">*${n}</div>`:''}</div>`;
const html=`<html><head><style>*{margin:0;box-sizing:border-box}body{font-family:'Noto Sans CJK KR',sans-serif;word-break:keep-all}
.c{width:1080px;height:1610px;position:relative;background:#fff;overflow:hidden}
.hd{background:linear-gradient(120deg,${G} 0%,#5cc47e 100%);padding:76px 60px 30px;border-bottom-left-radius:80px}
.top{position:absolute;top:26px;left:60px;right:60px;display:flex;justify-content:space-between;font-size:28px;font-weight:700;color:#fff}
.pill{display:inline-block;border:4px solid #fff;color:#fff;font-size:32px;font-weight:900;padding:4px 30px;border-radius:40px}
h1{font-size:62px;font-weight:900;line-height:1.2;color:${Y};margin-top:14px;letter-spacing:-2px}
.sec{margin:26px 50px 0;font-size:34px;font-weight:900;color:#1b1b1b;display:flex;gap:24px;align-items:center}
.sec span{font-size:26px;font-weight:700;color:#555}.sec i{font-style:normal;background:${G2};color:${G};border-radius:16px;padding:2px 12px;margin-right:6px}.sec i.r{background:#fff0e6;color:#e8590c}
.g{display:grid;grid-template-columns:repeat(4,1fr);gap:14px 14px;margin:18px 40px 0}
.t{position:relative;background:${G2};border:3px solid #bfe8cf;border-radius:22px;padding:16px 8px 14px;text-align:center;height:362px}
.no{position:absolute;top:8px;left:10px;font-size:34px;font-weight:900;color:${G}}
.age{position:absolute;top:12px;right:10px;font-size:22px;font-weight:900;background:#fff;color:${G};border:2px solid ${G};border-radius:14px;padding:0 8px}
.age.a18{color:#e8590c;border-color:#e8590c}
.img{height:196px;display:flex;align-items:center;justify-content:center;margin-top:32px}
.img img{height:192px;filter:drop-shadow(0 6px 8px #0003)}.img img.sq{height:124px}
.a{font-size:26px;font-weight:900;color:${G};margin-top:8px}.b{font-size:21px;font-weight:700;color:#222;margin-top:4px;line-height:1.25}.n{font-size:18px;color:#888;margin-top:2px}
.foot{position:absolute;bottom:12px;left:0;right:0;text-align:center;font-size:22px;line-height:1.4;color:#8a919c}
</style></head><body><div class="c">
<div class="hd"><div class="top"><span>모두의카드</span><span>자료: 국토교통부</span></div><div class="pill">모두의카드</div><h1>12월부터 청소년도<br>모두의카드 이용 가능!</h1></div>
<div class="sec">📢 청소년 이용 가능 카드 안내 <span><i>13+</i>13세부터 <i class="r">18+</i>18세부터 발급</span></div>
<div class="g">${cards.map(tile).join('')}</div>
<div class="foot">국토교통부 '청소년도 발급할 수 있는 모두의카드 상품목록' 내용 · 카드 사진: 각 카드사<br>생애혜택 안내소 · blog.naver.com/saengae-hyetaek</div>
</div></body></html>`;
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1080,height:1610}});
await pg.setContent(html);await pg.waitForTimeout(300);await pg.screenshot({path:path.join(out,name+'.png')});await b.close();console.log('ok')})();
