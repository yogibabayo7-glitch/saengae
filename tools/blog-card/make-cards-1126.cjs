// 11/26 정책 속보 2건: 원문 카드 내용을 글자·순서 그대로 다시 그림(캐릭터 빼고)
//  ① 개인정보위 카드뉴스 '개인정보 유출 통지 사칭 악성메일, 주의하세요!'(정책브리핑 2026.11.25, 3장)
//  ② 교육부 카드 '국가장학금 지원, 오늘부터 신청하세요!'(정책브리핑 2026.11.24, 1장 → 보기 쉽게 2장으로 나눔, 캐릭터 '마롱' 뺌)
// 사용법: node make-cards-1126.cjs 출력폴더
const {chromium}=require('playwright');const path=require('path');
const out=process.argv[2]||'.';
const R='#e03131';
const base=B=>`*{margin:0;box-sizing:border-box}body{font-family:'Noto Sans CJK KR',sans-serif;word-break:keep-all}
.c{width:1080px;height:1350px;position:relative;background:linear-gradient(170deg,#f4f6fb 0%,#ffffff 45%,#eef2fa 100%);padding:70px 70px 0;display:flex;flex-direction:column;align-items:center;text-align:center;overflow:hidden}
.top{position:absolute;top:40px;left:60px;right:60px;display:flex;justify-content:space-between;font-size:30px;font-weight:700;color:${B}}
.top span:last-child{color:#555}
.foot{position:absolute;bottom:22px;left:0;right:0;text-align:center;font-size:24px;color:#8a919c}
h1{font-size:64px;font-weight:900;line-height:1.3;color:#1b1b1b;margin-top:70px}
p{font-size:36px;line-height:1.6;color:#333;margin-top:18px}
.b{color:${B};font-weight:900}.r{color:${R};font-weight:900}
.box{width:100%;background:#fff;border:6px solid ${B};border-radius:34px;padding:30px 38px;text-align:left;margin-top:26px;box-shadow:0 10px 30px ${B}22}
.pill{display:inline-block;background:${B};color:#fff;font-size:34px;font-weight:900;padding:10px 40px;border-radius:40px;margin-top:30px}
.row{font-size:33px;line-height:1.6;color:#222}
`;
const wrap=(B,left,src,foot,b)=>`<html><head><style>${base(B)}</style></head><body><div class="c"><div class="top"><span>${left}</span><span>${src}</span></div>${b}<div class="foot">${foot} · 생애혜택 안내소 blog.naver.com/saengae-hyetaek</div></div></body></html>`;

const P='#1f4e9c'; // 개인정보위
const pFoot='개인정보위 카드뉴스 내용(2026.11.25)';
const pw=b=>wrap(P,'피싱 주의','자료: 개인정보보호위원회',pFoot,b);
const E='#0b7285'; // 교육부·한국장학재단
const eFoot='교육부 카드 내용(2026.11.24)';
const ew=b=>wrap(E,'국가장학금','자료: 교육부',eFoot,b);

