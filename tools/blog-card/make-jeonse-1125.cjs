// 11/25 전세사기 속보: 국토부 안심전세 카드뉴스 7장 내용을 그대로(사람 캐릭터 빼고) 다시 그림
const {chromium}=require('playwright');const path=require('path');
const out=process.argv[2]||'.';
const B='#1d3f9e',R='#e03131',Y='#d7f25c';
const base=`*{margin:0;box-sizing:border-box}body{font-family:'Noto Sans CJK KR',sans-serif;word-break:keep-all}
.c{width:1080px;height:1350px;position:relative;background:linear-gradient(170deg,#f4f6fb 0%,#ffffff 45%,#eef2fa 100%);padding:70px 70px 0;display:flex;flex-direction:column;align-items:center;text-align:center;overflow:hidden}
.top{position:absolute;top:40px;left:60px;right:60px;display:flex;justify-content:space-between;font-size:30px;font-weight:700;color:${B}}
.top span:last-child{color:#555}
.foot{position:absolute;bottom:34px;left:0;right:0;text-align:center;font-size:26px;color:#8a919c}
h1{font-size:66px;font-weight:900;line-height:1.3;color:#1b1b1b;margin-top:70px}
h2{font-size:56px;font-weight:900;line-height:1.3;color:${B};margin-top:20px}
p{font-size:36px;line-height:1.6;color:#333;margin-top:18px}
.b{color:${B};font-weight:900}.r{color:${R};font-weight:900}
.box{width:100%;background:#fff;border:6px solid ${B};border-radius:34px;padding:34px 40px;text-align:left;margin-top:28px;box-shadow:0 10px 30px #1d3f9e22}
.pill{display:inline-block;background:${B};color:#fff;font-size:34px;font-weight:900;padding:10px 40px;border-radius:40px;margin-top:30px}
`;
const wrap=b=>`<html><head><style>${base}</style></head><body><div class="c"><div class="top"><span>안심전세</span><span>자료: 국토교통부</span></div>${b}<div class="foot">국토교통부 안심전세 카드뉴스 내용 · 생애혜택 안내소 blog.naver.com/saengae-hyetaek</div></div></body></html>`;
const cards=[
['01-전세사기-피해사례-집주인도-중개인도-한-팀',`
<div class="pill" style="margin-top:110px;background:#fff;color:${B};border:4px solid ${B}">🔍 전세사기 피해사례 시리즈 ①</div>
<h1 style="font-size:84px;margin-top:60px">집주인도, 중개인도<br>모두 <span class="r">'한 팀'</span>이었습니다</h1>
<div style="background:${B};color:#fff;font-size:44px;font-weight:700;padding:22px 40px;margin-top:50px;line-height:1.45">전세가가 매매가보다 비쌌던 집,<br>그 계약의 진실</div>
<div style="margin-top:110px;background:#16213e;width:100%;padding:60px 0;border-radius:30px"><div style="font-size:76px;font-weight:900;line-height:1.3;color:${Y}">전세사기<br><span style="color:${Y}">세 가지</span> <span style="color:#fff">위험신호</span></div></div>`],
['02-첫-전셋집-오늘-안-하면-나간다는-말',`
<h1>"이 조건이면<br>무조건 잡으셔야 해요"</h1>
<p style="margin-top:50px">첫 직장 2년 차, 스물아홉 살 민지 씨(가명).<br>처음으로 <b>'내 집 같은 전셋집'</b>을 찾던 중<br>지하철역 5분 거리 신축 빌라를 소개받았습니다.</p>
<p>깔끔한 인테리어, 친절한 부동산중개소 실장님까지~<br>더할 나위 없이 마음에 쏙 드는 집이었습니다.</p>
<div class="box" style="margin-top:70px;text-align:center;border-radius:60px"><div style="font-size:30px;color:#777">중개소 실장님의 말</div><div style="font-size:52px;font-weight:900;color:${B};line-height:1.45;margin-top:10px">"요즘 이런 매물 없어요.<br>오늘 안 하면 바로 나가요."</div></div>`],
['03-보증금-2억2천-집값-2억-보증금이-더-비싼-집',`
<h1>보증금 2억 2천만 원,<br>그런데 집값은…?</h1>
<p style="margin-top:40px">민지 씨는 전세보증금 2억 2천만 원에 계약했습니다.<br>하지만 이 집의 실제 매매가는 2억 원.<br><span class="b">보증금이 집값보다 비쌌던 겁니다.</span></p>
<p>게다가 계약 직후, 집주인이 다른 사람으로 바뀌었습니다.<br>하지만 실장님의 한마디에 민지 씨는 안심했습니다.</p>
<div style="display:flex;gap:40px;margin-top:50px;width:100%;justify-content:center;align-items:flex-end">
<div style="background:#ffe3e3;border:6px solid ${R};border-radius:28px;width:380px;padding:30px"><div style="font-size:34px;font-weight:700;color:${R}">전세보증금</div><div style="font-size:90px;font-weight:900;color:${R}">2.2억</div></div>
<div style="font-size:90px;font-weight:900;color:#333;padding-bottom:40px">&gt;</div>
<div style="background:#fff4d6;border:6px solid #e0a800;border-radius:28px;width:380px;padding:30px"><div style="font-size:34px;font-weight:700;color:#b07d00">매매가(집값)</div><div style="font-size:90px;font-weight:900;color:#b07d00">2억</div></div></div>
<div class="box" style="margin-top:50px;text-align:center;border-radius:60px"><div style="font-size:30px;color:#777">실장님의 말</div><div style="font-size:42px;font-weight:900;color:${B};margin-top:8px">"소유주만 바뀌는 거라 전혀 문제없어요~"</div></div>`],
['04-바지-집주인-무자본-갭투기-수법',`
<h1 style="font-size:52px;margin-top:60px">자기 돈 0원으로 집을 산 <span class="r">'바지 집주인'</span><br>중개인과 브로커가 공모한 무자본 갭투기</h1>
<p style="margin-top:30px">만기가 다가오자 집주인은 연락이 끊겼습니다.<br>알고 보니 이 계약은 처음부터 짜인 판이었습니다.</p>
<div style="display:flex;align-items:center;gap:40px;margin-top:24px"><div style="font-size:44px;font-weight:900;background:#e7f5e9;border:5px solid #2b8a3e;color:#2b8a3e;border-radius:24px;padding:30px 34px">세입자<br>보증금 💰</div>
<div style="font-size:44px;font-weight:900;color:${B};text-align:left;line-height:1.8">➜ 중개인<br>➜ 브로커<br>➜ 명의수탁자</div></div>
<div class="box" style="font-size:33px;line-height:1.65;font-weight:500;padding:28px 34px">① 중개인과 브로커가 공모해 <span class="r">세입자 보증금으로 집을 매입</span>하는 '무자본 갭투기'<br>② 매매가보다 높게 받은 보증금 차액은 <span class="r">'리베이트'로 나눠 가짐</span><br>③ 실제 주인은 숨기고 <span class="r">명의만 빌려준 '바지 집주인'</span>을 내세움<br>④ 민지 씨를 상대한 '실장님'은 <span class="r">등록되지 않은 불법 중개인</span></div>`],
['05-계약-전-이-3가지만-확인했더라면',`
<h1 style="color:${B};margin-top:60px;font-size:58px">계약 전,<br>이 3가지만 확인했더라면</h1>
${[['① 시세를 직접 확인하지 않았습니다','중개인 말만 믿고, 매매가보다 비싼 보증금을 그대로 받아들였어요.'],['② 중개인의 \'자격\'을 확인하지 않았습니다','실장님(중개인)이 등록된 공인중개사가 맞는지 확인하지 않았어요.'],['③ 집주인 변경을 가볍게 넘겼습니다','계약 전후 소유자가 바뀌는 것은 대표적인 위험 신호예요.']].map(([t,d])=>`<div class="box" style="text-align:center;margin-top:22px;padding:22px 30px"><div style="font-size:26px">⚠️</div><div style="font-size:40px;font-weight:900;color:${R}">${t}</div><div style="font-size:32px;color:#333;margin-top:10px;line-height:1.5">${d}</div></div>`).join('')}
<div style="font-size:36px;font-weight:900;line-height:1.5;color:${B};margin-top:30px">"전세사기는 피해자의 탓이 아닙니다.<br>하지만 <span class="r">확인</span>은 나를 지키는 가장 강력한 방법입니다."</div>`],
['06-사기-명의신탁-불법중개-모두-위험',`
<h1 style="font-size:80px;color:${B};margin-top:130px">사기, 명의신탁, 불법중개</h1><h1 style="font-size:96px;color:${R};margin-top:10px">모두 위험!</h1>
<div style="display:flex;gap:30px;margin-top:110px;width:100%">${[['정상 계약처럼 속여<br>보증금을 가로챈','사기'],['바지 집주인을<br>내세운','부동산실명법 위반'],['등록 없이 중개한','공인중개사법 위반<br>(미등록 중개)']].map(([a,b])=>`<div class="box" style="flex:1;text-align:center;padding:60px 20px;margin-top:0"><div style="font-size:60px;color:${R};font-weight:900">✔</div><div style="font-size:36px;line-height:1.5;margin-top:20px">${a}</div><div style="font-size:40px;font-weight:900;margin-top:14px;line-height:1.4">${b}</div></div>`).join('')}</div>`],
['07-안심계약-333법칙-체크리스트',`
<div style="font-size:40px;font-weight:900;margin-top:60px">안심계약 3·3·3법칙 체크리스트</div>
<h1 style="color:${B};margin-top:6px;font-size:56px">전세 계약시, 꼭 체크하세요 ✅</h1>
${[['계약 전',['시세조사','등기부등본 &amp; 건축물대장 확인','전세보증보험 가입 가능 여부 확인']],['계약할 때',['공인중개사 정상 영업여부 확인','임대인과 계약자 일치 여부 확인','주택임대차표준계약서 등 사용(안전특약 포함)']],['계약 후',['계약 후 즉시 임대차계약 신고','잔금 지급 전 권리관계 변동사항 있는지 다시 확인','이사 당일 전입신고 완료']]].map(([h,l])=>`<div class="pill" style="margin-top:24px;position:relative;z-index:2">${h}</div><div class="box" style="margin-top:-24px;padding:36px 34px 20px">${l.map(x=>`<div style="font-size:33px;line-height:1.75">☐ ${x}</div>`).join('')}</div>`).join('')}`]
];
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1080,height:1350}});
for(const [n,h] of cards){await pg.setContent(wrap(h));await pg.waitForTimeout(150);await pg.screenshot({path:path.join(out,n+'.png')});console.log(n)}
await b.close()})();