const cards=[
['사칭1-개인정보-유출-통지-사칭-악성메일-주의',pw(`
<div class="pill" style="margin-top:120px;background:#fff;color:${R};border:4px solid ${R}">⚠️ 주의</div>
<h1 style="font-size:82px;margin-top:50px">'개인정보 유출 통지'<br>사칭 <span class="r">악성메일</span> 주의</h1>
<div style="background:${P};color:#fff;font-size:46px;font-weight:700;padding:22px 50px;margin-top:46px;border-radius:12px">개인정보위, 피해 예방 수칙 안내</div>
<div class="box" style="margin-top:90px;padding:40px 44px">
<div class="row" style="font-size:38px">✔ 개인정보위 <b class="b">직원을 사칭한 악성메일</b>과<br>&nbsp;&nbsp;&nbsp;<b class="r">첨부파일 실행</b>을 유도하는 사례 발견</div>
<div class="row" style="font-size:38px;margin-top:22px">✔ <b class="b">공식 채널</b>을 통한 교차 검증,<br>&nbsp;&nbsp;&nbsp;악성코드 감염 시 <b class="r">네트워크 즉시 차단</b></div></div>`)],
['사칭2-가짜-메일-예시-p1pc-주소-주의',pw(`
<h1 style="margin-top:50px;font-size:58px">이런 메일이 왔다면 <span class="r">가짜</span>예요</h1>
<div style="width:100%;background:#fff;border:3px solid #c9cfd8;border-radius:20px;margin-top:36px;text-align:left;box-shadow:0 10px 30px #0002;overflow:hidden">
<div style="background:#eef1f6;padding:24px 34px;border-bottom:2px solid #d6dbe3">
<div style="font-size:30px;color:#555">보낸 사람</div>
<div style="font-size:36px;font-weight:700;color:#222">조사조정국 조사3과 &lt;no-reply@<span style="color:${R};background:#ffe3e3;padding:0 6px;border:3px solid ${R};border-radius:8px">p1pc</span>.go.kr&gt;</div>
<div style="font-size:28px;color:#777;margin-top:6px">Tuesday, 24 November 2026 13:54:11</div>
<div style="font-size:36px;font-weight:900;color:#111;margin-top:14px">개인정보 유출(의심) 관련 사실 통지 및 확인 요청</div>
<div style="font-size:30px;color:#333;margin-top:12px">📎 <span style="background:#ffe3e3;border:3px solid ${R};border-radius:8px;padding:2px 10px">개인정보 유출 의심정보 확인 안내.pdf</span> (1246KB)</div></div>
<div style="padding:26px 34px;font-size:31px;line-height:1.6;color:#333">개인정보보호위원회 조사조정국 조사3과 명의로<br>"귀하의 <b>성명, 생년월일, 휴대전화 번호</b> 등이<br>외부에 노출된 정황이 확인됐다"고 알리며<br>「개인정보 보호법」 제34조를 내세워요.<br><span style="color:#777">유출 의심 항목: 성명·생년월일·휴대 전화 번호·주소지 일부</span></div></div>
<div class="box" style="border-color:${R};text-align:center;margin-top:34px;box-shadow:none"><div style="font-size:40px;font-weight:900;color:${R};line-height:1.45">개인정보위 메일은 p1pc.go.kr이 아닌<br><span style="color:${P}">korea.kr</span>을 사용해요</div></div>`)],
['사칭3-피싱-예방-수칙-3가지',pw(`
<h1 style="color:${P};margin-top:60px;font-size:60px">피싱 예방 주의사항</h1>
${[['① 의심 메일의 링크 클릭·첨부파일 실행 금지',['발신자 이메일 주소의 철자와 실제 도메인이 같은지 확인','"안내서", "보상신청서" 등으로 위장한 첨부파일 실행 금지']],['② 공식 채널로 사실 여부 검증',['메일 속 링크·전화번호 대신 공식 앱·홈페이지에 직접 접속','피해구제 등을 이유로 한 원격제어 앱 설치 요구 거부']],['③ 계정 보안 강화·개인정보 보호 서비스 활용',['비밀번호 주기적 변경','다중인증 활성화']]].map(([t,l])=>`<div class="box" style="margin-top:30px"><div style="font-size:39px;font-weight:900;color:${R};line-height:1.4">${t}</div>${l.map(x=>`<div class="row" style="margin-top:10px">· ${x}</div>`).join('')}</div>`).join('')}`)],
['장학1-국가장학금-1차-신청기간-대상',ew(`
<h1 style="margin-top:50px;font-size:62px">국가장학금 신청,<br><span style="color:${E}">빠트리지 마세요!</span></h1>
<div class="box" style="margin-top:30px"><div style="font-size:38px;font-weight:900;color:${E}">📌 학자금 지원구간 체계 개편</div><div class="row" style="margin-top:10px">2027년 1학기부터 지급단가에 따라<br>현행 <b>10구간</b> 체계에서 <b class="r">'가, 나, 다, 라, 마' 5구간</b> 체계로 개편 예정</div></div>
<div class="box" style="margin-top:30px;text-align:center;border-color:${R}"><div style="font-size:36px;font-weight:900;color:#333">'27년 1학기 1차 신청기간</div><div style="font-size:50px;font-weight:900;color:${R};margin-top:10px;line-height:1.35">'26.11.24.(화) 9시<br>~ '27.1.7.(목) 18시</div></div>
<div class="box" style="margin-top:30px"><div style="font-size:38px;font-weight:900;color:${E}">👩‍🎓 신청대상</div><div class="row" style="margin-top:10px">재학생, 신입생(고3, 재수생 등 입학예정자),<br>편입생, 재입학생, 복학생 등 <b>모든 대학생</b></div><div class="row" style="margin-top:10px;color:#555;font-size:30px">※ 재학생은 1차 신청이 원칙이며,<br>재학 중 2회에 한해 2차 신청으로 수혜 가능</div></div>`)],
['장학2-국가장학금-신청방법-서류-가구원동의-기한',ew(`
<h1 style="margin-top:36px;font-size:54px;color:${E}">신청은 이렇게</h1>
<div class="box" style="margin-top:20px;padding:22px 34px"><div style="font-size:36px;font-weight:900;color:${E}">✍️ 신청방법</div><div class="row" style="margin-top:10px">· <b>학생 본인이 직접</b> 신청<br>· 전자서명수단 한 가지 준비<br>&nbsp;&nbsp;① 공동인증서 ② 금융인증서 ③ 간편인증<br>· <b>한국장학재단 누리집·모바일 앱</b>에서 신청</div></div>
<div class="box" style="margin-top:18px;padding:22px 34px"><div style="font-size:36px;font-weight:900;color:${E}">📅 신청기간</div>
<div class="row" style="margin-top:10px"><b>국가장학금 신청</b><br><span class="r">'26.11.24.(화) 09시 ~ '27.1.7.(목) 18시</span><br><span style="font-size:29px;color:#555">※ 마감 이후 신청 불가</span></div>
<div class="row" style="margin-top:14px"><b>서류제출 및 가구원 동의</b><br><span class="r">'26.11.24.(화) 09시 ~ '27.1.14.(목) 18시</span><br><span style="font-size:27px;color:#555;line-height:1.5">가구원 동의: ① 한국장학재단 누리집 ② 한국장학재단 모바일 앱 ③ 민간사 앱(웰로)<br>※ 서류 제출 대상자는 온라인 제출 필수<br>※ 신청 2~3일 후 누리집·앱에서 필요 서류 확인</span></div></div>
<div class="box" style="margin-top:18px;padding:18px 34px;text-align:center"><div style="font-size:34px;font-weight:900;color:#333">신청문의 한국장학재단 상담센터</div><div style="font-size:50px;font-weight:900;color:${E}">☎ 1599-2000</div></div>`)]
];
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1080,height:1350}});
for(const [n,h] of cards){await pg.setContent(h);await pg.waitForTimeout(200);
 const over=await pg.evaluate(()=>{const c=document.querySelector('.c');const f=document.querySelector('.foot').getBoundingClientRect().top;let m=0;c.querySelectorAll('.box,h1,.pill').forEach(e=>{m=Math.max(m,e.getBoundingClientRect().bottom)});return m>f-10?Math.round(m-f):0});
 await pg.screenshot({path:path.join(out,n+'.png')});console.log(n,over?'넘침 '+over+'px':'ok')}
await b.close()})();
