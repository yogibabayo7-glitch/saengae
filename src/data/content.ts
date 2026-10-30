// 생애혜택 안내소 — 화면에 보이는 내용 (사이트 index.html 2026-10-29 자료 확인본을 그대로 옮김)
// 금액·조건을 고칠 때는 이 파일만 고치면 돼요. 분기 점검(1·4·7·10월) 때 CHECKED_AT도 바꿔 주세요.

export const CHECKED_AT = '2026. 10. 30.';

export type StageKey = 'pregnancy' | 'kids' | 'school' | 'youth' | 'midlife' | 'senior' | 'disability' | 'everyone';

// 분야 안의 칸: 기본(없음) · 1인가구 · 직장인
export type CardTab = 'single' | 'worker';
export const TAB_LABEL: Record<CardTab, string> = { single: '1인가구', worker: '직장인·일자리' };

export type Action =
  | { kind: 'link'; label: string; url: string; primary?: boolean } // 정부 사이트 (새 창)
  | { kind: 'detail'; label?: string; id: string } // 자세히 (아래 DETAILS)
  | { kind: 'stage'; label: string; stage: StageKey }; // 다른 분야로 이동

export type Card = {
  title: string;
  amount: string;
  amountNote?: string;
  who?: string;
  bullets: string[];
  actions: Action[];
  tone?: 'plan' | 'flag'; // plan=예정(노란 띠), flag=올해 마지막(빨간 띠)
  tab?: CardTab; // 없으면 '기본' 칸
  group?: string; // 기본 칸 안의 소제목 (예: 결혼·신혼)
};

export type ShopItem = { name: string; url: string };

export type Stage = {
  key: StageKey;
  name: string;
  age: string; // 짧은 대상 표시
  emoji: string;
  intro: string;
  cards: Card[];
  checklist?: { title: string; items: string[] };
  shopTitle?: string;
  shop?: ShopItem[];
  mini?: boolean; // 홈 맨 아래 작은 칸으로만 (모든 나이)
};

export type DetailBlock =
  | { kind: 'table'; header?: string[]; rows: string[][] }
  | { kind: 'list'; items: string[] }
  | { kind: 'p'; text: string }
  | { kind: 'h'; text: string };

export type Detail = { id: string; title: string; meta?: string; blocks: DetailBlock[]; source: string; stage: StageKey };

export type Notice = { tag: '종료' | '올해 마지막' | '2027 예정' | '진행 중'; title: string; text: string };

// ───────── 지금 꼭 확인할 변경 사항 ─────────
export const NOTICES: Notice[] = [
  { tag: '종료', title: '경기도 산후조리비(50만 원)', text: '2026년 9월 30일 신청분까지만 지원하고 10월 1일부터 끝났어요. 일부 시·군은 자체 지원을 이어갑니다.' },
  { tag: '올해 마지막', title: '혼인 세액공제', text: '2024~2026년에 혼인신고한 부부까지만 적용돼요.' },
  { tag: '2027 예정', title: '혼인지원금 100만 원 · 아이맞이지원금 최대 2,000만 원', text: '혼인지원금(2027.1.1 이후 혼인신고)과 아이맞이지원금(2027.7.1 이후 출생)은 정부 예산안 단계라 국회 심의 결과에 따라 바뀔 수 있어요.' },
  { tag: '올해 마지막', title: '문화누리카드 11월 30일 발급 마감', text: '기초수급·차상위 연 15만 원. 발급은 11월 30일까지, 사용은 12월 31일까지예요.' },
  { tag: '올해 마지막', title: '근로·자녀장려금 기한 후 신청 12월 1일까지', text: '5월에 놓쳤다면 12월 1일까지 홈택스에서 신청하면 95%를 받아요.' },
  { tag: '올해 마지막', title: '에너지바우처 12월 31일 신청 마감', text: '기초수급 가구 중 노인·영유아·장애인 등이 있으면 연 29.5만~70.1만 원 난방비 지원.' },
  { tag: '진행 중', title: '전세사기 피해자 보증금 최소 1/3 보장', text: '11월 13일부터 시행. 돌려받은 돈이 보증금 1/3에 못 미치면 나라가 차액을 지원해요.' },
  { tag: '진행 중', title: '2027학년도 1학기 국가장학금 신청', text: '보통 11월 중순에 1차 신청이 열려요. 고3·대학생은 한국장학재단 공지를 확인하세요.' },
  { tag: '진행 중', title: '65세 이상 독감·코로나19 무료 접종', text: '연령별로 시작됐어요. 코로나19는 2027년 6월 30일까지 맞을 수 있어요.' },
];

// ───────── 상품(제휴) 링크 — url을 넣으면 그 분야 아래에 버튼으로 보여요. 비우면 이름만 회색 ─────────
// 토스 쉐어링크 / 네이버 브랜드커넥트 / 쿠팡 파트너스 주소를 넣으면 돼요.
export const SHOP_DISCLOSE = '이 상품 링크는 제휴 활동의 일환으로, 구매 시 운영자가 일정액의 수수료를 받을 수 있습니다.';

const L = (label: string, url: string, primary = true): Action => ({ kind: 'link', label, url, primary });
const D = (id: string, label = '자세히'): Action => ({ kind: 'detail', id, label });

const ALL_STAGES: Stage[] = [
  {
    key: 'pregnancy',
    name: '임신·출산',
    age: '임신부 · 출산 가정',
    emoji: '🤰',
    intro: '임신을 확인하면 가장 먼저 무료 엄마보험부터 챙기고, 출산 전후로 바우처와 산후조리 지원을 신청하세요.',
    cards: [
      {
        title: '우체국 대한민국 엄마보험',
        amount: '보험료 0원',
        amountNote: '우체국 전액 부담',
        who: '17~45세 · 임신 22주 이내 임신부와 태아',
        bullets: ['아이 희귀질환 진단 시 100만 원 (10년 보장)', '엄마 임신중독증 10만 · 임신성 고혈압 5만 · 임신성 당뇨 3만 원'],
        actions: [L('우체국보험 바로가기', 'https://www.epostlife.go.kr'), D('d-mom-ins')],
      },
      {
        title: '첫만남이용권',
        amount: '200만~300만 원',
        amountNote: '국민행복카드',
        who: '출생신고한 모든 아이 · 소득 기준 없음',
        bullets: ['첫째 200만 원, 둘째 이상 300만 원', '산후조리원·병원·유아용품 등에 사용'],
        actions: [L('복지로에서 신청', 'https://www.bokjiro.go.kr'), D('d-first-meet')],
      },
      {
        title: '산모·신생아 건강관리 (산후도우미)',
        amount: '바우처',
        amountNote: '소득별 차등',
        who: '기준중위소득 150% 이하 출산 가정 (둘째아 이상 등 예외 지원)',
        bullets: ['건강관리사가 집으로 방문해 산모·아기 돌봄', '신청: 출산예정일 40일 전 ~ 출산 후 60일'],
        actions: [L('복지로 바로가기', 'https://www.bokjiro.go.kr'), D('d-doula')],
      },
      {
        title: '지역별 산후조리비',
        amount: '서울 100만~150만 원',
        who: '사는 시·도마다 다름',
        bullets: ['서울: 첫째 100 · 둘째 120 · 셋째 이상 150만 원', '경기도 지원은 2026.10.1 종료', '전남·광주는 아이톡에서 확인'],
        actions: [L('서울 몽땅정보통', 'https://umppa.seoul.go.kr'), L('전남 아이톡', 'https://italk.jeonnam.go.kr', false), D('d-postpartum')],
      },
      {
        title: '2027년 출산지원 개편 (예정)',
        amount: '최대 2,000만 원',
        amountNote: '정부안',
        who: '2027년 7월 1일 이후 태어난 아이부터',
        bullets: ['첫만남이용권·부모급여·아동수당을 통합', '첫째 1,000만 · 둘째 1,200만 · 셋째 이상 1,500만 원 (우대지역 +500만)', '국회 심의 중, 1월 출생아 소급 검토'],
        actions: [D('d-2027-baby')],
        tone: 'plan',
      },
      {
        tab: 'worker',
        title: '출산전후휴가',
        amount: '90일 · 월 최대 220만 원',
        amountNote: '30일당 상한',
        who: '출산(예정) 여성 근로자',
        bullets: ['다태아 120일 · 미숙아 출산은 100일', '유산·사산휴가도 같은 상한 (회사 신청 후 고용24)'],
        actions: [L('고용24', 'https://www.work24.go.kr'), L('정책브리핑', 'https://www.korea.kr/news/policyNewsView.do?newsId=148958223', false)],
      },
      {
        tab: 'worker',
        title: '임신기 근로시간 단축',
        amount: '월급 그대로',
        who: '임신 12주 이내 또는 32주 이후 근로자',
        bullets: ['2025년부터 36주 → 32주로 앞당겨졌어요', '고위험 임신부는 임신 기간 내내 쓸 수 있어요'],
        actions: [L('정책브리핑', 'https://www.korea.kr/news/policyNewsView.do?newsId=148940076')],
      },
      {
        tab: 'worker',
        title: '난임치료휴가',
        amount: '연 6일',
        amountNote: '유급 4일 (2026.11.27~)',
        who: '난임 검사·시술을 받는 근로자',
        bullets: ['11월 27일부터 유급이 2일 → 4일로 늘어나요', '시술비 지원 결정통지서로 진단서 대신 가능'],
        actions: [L('고용노동부 안내', 'https://www.moel.go.kr/news/enews/report/enewsView.do?news_seq=19813')],
      },
      {
        tab: 'worker',
        title: '배우자 출산휴가 · 아빠 휴가',
        amount: '20일 유급',
        amountNote: '최대 168만 원',
        who: '배우자가 출산한 근로자',
        bullets: ['나눠 쓸 수 있고, 중소기업은 20일 모두 정부 지원', '배우자 유산·사산휴가 5일, 임신 중 육아휴직도 새로 생겼어요 (2026.9)'],
        actions: [L('고용24', 'https://www.work24.go.kr'), L('정책브리핑', 'https://www.korea.kr/news/policyNewsView.do?newsId=148970585', false)],
      },
    ],
    shopTitle: '함께 준비하면 좋은 물건',
    shop: [
      { name: '출산 준비물 세트', url: '' },
      { name: '신생아 기저귀', url: '' },
      { name: '수유 쿠션·젖병', url: '' },
      { name: '임산부 튼살 크림', url: '' },
    ],
  },
  {
    key: 'kids',
    name: '영유아',
    age: '0~6세 · 미취학',
    emoji: '🧒',
    intro: '태어나서 학교 가기 전까지는 매달 받는 현금(부모급여·아동수당)과 보육료가 핵심이에요. 출생 후 60일 안에 신청해야 태어난 달부터 받아요.',
    cards: [
      {
        title: '부모급여',
        amount: '월 100만 원',
        amountNote: '0세 기준',
        who: '만 2세 미만 아이 · 소득 기준 없음',
        bullets: ['0세 월 100만 원, 1세 월 50만 원 (매달 25일)', '어린이집에 다니면 보육료만큼 빼고 차액을 현금으로'],
        actions: [L('복지로에서 신청', 'https://www.bokjiro.go.kr'), D('d-baby-money', '나이별 받는 돈')],
      },
      {
        title: '아동수당',
        amount: '월 10만~13만 원',
        amountNote: '지역별 추가',
        who: '2026년 만 9세 미만 · 소득 기준 없음',
        bullets: ['비수도권·인구감소지역은 월 5천~2만 원 더', '2030년까지 해마다 1살씩 늘어 13세 미만까지'],
        actions: [L('복지로에서 신청', 'https://www.bokjiro.go.kr')],
      },
      {
        title: '보육료 · 유아 무상교육',
        amount: '기본 보육료 0원',
        amountNote: '국민행복카드',
        who: '어린이집·유치원 다니는 0~5세',
        bullets: ['0~2세 보육료 바우처, 3~5세 누리과정 지원', '2026년부터 4~5세는 추가로 월 2만~11만 원 덜 내요 (자동)'],
        actions: [L('복지로에서 신청', 'https://www.bokjiro.go.kr'), D('d-baby-money', '나이별 받는 돈')],
      },
      {
        title: '가정양육수당',
        amount: '월 10만 원',
        amountNote: '집에서 키울 때',
        who: '어린이집·유치원 안 다니는 24~86개월 아이',
        bullets: ['소득과 상관없이 받아요', '어린이집에 가면 보육료로 바뀌어요'],
        actions: [L('복지로에서 신청', 'https://www.bokjiro.go.kr')],
      },
      {
        title: '아이돌봄서비스',
        amount: '이용료 일부 지원',
        amountNote: '시간당 1만 2,790원 기준',
        who: '만 12세 이하 · 정부지원은 기준중위소득 250% 이하',
        bullets: ['아이돌보미가 집으로 와서 돌봐요 (연 960시간)', '2026년 지원 소득 기준이 200% → 250%로 넓어졌어요'],
        actions: [L('아이돌봄서비스', 'https://www.idolbom.go.kr'), L('복지로', 'https://www.bokjiro.go.kr', false)],
      },
      {
        tab: 'worker',
        title: '육아휴직 급여',
        amount: '월 최대 250만 원',
        amountNote: '첫 3개월',
        who: '만 8세 이하 자녀를 둔 고용보험 가입 근로자',
        bullets: ['부모가 함께 쓰면(6+6) 첫 6개월 최대 월 450만 원', '쉬는 동안 바로 전액 지급 · 최대 1년 6개월'],
        actions: [L('고용24에서 신청', 'https://www.work24.go.kr'), D('d-parental-leave')],
      },
      {
        tab: 'worker',
        title: '일하는 부모 지원',
        amount: '배우자 출산휴가 20일',
        amountNote: '유급',
        who: '근로자 부모',
        bullets: ['육아기 근로시간 단축: 만 12세 이하 자녀, 줄인 월급 일부 지원', '단기 육아휴직(2026.8 신설): 방학·입원 때 1~2주, 연 1회'],
        actions: [L('고용24', 'https://www.work24.go.kr'), D('d-parental-leave')],
      },
      {
        title: '영유아 건강검진 · 예방접종',
        amount: '무료',
        who: '생후 14일~71개월 (검진) · 12세 이하 (필수접종)',
        bullets: ['건강검진 8번 · 구강검진은 시기에 맞춰 무료', '독감 무료 접종은 생후 6개월~14세 (2027.4.30까지)'],
        actions: [L('예방접종도우미', 'https://nip.kdca.go.kr'), L('건강보험공단', 'https://www.nhis.or.kr', false)],
      },
      {
        title: '기저귀 · 조제분유 지원',
        amount: '월 7만 · 9만 원',
        amountNote: '국민행복카드',
        who: '0~24개월 · 기초·차상위·한부모, 중위소득 80% 이하 장애인·다자녀 가정',
        bullets: ['출생 60일 안에 신청하면 24개월 모두 받아요', '분유는 모유수유가 어려운 경우 등'],
        actions: [L('복지로에서 신청', 'https://www.bokjiro.go.kr')],
      },
      {
        title: '서울 엄마아빠택시 · 키즈카페',
        amount: '택시 연 10만 원',
        amountNote: '서울',
        who: '서울에 사는 24개월 이하 영아 가정',
        bullets: ['카시트 달린 택시 포인트 (다자녀·한부모 추가)', '서울형 키즈카페 2시간 5천 원 · 다둥이행복카드는 무료'],
        actions: [L('서울 몽땅정보통', 'https://umppa.seoul.go.kr')],
      },
      {
        title: '시민안전보험 (자동 가입)',
        amount: '보험료 0원',
        amountNote: '지자체 부담',
        who: '주민등록이 된 모든 주민 (아이 포함)',
        bullets: ['스쿨존 교통사고 부상 치료비 등 (지역마다 항목 다름)', '사고일로부터 3년 안에 청구, 개인 보험과 중복 보상'],
        actions: [L('서울시 안내', 'https://news.seoul.go.kr/safe/archives/506117'), D('d-citizen-ins')],
      },
    ],
    shopTitle: '함께 준비하면 좋은 물건',
    shop: [
      { name: '아이 체온계', url: '' },
      { name: '카시트', url: '' },
      { name: '가습기', url: '' },
    ],
  },
  {
    key: 'school',
    name: '초중고 자녀',
    age: '7~18세 · 학생과 부모',
    emoji: '🎒',
    intro: '학교에 들어가면 입학준비금, 교육비, 방과후, 장학금이 중요해져요. 교육급여·교육비는 3월에 신청해야 1년 내내 받아요.',
    cards: [
      {
        title: '입학준비금',
        amount: '초 20만 · 중고 30만 원',
        amountNote: '서울 기준',
        who: '초·중·고 신입생 (서울은 소득 무관)',
        bullets: ['교복·체육복·옷·책 사는 데 써요 (제로페이 포인트)', '시·도마다 금액이 달라요 → 학교·교육청에 문의'],
        actions: [L('서울시 안내', 'https://news.seoul.go.kr/welfare/archives/528075'), D('d-school-money')],
      },
      {
        title: '교육급여 (교육활동지원비)',
        amount: '연 50만~86만 원',
        amountNote: '바우처 · 연 1회',
        who: '기준중위소득 50% 이하 가구의 초중고생',
        bullets: ['초 50.2만 · 중 69.9만 · 고 86만 원', '처음 받으면 교육급여 바우처 누리집에서 이용권 신청'],
        actions: [L('교육비 원클릭', 'https://oneclick.neis.go.kr'), L('교육급여 바우처', 'https://e-voucher.kosaf.go.kr', false), D('d-school-money')],
      },
      {
        title: '교육비 지원 (교육청)',
        amount: '급식비·방과후·통신비',
        who: '저소득 가구 초중고생 (시·도별 소득 기준)',
        bullets: ['방과후 자유수강권, PC·인터넷 통신비 등', '3월 집중 신청 · 연중 신청 가능 (신청한 달부터)'],
        actions: [L('교육비 원클릭', 'https://oneclick.neis.go.kr')],
      },
      {
        title: '아동수당 (초등 저학년)',
        amount: '월 10만~13만 원',
        who: '2026년 만 9세 미만',
        bullets: ['초등 1~2학년 대부분 받아요', '2027년 10세 미만 → 2030년 13세 미만까지 확대'],
        actions: [L('복지로에서 신청', 'https://www.bokjiro.go.kr')],
      },
      {
        title: '초3 방과후 이용권',
        amount: '연 50만 원',
        amountNote: '2026년',
        who: '초등 3학년 희망 학생',
        bullets: ['방과후 수업에 쓰는 이용권', '늘봄학교(초1·2)는 학교 방과후 프로그램 운영'],
        actions: [L('정책브리핑 안내', 'https://www.korea.kr/news/policyNewsView.do?newsId=148958996')],
      },
      {
        title: '고교 무상교육',
        amount: '수업료·교과서 0원',
        who: '고등학생 (자사고 등 일부 제외)',
        bullets: ['수업료·입학금·학교운영지원비·교과서비 무료', '빠진 학교의 저소득 학생은 교육급여로 학비 지원'],
        actions: [L('교육비 원클릭', 'https://oneclick.neis.go.kr')],
      },
      {
        title: '꿈사다리 장학금',
        amount: '월 15만~35만 원',
        amountNote: '대학 가면 월 45만',
        who: '저소득층 초5~고3 · 학교 추천',
        bullets: ['초 15만 · 중 25만 · 고 35만 원 매달', '매년 봄 모집 (2026년은 4월 마감)'],
        actions: [L('한국장학재단', 'https://www.kosaf.go.kr')],
      },
      {
        title: '한부모가족 아동양육비',
        amount: '월 23만 원',
        amountNote: '자녀 1명당',
        who: '기준중위소득 63% 이하 한부모 가구의 18세 미만 자녀',
        bullets: ['초중고생 학용품비 연 10만 원 따로', '청년 한부모 등은 추가 지원'],
        actions: [L('복지로에서 신청', 'https://www.bokjiro.go.kr')],
      },
      {
        title: 'HPV · 독감 무료 접종',
        amount: '무료',
        who: '2008~2014년생 여학생 · 2014년생 남학생 (HPV)',
        bullets: ['2026년부터 12세 남자아이도 HPV 무료', '독감은 14세까지 무료 (2027.4.30까지)'],
        actions: [L('예방접종도우미', 'https://nip.kdca.go.kr')],
      },
      {
        title: '경기 어린이·청소년 교통비',
        amount: '연 최대 24만 원',
        amountNote: '경기도',
        who: '경기도에 사는 만 6~18세 · 소득 무관',
        bullets: ['버스·지하철 탄 만큼 분기마다 돌려받아요', '늦게 신청하면 지난 분기는 못 받아요'],
        actions: [L('경기도 안내', 'https://gnews.gg.go.kr/news/news_detail.do?number=202603251123487127C076&s_code=C076')],
      },
      {
        tab: 'worker',
        title: '육아기 근로시간 단축',
        amount: '주 10시간까지 월급 100%',
        amountNote: '상한 250만 원 기준',
        who: '어린 자녀를 키우는 근로자',
        bullets: ['2026.9.18부터 \'대체인력 없음\'으로 회사가 거절 못 해요', '고용24에서 급여 신청'],
        actions: [L('고용24', 'https://www.work24.go.kr')],
      },
      {
        tab: 'worker',
        title: '단기 육아휴직 · 가족돌봄휴가',
        amount: '1~2주 휴직',
        amountNote: '2026.8.20 신설',
        who: '8세(초2) 이하 자녀를 둔 근로자',
        bullets: ['방학·휴원·입원 때 1~2주 육아휴직 (자녀 1명당 연 1회)', '가족돌봄휴가는 연 10일 (무급, 한부모 25일까지)'],
        actions: [L('정책브리핑', 'https://www.korea.kr/news/policyNewsView.do?newsId=148969857')],
      },
    ],
    checklist: {
      title: '학년별로 챙길 때',
      items: [
        '입학 전 1~2월: 학교·교육청 입학준비금(교복비) 안내 확인',
        '3월: 교육급여·교육비 원클릭 신청 (한 번 받으면 다음 해 자동)',
        '4월: 꿈사다리 장학금 학교 추천 (초5~고3)',
        '9월~: 독감 무료 접종 (14세까지)',
        '고3 겨울: 대학 국가장학금 1차 신청 (청년 분야 참고)',
      ],
    },
    shopTitle: '학교 갈 때 필요한 물건',
    shop: [
      { name: '초등 책가방', url: '' },
      { name: '공부 스탠드', url: '' },
      { name: '색연필', url: '' },
    ],
  },
  {
    key: 'youth',
    name: '청년',
    age: '19~34세 · 결혼·신혼 포함',
    emoji: '🧑‍🎓',
    intro: "대학생은 국가장학금부터, 사회초년생은 취업·교통비·주거 지원부터 챙기세요. 전체 청년정책은 '온통청년'에서 조건을 넣고 찾을 수 있어요.",
    cards: [
      {
        title: '국가장학금',
        amount: '연 최대 600만 원',
        amountNote: '기초·차상위는 등록금 전액',
        who: '소득 1~9구간 대학생',
        bullets: ['1~3구간 600 · 4~6구간 440 · 7~8구간 360 · 9구간 100만 원', '다자녀 셋째부터 등록금 전액 · 1학기분은 전년 11~12월 신청'],
        actions: [L('한국장학재단', 'https://www.kosaf.go.kr'), D('d-scholarship')],
      },
      {
        title: '주거안정장학금',
        amount: '월 최대 20만 원',
        amountNote: '연 240만 원',
        who: '기초·차상위 · 부모 집과 먼 곳에 사는 39세 이하 미혼 대학생',
        bullets: ['월세·기숙사비·관리비를 지원해요', '국가장학금 신청할 때 함께 신청'],
        actions: [L('한국장학재단', 'https://www.kosaf.go.kr'), D('d-scholarship')],
      },
      {
        title: '국가근로장학금 · 천원의 아침밥',
        amount: '일하고 장학금',
        who: '대학생',
        bullets: ['학교 안팎에서 일하고 시급만큼 장학금 (1학기분은 국가장학금과 함께 신청)', '참여 대학은 아침밥을 1,000원에 (2026년 540만 끼)'],
        actions: [L('한국장학재단', 'https://www.kosaf.go.kr')],
      },
      {
        tab: 'worker',
        title: '국민취업지원제도',
        amount: '구직촉진수당 월 60만 원',
        who: '취업을 준비하는 저소득 구직자·청년 (요건 심사)',
        bullets: ['2026년 월 50만 → 60만 원으로 인상', '2027년 월 65만 원 인상 추진 (국회 심의 중)'],
        actions: [L('고용24 바로가기', 'https://www.work24.go.kr')],
      },
      {
        tab: 'worker',
        title: '국민내일배움카드',
        amount: '1인 300만~500만 원',
        amountNote: '5년간 훈련비',
        who: '국민 누구나 (공무원·고소득자 등 제외)',
        bullets: ['직업훈련비의 45~100% 지원', '고용24에서 카드 신청'],
        actions: [L('고용24 바로가기', 'https://www.work24.go.kr')],
      },
      {
        tab: 'worker',
        title: 'K-패스 (교통비 환급)',
        amount: '청년 30% 환급',
        who: '19~34세 대중교통 이용자',
        bullets: ['쓴 교통비의 30%를 돌려받아요', '정액형과 비교해 유리한 방식 자동 적용 · 앱 등록 필요'],
        actions: [L('정책브리핑 안내', 'https://www.korea.kr/news/policyNewsView.do?newsId=148958934')],
      },
      {
        title: '자립준비청년 지원',
        amount: '월 50만 원 + 정착금',
        amountNote: '최장 5년',
        who: '시설·위탁 보호가 끝난 청년',
        bullets: ['자립수당 월 50만 원 (행정복지센터 신청)', '자립정착금 1,000만~2,000만 원 (지역마다 다름)'],
        actions: [L('복지로', 'https://www.bokjiro.go.kr')],
      },
      {
        title: '청년문화예술패스',
        amount: '15만 원',
        amountNote: '비수도권 20만 원',
        who: '2026년 기준 19~20세',
        bullets: ['공연·전시·영화 관람비 지원 (평생 1회)', '2026년 신청은 6월 마감 · 내년 모집 확인'],
        actions: [L('정책브리핑 안내', 'https://www.korea.kr/news/policyNewsView.do?newsId=148959314')],
      },
      {
        title: '마음건강 심리상담',
        amount: '상담 8회',
        amountNote: '본인부담 0~30%',
        who: '우울·불안 등 마음이 힘든 국민',
        bullets: ['전문 심리상담 8번 (자립준비청년은 무료)', '복지로·주민센터에서 신청'],
        actions: [L('복지로', 'https://www.bokjiro.go.kr')],
      },
      {
        title: '온통청년 (청년정책 통합 검색)',
        amount: '5개 분야',
        amountNote: '국무조정실 운영',
        bullets: ['일자리 · 주거 · 교육 · 복지문화 · 참여권리', '지역·나이로 내게 맞는 정책 검색, 청년 상담'],
        actions: [L('온통청년 바로가기', 'https://www.youthcenter.go.kr')],
      },
      {
        group: '결혼·신혼',
        title: '혼인 세액공제 (2026년 마지막)',
        amount: '부부 최대 100만 원',
        amountNote: '1인 50만 원',
        who: '2024.1.1 ~ 2026.12.31 혼인신고 · 생애 1회',
        bullets: ['낼 세금이 있어야 그만큼 공제돼요 (현금 지급 아님)', '연말정산 또는 5월 종합소득세 신고 때 적용'],
        actions: [D('d-marriage-money')],
        tone: 'flag',
      },
      {
        group: '결혼·신혼',
        title: '혼인지원금 (2027년 예정)',
        amount: '부부 100만 원',
        amountNote: '현금 · 정부안',
        who: '2027.1.1 이후 혼인신고 · 소득·나이 무관 · 재혼 포함',
        bullets: ['1인 50만 원씩 본인 계좌로, 2027년 하반기 지급 예정', '국회 예산 심의 후 확정'],
        actions: [D('d-marriage-money')],
        tone: 'plan',
      },
      {
        group: '결혼·신혼',
        title: "서울 '더 아름다운 결혼식'",
        amount: '비품비 100만 원',
        who: '서울 공공예식장 이용 예비부부',
        bullets: ['남산 한남웨딩가든 등 공공예식장 61곳', '상담부터 예식 진행까지 지원'],
        actions: [L('서울시 안내', 'https://news.seoul.go.kr/welfare/archives/577079')],
      },
      {
        group: '결혼·신혼',
        title: '전남 청년부부 결혼축하금',
        amount: '200만 원',
        who: '혼인신고일 기준 49세 이하 · 전남 6개월 이상 거주',
        bullets: ['혼인신고 6개월 후부터 1년 6개월 안에 신청', '읍면동 행정복지센터 또는 전남 아이톡'],
        actions: [L('전남 아이톡', 'https://italk.jeonnam.go.kr')],
      },
      {
        group: '결혼·신혼',
        title: '내 지역 결혼 지원 한 번에 찾기',
        amount: '보조금24',
        who: '거주지·나이·가족 정보로 맞춤 조회',
        bullets: ['지역별 결혼축하금·신혼부부 지원 검색'],
        actions: [L('정부24 바로가기', 'https://www.gov.kr/portal/rcvfvrSvc/dtlEx/646000000122')],
      },
      {
        tab: 'single',
        title: '청년월세 지원',
        amount: '월 최대 20만 원',
        amountNote: '최장 24개월 · 평생 1회',
        who: '부모와 따로 사는 19~34세 무주택 청년',
        bullets: ['해마다 기간을 정해 모집 (2026년은 5.29 마감)', '서울은 서울시 청년월세(19~39세, 월 20만 × 12개월)도 따로'],
        actions: [L('복지로 바로가기', 'https://www.bokjiro.go.kr')],
      },
      {
        tab: 'single',
        title: '전세사기 예방 체크리스트',
        amount: '단계별 서류 확인',
        amountNote: '계약 전 → 입주 후',
        who: '전월세 계약을 앞둔 모든 세입자',
        bullets: ['등기부등본 · 건축물대장 · 집주인 세금 체납을 먼저 확인', '잔금 날 등기부 다시 확인 + 그날 전입신고·확정일자'],
        actions: [D('d-jeonse', '단계별로 보기')],
      },
      {
        tab: 'single',
        title: '전세피해지원센터',
        amount: '상담 1533-8119',
        amountNote: 'HUG 운영',
        who: '전세 피해가 의심되거나 생긴 세입자',
        bullets: ['무료 법률상담 · 긴급 거처 · 심리상담 한곳에서', '법률구조공단 132에서도 무료 법률상담'],
        actions: [L('전세피해지원센터', 'https://www.khug.or.kr/jeonse/web/s01/s010002.jsp'), D('d-jeonse-victim')],
      },
      {
        tab: 'single',
        title: '전세사기 피해자 지원',
        amount: '보증금 최소 1/3 보장',
        amountNote: '2026.11.13 시행',
        who: '전세사기피해자로 결정된 사람',
        bullets: ['사는 시·도에 피해자 결정 신청 (특별법 2027.5.31까지)', '돌려받은 돈이 보증금 1/3에 못 미치면 나라가 차액 지원'],
        actions: [L('정책브리핑 안내', 'https://www.korea.kr/news/policyNewsView.do?newsId=148973064'), D('d-jeonse-victim')],
        tone: 'flag',
      },
      {
        tab: 'single',
        title: '청년 주거급여 · 공공임대 상담',
        amount: '주거급여 따로 받기',
        who: '주거급여 받는 가구의 19~29세 미혼 자녀 (부모와 다른 시·군 거주)',
        bullets: ['부모님과 따로 내 월세를 주거급여로 받아요 (복지로 신청)', '행복주택 등 공공임대 자격은 마이홈 1600-1004'],
        actions: [L('복지로', 'https://www.bokjiro.go.kr'), L('마이홈포털', 'https://www.myhome.go.kr', false)],
      },
      {
        tab: 'single',
        title: '서울 1인가구 안심 지원',
        amount: '안심장비 무료',
        amountNote: '서울',
        who: '서울에 사는 1인가구',
        bullets: ['스마트초인종·홈캠 등 안심홈세트, 누르면 출동 요청하는 안심벨', '혼자 병원 갈 때 동행 매니저 (시간당 6천 원, 저소득 무료)'],
        actions: [L('서울시 안내', 'https://love.seoul.go.kr/articles/10589')],
      },
      {
        tab: 'worker',
        title: '중소기업 취업 청년 소득세 감면',
        amount: '소득세 90% 감면',
        amountNote: '5년 · 연 200만 원 한도',
        who: '중소기업에 취업한 15~34세',
        bullets: ['회사에 감면 신청서만 내면 돼요', '60세 이상·장애인·경력단절자는 70%, 3년'],
        actions: [L('정책브리핑', 'https://www.korea.kr/news/policyNewsView.do?newsId=148958309')],
      },
      {
        tab: 'worker',
        title: '청년 근속 인센티브',
        amount: '2년간 최대 480만~720만 원',
        amountNote: '비수도권',
        who: '비수도권 참여기업에 정규직으로 취업한 청년',
        bullets: ['청년 본인에게 직접 줘요 (6·12·18·24개월째)', '지역(일반·우대·특별)에 따라 금액이 달라요'],
        actions: [L('고용24', 'https://www.work24.go.kr'), L('정책브리핑', 'https://www.korea.kr/news/policyNewsView.do?newsId=148972497', false)],
      },
      {
        tab: 'worker',
        title: '근로장려금',
        amount: '단독 최대 165만 원',
        amountNote: '맞벌이 최대 330만 원',
        who: '소득·재산 기준을 갖춘 일하는 가구',
        bullets: ['정기 신청은 5월 · 놓쳤다면 12월 1일까지 (95% 지급)', '1인 가구는 연소득 2,200만 원 미만'],
        actions: [L('홈택스', 'https://www.hometax.go.kr')],
      },
      {
        tab: 'worker',
        title: '임금체불 · 직장 내 괴롭힘 신고',
        amount: '상담 1350',
        who: '모든 근로자',
        bullets: ['노동포털에서 온라인 진정 (체불·괴롭힘 공통)', '체불 대지급금: 간이 최대 1,000만 원까지 나라가 먼저'],
        actions: [L('노동포털 진정', 'https://labor.moel.go.kr/minwonApply/minwonFormat.do?searchVal=SN001')],
      },
    ],
    shopTitle: '혼자 살거나 신혼 살림 준비할 때',
    shop: [
      { name: '신혼 주방 살림', url: '' },
      { name: '침구 세트', url: '' },
      { name: '현관 보조키·도어락', url: '' },
      { name: '1인 가구 수납용품', url: '' },
    ],
  },
  {
    key: 'midlife',
    name: '중장년',
    age: '40~64세',
    emoji: '🧑‍💼',
    intro: '40대부터는 건강검진과 노후 준비, 퇴직 뒤 재취업이 중요해져요. 갑자기 어려워지면 129(보건복지상담센터)에 먼저 연락하세요.',
    cards: [
      {
        title: '생애전환기 건강검진',
        amount: '무료',
        amountNote: '만 40세 · 66세',
        who: '만 40세가 되는 해 (국가건강검진)',
        bullets: ['40세: B형간염·생활습관·구강 검사 추가', '공단 안내문 받으면 신분증만 들고 지정 병원으로'],
        actions: [L('건강보험공단', 'https://www.nhis.or.kr')],
      },
      {
        title: '국가 암검진 (6대 암)',
        amount: '본인부담 10%',
        amountNote: '대장·자궁경부암 무료',
        who: '위·유방암 40세+ 2년마다 · 대장암 50세+ 매년',
        bullets: ['간암 40세+ 고위험군, 폐암 54~74세 고위험군', '의료급여 수급자는 전액 무료'],
        actions: [L('국가암정보센터', 'https://www.cancer.go.kr/lay1/S1T261C262/contents.do')],
      },
      {
        title: '노후준비서비스',
        amount: '무료 상담',
        amountNote: '☎ 1355',
        who: '국민 누구나 (국민연금공단)',
        bullets: ['돈·건강·여가·관계를 함께 점검해요', '내 연금 예상액과 노후 준비 상담'],
        actions: [L('국민연금공단', 'https://csa.nps.or.kr/ohkb/gdnc/UHKB0301M0.do')],
      },
      {
        title: '마음건강 심리상담',
        amount: '상담 8회',
        amountNote: '본인부담 0~50%',
        who: '우울·불안이 있는 분 (나이·소득 제한 없음)',
        bullets: ['의뢰서·진단서 또는 검진 우울척도 10점 이상', '주민센터·복지로에서 신청'],
        actions: [L('복지로', 'https://www.bokjiro.go.kr')],
      },
      {
        title: '생계급여 · 의료급여',
        amount: '1인 월 82만 원',
        amountNote: '생계급여 최대',
        who: '소득인정액 기준중위소득 32%(생계)·40%(의료) 이하',
        bullets: ['2027년 생계급여 1인 87.6만 원으로 인상 확정', '의료급여는 2026년 부양비 폐지'],
        actions: [L('복지로에서 신청', 'https://www.bokjiro.go.kr'), D('d-median')],
      },
      {
        title: '긴급복지지원',
        amount: '1인 월 78만 원',
        amountNote: '생계지원',
        who: '실직·폐업·중병 등 갑자기 위기에 처한 가구',
        bullets: ['먼저 지원하고 나중에 조사해요', '☎ 129 (24시간) 또는 주민센터'],
        actions: [L('복지로', 'https://www.bokjiro.go.kr')],
      },
      {
        title: '에너지바우처 · 문화누리카드',
        amount: '난방비 · 연 15만 원',
        who: '기초수급·차상위 가구',
        bullets: ['에너지바우처 12월 31일 신청 마감 (연 29.5만~70.1만 원)', '문화누리카드 11월 30일 발급 마감'],
        actions: [L('복지로', 'https://www.bokjiro.go.kr'), L('문화누리카드', 'https://www.mnuri.kr', false)],
        tone: 'flag',
      },
      {
        tab: 'single',
        title: '외로움 상담 · 고독사 예방',
        amount: '무료',
        who: '혼자 지내며 외로움·고립을 느끼는 분과 가족·이웃',
        bullets: ['주민센터에서 안부 확인 서비스로 연결', '서울은 외로움안녕120 (120 → 5번, 24시간)'],
        actions: [L('정책브리핑', 'https://www.korea.kr/news/policyNewsView.do?newsId=148964300')],
      },
      {
        tab: 'single',
        title: '서울 1인가구 지원',
        amount: '병원 동행 · 안심장비',
        amountNote: '서울',
        who: '서울에 사는 1인가구',
        bullets: ['병원 안심동행 시간당 6천 원 (저소득 무료) ☎ 1533-1179', '40~67세 1인가구 요리·모임 프로그램 (1인가구지원센터)'],
        actions: [L('서울시 안내', 'https://love.seoul.go.kr/articles/10589')],
      },
      {
        tab: 'single',
        title: '주거급여 · 공공임대 상담',
        amount: '1인 월 최대 36.9만 원',
        amountNote: '서울 기준',
        who: '소득인정액 기준중위소득 48% 이하',
        bullets: ['경기·인천 30만 · 광역시 24.7만 · 그 밖 21.2만 원 (1인)', '공공임대 자격은 마이홈 1600-1004 · 쪽방·고시원 이주 지원도'],
        actions: [L('복지로', 'https://www.bokjiro.go.kr'), L('마이홈포털', 'https://www.myhome.go.kr', false)],
      },
      {
        tab: 'worker',
        title: '중장년내일센터',
        amount: '무료',
        amountNote: '전국 38곳',
        who: '만 40세 이상 재직자·퇴직(예정)자·구직자',
        bullets: ['경력 진단, 전직·재취업 준비 교육', '생애경력설계 서비스 (40+·50+·60+ 과정)'],
        actions: [L('고용24', 'https://www.work24.go.kr/wk/u/a/1000/seniorCenterSvcInfo.do')],
      },
      {
        tab: 'worker',
        title: '중장년 경력지원제',
        amount: '월 최대 150만 원',
        amountNote: '1~3개월 · 2026 신설',
        who: '만 50~65세 퇴직자 (자격증·훈련 마친 분)',
        bullets: ['새 직무를 기업에서 직접 일하며 경험해요', '실무와 멘토링을 함께 · 문의 1350'],
        actions: [L('정책브리핑', 'https://www.korea.kr/news/policyNewsView.do?newsId=148959330')],
      },
      {
        tab: 'worker',
        title: '서울 중장년 가치동행일자리',
        amount: '월 최대 58만 원',
        amountNote: '월 57시간 · 서울',
        who: '40세 이상 서울시민',
        bullets: ['경력을 살려 지역사회 일자리에서 일해요', '50플러스포털에서 온라인 신청'],
        actions: [L('50플러스포털', 'https://www.50plus.or.kr/nwc/value.do')],
      },
      {
        tab: 'worker',
        title: '실업급여 · 체불 대지급금',
        amount: '하루 최대 6만 8,100원',
        who: '원치 않게 일을 그만둔 고용보험 가입자',
        bullets: ['임금을 못 받았으면 대지급금 (간이 최대 1,000만 원)', '고용24 신청 · 체불 상담 1350'],
        actions: [L('고용24', 'https://www.work24.go.kr')],
      },
      {
        tab: 'worker',
        title: '근로장려금 · 자녀장려금',
        amount: '최대 330만 원',
        amountNote: '자녀 1명당 최대 100만 원',
        who: '소득·재산 기준을 갖춘 일하는 가구',
        bullets: ['홑벌이 285만 · 맞벌이 330만 원까지', '놓쳤다면 12월 1일까지 기한 후 신청 (95% 지급)'],
        actions: [L('홈택스', 'https://www.hometax.go.kr')],
        tone: 'flag',
      },
      {
        tab: 'worker',
        title: '국민내일배움카드',
        amount: '300만~500만 원',
        amountNote: '5년간 훈련비',
        who: '국민 누구나 (공무원·고소득자·75세 이상 제외)',
        bullets: ['재취업·전직에 필요한 직업훈련', '고용24에서 카드 신청'],
        actions: [L('고용24', 'https://www.work24.go.kr')],
      },
    ],
  },
  {
    key: 'senior',
    name: '어르신',
    age: '65세 이상',
    emoji: '👵',
    intro: '무료 예방접종은 신분증만 챙겨 가까운 지정 병원에 가면 됩니다. 보건소에서는 접종하지 않는 곳도 있으니 예방접종도우미에서 병원을 먼저 찾아보세요.',
    cards: [
      {
        title: '국민연금 노령연금',
        amount: '평생 매달 지급',
        amountNote: '10년 이상 가입',
        who: '1969년생 이후는 만 65세부터 (출생연도별 61~65세)',
        bullets: ['최대 5년 당겨 받기: 1년에 6%씩, 최대 30% 감액', '최대 5년 늦춰 받기: 1년에 7.2%씩, 최대 36% 증액', '2026년 1월 연금액 2.1% 인상'],
        actions: [L('국민연금공단', 'https://www.nps.or.kr'), D('d-pension')],
      },
      {
        title: '기초연금',
        amount: '월 최대 34만 9,700원',
        amountNote: '2026년',
        who: '만 65세 이상 · 소득인정액 단독 247만 · 부부 395.2만 원 이하',
        bullets: ['부부가 함께 받으면 각각 20% 감액', '자동 지급 아님, 생일이 속한 달 한 달 전부터 신청'],
        actions: [L('복지로에서 신청', 'https://www.bokjiro.go.kr'), D('d-pension')],
      },
      {
        title: '운전면허 갱신과 자진 반납',
        amount: '반납 시 10만~20만 원',
        amountNote: '지역별',
        who: '65~74세 5년, 75세 이상 3년마다 갱신',
        bullets: ['75세 이상: 인지능력 검사 + 무료 교통안전교육을 먼저 받아야 갱신', '서울 70세 이상 반납 시 20만 원 교통카드 (선착순)', '주민센터에서 반납과 지원금 신청을 한 번에'],
        actions: [L('안전운전 통합민원', 'https://www.safedriving.or.kr'), D('d-driving')],
      },
      {
        title: '독감(인플루엔자) 무료 접종',
        amount: '무료',
        amountNote: '매년',
        bullets: ['75세 이상 10.6 · 70~74세 10.12 · 65~69세 10.15부터', '코로나19와 같은 날 맞기 권장'],
        actions: [L('병원 찾기', 'https://nip.kdca.go.kr'), D('d-vaccine')],
      },
      {
        title: '코로나19 무료 접종',
        amount: '무료',
        amountNote: '~2027.6.30',
        bullets: ['70세 이상 10.12 · 65~69세 10.15부터', '올해부터 필수예방접종으로 바뀜, 1회 접종'],
        actions: [L('병원 찾기', 'https://nip.kdca.go.kr'), D('d-vaccine')],
      },
      {
        title: '폐렴구균 무료 접종',
        amount: '평생 1회 무료',
        who: '1961.12.31 이전 출생 · 23가 백신을 맞은 적 없는 분',
        bullets: ['무료는 23가 다당 백신(PPSV23)만 해당', '지병이 있으면 백신 종류를 의사와 상담'],
        actions: [L('병원 찾기', 'https://nip.kdca.go.kr')],
      },
      {
        title: '요양병원 비용',
        amount: '진료비 약 20% 본인부담',
        bullets: ['진료비·4인실 이상 병실료·식비는 건강보험 적용', '간병비는 지금 100% 본인부담 → 2027년 상반기부터 시범 지원 예정', '1년 의료비가 많으면 본인부담상한제로 환급'],
        actions: [L('건강보험공단', 'https://www.nhis.or.kr'), D('d-care')],
      },
      {
        title: '요양원 (노인장기요양보험)',
        amount: '비용의 80~100% 지원',
        who: '장기요양등급을 받은 어르신',
        bullets: ['돌봄 목적의 시설 · 등급 신청은 건강보험공단', '기초생활수급자는 본인부담 면제'],
        actions: [L('장기요양보험', 'https://www.longtermcare.or.kr'), D('d-care')],
      },
      {
        tab: 'single',
        title: '노인맞춤돌봄서비스',
        amount: '무료',
        who: '65세 이상 기초연금·차상위·수급자 중 돌봄이 필요한 분 (홀로 사는 분 등)',
        bullets: ['안부 확인, 외출·가사 도움, 친구 만들기 프로그램', '주소지 주민센터에서 신청'],
        actions: [L('복지로', 'https://www.bokjiro.go.kr')],
      },
      {
        tab: 'single',
        title: '응급안전안심서비스',
        amount: '감지기·호출기 설치',
        who: '65세 이상 홀로 사는 분 · 노인부부 · 조손가구 (독거는 소득 무관)',
        bullets: ['화재·활동량 감지기와 응급호출기를 집에 달아요', '위급할 때 119로 바로 연결'],
        actions: [L('복지로', 'https://www.bokjiro.go.kr')],
      },
      {
        tab: 'worker',
        title: '노인일자리 (공익활동)',
        amount: '월 29만 원',
        amountNote: '월 30시간',
        who: '65세 이상 기초연금 수급자',
        bullets: ['2026년 노인일자리 115만 개 · 공익활동 70만 개', '역량활용형·공동체사업단 등 다른 유형도 있어요'],
        actions: [L('노인일자리 여기', 'https://www.seniorro.or.kr'), L('정책브리핑', 'https://www.korea.kr/news/policyNewsView.do?newsId=148958935', false)],
      },
    ],
    shopTitle: '어르신 건강에 도움 되는 물건',
    shop: [
      { name: '가정용 혈압계', url: '' },
      { name: '보행 보조 지팡이', url: '' },
      { name: '욕실 미끄럼 방지 매트', url: '' },
    ],
  },
  {
    key: 'disability',
    name: '장애인',
    age: '등록장애인 · 가족',
    emoji: '♿',
    intro: '장애인 혜택은 먼저 주민센터에서 장애인 등록을 해야 받을 수 있어요. 현금 지원은 장애 정도(심한·심하지 않은)와 소득에 따라 달라집니다.',
    cards: [
      {
        title: '장애인연금',
        amount: '월 최대 43만 9,700원',
        amountNote: '2026년',
        who: '만 18세 이상 중증장애인 · 소득인정액 단독 140만 · 부부 224만 원 이하',
        bullets: ['기초급여 34만 9,700원 + 부가급여 3만~9만 원 (소득별)', '만 65세가 되면 기초연금으로 전환'],
        actions: [L('복지로에서 신청', 'https://www.bokjiro.go.kr'), D('d-disability')],
      },
      {
        title: '장애수당',
        amount: '월 6만 원',
        who: '만 18세 이상 경증장애인 중 기초생활수급자·차상위계층',
        bullets: ['보장시설에 입소한 생계·의료급여 수급자는 월 3만 원', '주민센터 또는 복지로에서 신청'],
        actions: [L('복지로', 'https://www.bokjiro.go.kr')],
      },
      {
        title: '활동지원 서비스',
        amount: '바우처',
        amountNote: '본인부담 소득별',
        who: '등록장애인 (서비스 종합조사로 시간 결정)',
        bullets: ['활동지원사가 집으로 와서 식사·목욕·외출·병원 동행', '방문목욕·방문간호도 포함'],
        actions: [L('복지로', 'https://www.bokjiro.go.kr')],
      },
      {
        title: '요금 할인·세금 감면',
        amount: '신청해야 적용',
        bullets: ['휴대폰 요금 35% 할인 (본인 명의 1회선, 통신사·주민센터 신청)', '고속도로 통행료 50% 감면', '시·청각장애인 가정 TV 수신료 면제', '연말정산 장애인 추가공제 1인당 200만 원'],
        actions: [D('d-disability')],
      },
      {
        tab: 'worker',
        title: '근로지원인 서비스',
        amount: '본인부담 시간당 300원',
        amountNote: '하루 8시간까지',
        who: '월 60시간 이상 일하는 중증장애인 근로자',
        bullets: ['업무를 도와주는 근로지원인이 함께 일해요', '사업주 동의를 받아 장애인고용공단에 신청'],
        actions: [L('장애인고용공단', 'https://www.kead.or.kr/sprlbsprt/cntntsPage.do?menuId=MENU0632')],
      },
      {
        tab: 'worker',
        title: '보조공학기기 지원',
        amount: '1인 최대 1,500만 원',
        amountNote: '중증 2,000만 원',
        who: '장애인 근로자 또는 장애인을 고용한 사업주',
        bullets: ['일할 때 필요한 기기를 지원해요', '공단 보조공학센터(hub.kead.or.kr)에서 신청'],
        actions: [L('장애인고용공단', 'https://www.kead.or.kr/atintrdbsns/cntntsPage.do?menuId=MENU0629')],
      },
    ],
    shopTitle: '생활에 도움 되는 물건',
    shop: [
      { name: '안전 손잡이', url: '' },
      { name: '보행 보조기', url: '' },
    ],
  },
  {
    key: 'everyone',
    mini: true,
    name: '모든 나이',
    age: '누구나',
    emoji: '🌐',
    intro: '이미 가입되어 있는 무료 보험, 연말정산에서 돌려받는 기부까지 나이와 상관없이 챙길 수 있어요.',
    cards: [
      {
        title: '시민안전보험 조회·청구',
        amount: '전국 지자체 운영',
        bullets: ['대중교통 사고, 자연재해, 화재·붕괴 등 (지역마다 다름)', "카카오페이 '동네무료보험'에서 우리 동네 보장 확인", '서울 통합상담 1522-3556'],
        actions: [D('d-citizen-ins')],
      },
      {
        title: '고향사랑기부제',
        amount: '10만 원 기부 → 10만 원 공제',
        amountNote: '+ 답례품',
        who: '내 주소지가 아닌 지자체에 기부',
        bullets: ['10만 원까지 전액, 10만~20만 원 구간 44% 세액공제 (2026년부터)', '기부액의 30% 이내 답례품 (한우·쌀 등)'],
        actions: [L('고향사랑e음', 'https://www.ilovegohyang.go.kr')],
      },
      {
        title: '내가 받을 수 있는 혜택 전체 조회',
        amount: '보조금24 · 복지로',
        bullets: ['소득·나이·가족 정보로 맞춤 혜택 자동 조회', '조회 후 각 사업별로 따로 신청해야 받아요'],
        actions: [L('정부24', 'https://www.gov.kr'), L('복지로', 'https://www.bokjiro.go.kr', false)],
      },
    ],
  },
];

export const STAGES: Stage[] = ALL_STAGES;

// ───────── 자세한 내용 ─────────
export const DETAILS: Detail[] = [
  {
    id: 'd-baby-money',
    stage: 'kids',
    title: '나이별로 받는 돈 한눈에 (2026년, 월)',
    blocks: [
      {
        kind: 'table',
        header: ['나이', '어린이집·유치원 다닐 때', '집에서 키울 때'],
        rows: [
          ['0세', '부모급여 100만 중 보육료 바우처 + 현금 약 41.6만 · 아동수당 10만', '부모급여 100만 · 아동수당 10만'],
          ['1세', '보육료 바우처 51.5만 (현금 차액 없음) · 아동수당 10만', '부모급여 50만 · 아동수당 10만'],
          ['2세', '보육료 바우처 · 아동수당 10만', '가정양육수당 10만 · 아동수당 10만'],
          ['3세', '누리과정 지원 · 아동수당 10만', '가정양육수당 10만 · 아동수당 10만'],
          ['4~5세', '누리과정 + 추가 경감(공립 2만·사립유치원 11만·어린이집 7만) · 아동수당 10만', '가정양육수당 10만 · 아동수당 10만'],
        ],
      },
      { kind: 'p', text: '아동수당은 비수도권·인구감소지역이면 월 5천~2만 원을 더 받아요. 부모급여·아동수당은 출생 후 60일 안에 신청해야 태어난 달부터 받을 수 있어요.' },
      { kind: 'h', text: '2027년 예정 (국회 심의 중)' },
      { kind: 'p', text: "정부안: 아동수당을 '아동기본수당'(월 20만 원)으로, 부모급여·첫만남이용권을 '아이맞이지원금'(최대 2,000만 원)으로 바꾸는 계획이에요. 2027년 7월 이후 태어난 아이부터 적용하는 안이라, 국회 예산 통과 후 다시 알려 드릴게요." },
    ],
    source: '정책브리핑 2026년 부모급여·아동수당 안내(2026.1, 2026.5), 유아 무상교육·보육 확대(2026.3)',
  },
  {
    id: 'd-parental-leave',
    stage: 'kids',
    title: '육아휴직 급여 상한 (2026년, 월)',
    blocks: [
      {
        kind: 'table',
        header: ['휴직 개월', '일반', '부모 모두(6+6)', '한부모'],
        rows: [
          ['1~2개월', '250만', '250만', '300만'],
          ['3개월', '250만', '300만', '300만'],
          ['4개월', '200만', '350만', '200만'],
          ['5개월', '200만', '400만', '200만'],
          ['6개월', '200만', '450만', '200만'],
          ['7개월~', '160만 (80%)', '160만 (80%)', '160만'],
        ],
      },
      { kind: 'p', text: '6+6은 생후 18개월 안에 엄마·아빠가 모두 육아휴직을 쓸 때 적용돼요. 동시에 써도, 차례로 써도 돼요.' },
      {
        kind: 'list',
        items: [
          '배우자 출산휴가: 20일 유급, 4번까지 나눠 사용 (중소기업은 20일 모두 정부 지원)',
          '육아기 근로시간 단축: 만 12세 이하 자녀, 단축한 첫 10시간분은 통상임금 100% (상한 250만 원 기준)',
          '단기 육아휴직(2026.8.20 신설): 연 1회, 1~2주 단위',
        ],
      },
    ],
    source: '고용24 제도안내, 정책브리핑(고용노동부 2026.1, 2026.8)',
  },
  {
    id: 'd-school-money',
    stage: 'school',
    title: '초중고 교육비·입학준비금',
    blocks: [
      { kind: 'h', text: '교육급여 교육활동지원비 (연 1회)' },
      {
        kind: 'table',
        header: ['학교', '2025', '2026'],
        rows: [
          ['초등학교', '48.7만', '50.2만'],
          ['중학교', '67.9만', '69.9만'],
          ['고등학교', '76.8만', '86만'],
        ],
      },
      { kind: 'p', text: '기준중위소득 50% 이하 가구가 대상이에요. 처음 받는 해에는 교육급여 바우처 누리집에서 이용권을 따로 신청하고, 내 카드나 간편결제로 포인트를 받아요.' },
      { kind: 'h', text: '입학준비금 (지역마다 다름)' },
      {
        kind: 'table',
        header: ['지역', '금액', '받는 방법'],
        rows: [
          ['서울', '초 20만 · 중·고 30만 원', '학교 신청 → 제로페이 포인트 또는 교복'],
          ['경기', '중·고 교복은 학교에서 지원 · 사각지대 학생 최대 40만 원', '경기민원24'],
          ['그 밖 지역', '시·도·교육청마다 달라요', '학교 가정통신문 · 교육청 확인'],
        ],
      },
      { kind: 'p', text: '2027년 기준중위소득이 6.7% 올라 교육급여 대상(4인 가구 월 약 346만 원 이하)이 조금 넓어져요.' },
    ],
    source: '교육부·복지로 2026 교육급여 안내(2026.3.2), 서울시 입학준비금(2026.3.23), 경기도 2026 신년 브리핑',
  },
  {
    id: 'd-scholarship',
    stage: 'youth',
    title: '국가장학금 구간별 금액 (2026학년도, 연간)',
    blocks: [
      {
        kind: 'table',
        header: ['소득 구간', '일반', '다자녀 첫째·둘째', '다자녀 셋째 이상'],
        rows: [
          ['기초·차상위', '등록금 전액', '전액', '전액'],
          ['1~3구간', '600만', '610만', '전액'],
          ['4~6구간', '440만', '505만', '전액'],
          ['7~8구간', '360만', '465만', '전액'],
          ['9구간', '100만', '135만', '200만'],
        ],
      },
      {
        kind: 'list',
        items: [
          '1학기분은 보통 전년 11~12월에 1차 신청해요. 2027학년도 일정은 한국장학재단 공지를 확인하세요.',
          '주거안정장학금(월 최대 20만 원)과 국가근로장학금도 이때 함께 신청해요.',
          '가구원 정보제공 동의를 꼭 해야 소득구간이 나와요.',
        ],
      },
    ],
    source: '교육부·정책브리핑 2026학년도 국가장학금 지원(2025.11.20)',
  },
  {
    id: 'd-jeonse',
    stage: 'youth',
    title: '전세사기 예방 — 단계별로 확인할 것',
    blocks: [
      { kind: 'h', text: '1. 계약 전' },
      {
        kind: 'list',
        items: [
          '등기부등본 갑구: 집주인 이름, 압류·가압류가 있는지 (인터넷등기소)',
          '등기부등본 을구: 근저당 같은 앞선 빚이 얼마인지 (인터넷등기소)',
          '건축물대장: 위반건축물 표시가 있는지 (정부24)',
          '보증금이 집값의 80%를 넘으면 위험 신호예요 (깡통전세)',
          '다가구주택이면 다른 세입자 보증금(확정일자 부여현황)을 집주인 동의 받아 확인',
          '집주인에게 국세·지방세 납세증명서를 보여 달라고 요청',
          '중개사무소가 정식 등록된 곳인지 확인',
          'HUG 안심전세앱에서 위험 정보를 한 번에 확인',
        ],
      },
      { kind: 'h', text: '2. 계약할 때' },
      {
        kind: 'list',
        items: [
          '계약하는 사람이 등기부상 집주인과 같은 사람인지 신분증으로 확인',
          '대리인이면 인감 찍힌 위임장과 인감증명서 확인',
          '주택임대차 표준계약서로 쓰기',
          '계약서 쓴 날 바로 확정일자 받기 (주민센터·인터넷등기소)',
          '보증금 1천만 원 넘으면 계약 후 집주인 동의 없이 미납 국세 열람 가능 (세무서)',
        ],
      },
      { kind: 'h', text: '3. 잔금·입주 날' },
      {
        kind: 'list',
        items: [
          '잔금 내기 직전에 등기부등본을 다시 떼서 바뀐 게 없는지 확인',
          '보증금은 등기부상 집주인 이름의 계좌로 보내기',
          '이사한 날 바로 전입신고 (대항력은 다음날 0시부터 생겨요)',
          '전월세 계약 신고하기 → 확정일자가 자동으로 붙어요',
        ],
      },
      { kind: 'h', text: '4. 살면서 · 계약 끝날 때' },
      {
        kind: 'list',
        items: [
          '가끔 등기부등본을 떼서 압류·근저당이 새로 생겼는지 확인',
          '보증금을 못 받고 이사해야 하면 임차권등기를 먼저 해 두기',
          '피해가 의심되면 바로 전세피해지원센터 1533-8119',
        ],
      },
    ],
    source: '국토교통부 전세사기 예방 안내, HUG 전세피해지원센터, 대법원 인터넷등기소, 정책브리핑',
  },
  {
    id: 'd-jeonse-victim',
    stage: 'youth',
    title: '전세 피해를 입었을 때',
    blocks: [
      {
        kind: 'table',
        rows: [
          ['전세피해지원센터', '1533-8119 · 법률상담, 긴급 거처(임대료 70% 지원, 최대 2년), 심리상담 1670-5724'],
          ['무료 법률상담', '대한법률구조공단 132 · 대한변협법률구조재단 1661-6579'],
          ['피해자 결정 신청', '사는 시·도에 신청 · 전세사기 특별법은 2027년 5월 31일까지 (2025.6.1 이후 처음 맺은 계약은 제외)'],
          ['보증금 최소 1/3 보장', '2026년 11월 13일 시행 · 돌려받은 금액이 보증금 1/3에 못 미치면 나라가 차액 지원 · LH에 신청, 90일 안에 결정'],
        ],
      },
      { kind: 'p', text: '피해자로 결정되면 주거·법률 지원을 함께 받을 수 있어요. 혼자 해결하려 하지 말고 센터에 먼저 상담하세요.' },
    ],
    source: '국토교통부 보도자료(2026.10.6), HUG 전세피해지원센터, 정책브리핑',
  },
  {
    id: 'd-median',
    stage: 'midlife',
    title: '기준중위소득과 급여 기준 (월)',
    blocks: [
      {
        kind: 'table',
        header: ['구분', '2026 1인', '2026 4인', '2027 1인', '2027 4인'],
        rows: [
          ['기준중위소득', '256.4만', '649.5만', '273.6만', '693.0만'],
          ['생계급여 (32%)', '82.1만', '207.8만', '87.6만', '221.8만'],
          ['의료급여 (40%)', '약 102.6만', '약 259.8만', '-', '-'],
          ['주거급여 (48%)', '약 123.1만', '약 311.7만', '-', '-'],
          ['교육급여 (50%)', '약 128.2만', '약 324.7만', '-', '약 346.5만'],
        ],
      },
      { kind: 'p', text: "'약'이 붙은 금액은 기준중위소득에 비율을 곱해 계산한 값이에요. 실제 선정은 소득과 재산을 함께 따진 '소득인정액'으로 해요." },
    ],
    source: '보건복지부 2026 기준중위소득, 제80차 중앙생활보장위원회(2026.7.28)',
  },
  {
    id: 'd-mom-ins',
    stage: 'pregnancy',
    title: '우체국 대한민국 엄마보험',
    meta: '운영: 과학기술정보통신부 우정사업본부 · 무료 공익보험',
    blocks: [
      {
        kind: 'table',
        rows: [
          ['가입 대상', '17~45세, 임신 22주 이내 임신부와 태아. 엄마(특약)를 빼고 아이만 가입하면 22주 이후에도 출산 전까지 가입 가능. 쌍둥이는 각각 가입(엄마 특약은 1명만).'],
          ['아이 보장', '질병관리청 지정 희귀질환 진단 시 100만 원, 10년 만기'],
          ['엄마 보장', '임신중독증 10만 원 · 임신성 고혈압 5만 원 · 임신성 당뇨병 3만 원 (각 최초 1회, 분만 시까지)'],
          ['보험료', '0원 (우체국 전액 부담) · 심사 없음 · 갱신 절차 없음'],
          ['신청', "우체국보험 홈페이지, 모바일 앱 '잇다 보험', 가까운 우체국 창구"],
        ],
      },
    ],
    source: '우정사업본부 출시 보도(2023.11), 복지로 안내(2026.7 수정)',
  },
  {
    id: 'd-first-meet',
    stage: 'pregnancy',
    title: '첫만남이용권',
    blocks: [
      {
        kind: 'table',
        rows: [
          ['금액', '첫째 200만 원 · 둘째 이상 300만 원 (쌍둥이는 아이마다 각각)'],
          ['지급 방식', '국민행복카드 바우처 포인트 (현금 인출 불가)'],
          ['사용처', '산후조리원, 병원, 유아용품 등. 유흥·사행업종, 면세점, 상품권 구입은 불가'],
          ['기한', '출생일로부터 2년 안에 사용 (늦게 신청할수록 쓸 수 있는 기간이 줄어요)'],
          ['신청', '아이 주소지 주민센터, 복지로, 정부24 · 출생신고 때 함께 신청하면 편해요'],
          ['함께 받는 것', '부모급여·아동수당과 중복 수급 가능'],
        ],
      },
    ],
    source: '보건복지부 안내, 복지로',
  },
  {
    id: 'd-doula',
    stage: 'pregnancy',
    title: '산모·신생아 건강관리 지원 (산후도우미)',
    blocks: [
      {
        kind: 'list',
        items: [
          '건강관리사가 집으로 와서 산모 회복(부종·유방 관리 등)과 신생아 돌봄을 도와요.',
          '기본 대상은 산모·배우자 건강보험료 합산이 기준중위소득 150% 이하인 가정. 둘째아 이상, 쌍태아 이상, 장애·희귀난치 산모 등은 소득과 관계없이 예외 지원하는 지역이 많아요.',
          '기준을 넘어도 본인부담금을 내고 이용할 수 있어요. 서비스 기간은 단축·표준·연장형 중 선택.',
          '신청 기간: 출산예정일 40일 전부터 출산일로부터 60일까지. 관할 보건소 방문 또는 복지로 온라인.',
        ],
      },
    ],
    source: '보건복지부 2026년 산모·신생아 건강관리 지원사업, 인천시 안내',
  },
  {
    id: 'd-postpartum',
    stage: 'pregnancy',
    title: '지역별 산후조리비',
    blocks: [
      {
        kind: 'table',
        header: ['지역', '내용 (2026년)'],
        rows: [
          ['서울', "서울형 산후조리경비: 첫째 100만 · 둘째 120만 · 셋째 이상 150만 원. 2026년부터 '탄생육아 몽땅정보통'에서 신청"],
          ['경기', '경기도 산후조리비(50만 원, 지역화폐)는 2026.9.30 신청분까지만 지원하고 종료. 시흥시(50만 원)처럼 시·군 자체 지원은 계속되는 곳이 있으니 시·군 보건소에 확인'],
          ['인천', '맘편한 산후조리비: 인천 1년 이상 거주 취약계층 산모에게 인천e음 포인트로 지원(2025년 보도 기준 1인 150만 원 상당). 연수구 등 구 자체 50만 원 지원도 있음'],
          ['전남·광주', "전남은 '아이톡', 광주는 '광주아이키움'에서 확인 (2027년 통합 예정)"],
          ['그 밖의 지역', "거주지 보건소 또는 복지로에서 '산후조리' 검색"],
        ],
      },
    ],
    source: '서울시 보도자료(2026.3.18), 경기도 시·군 종료 안내(2026.9), 인천시·연수구 안내',
  },
  {
    id: 'd-2027-baby',
    stage: 'pregnancy',
    title: '2027년 출산·양육 지원 개편 (정부 예산안)',
    blocks: [
      {
        kind: 'table',
        header: ['출생 순위', '아이맞이지원금 (기본)', '우대지역'],
        rows: [
          ['첫째', '1,000만 원', '1,500만 원'],
          ['둘째', '1,200만 원', '1,700만 원'],
          ['셋째 이상', '1,500만 원', '2,000만 원'],
        ],
      },
      {
        kind: 'list',
        items: [
          '2027년 7월 1일 이후 출생아부터 적용 예정. 6월 30일까지 태어난 아이는 지금 제도(첫만남이용권·부모급여·아동수당)를 받아요.',
          '출생 후 1년간 나눠서 현금으로 지급하는 방식으로 발표됐어요.',
          '보건복지부는 2027년 1월 1일 출생아까지 넓히는 방안을 검토 중이라고 국회에 보고했어요 (2026.10 보도).',
          '아직 확정이 아니에요. 아동수당법 개정과 국회 예산 심의를 거쳐 12월쯤 윤곽이 나옵니다.',
        ],
      },
    ],
    source: "정부 '청년예산 언박싱 2027' 발표(2026.8.28), 보건복지부 2027년 예산안",
  },
  {
    id: 'd-citizen-ins',
    stage: 'kids',
    title: '시민안전보험',
    blocks: [
      {
        kind: 'list',
        items: [
          '지자체가 보험료를 전액 내고 주민을 단체로 가입시키는 보험이에요. 주민등록만 되어 있으면 자동 가입(전입 시 가입, 전출 시 해지), 등록외국인도 포함되는 곳이 많아요.',
          '보장 항목과 금액은 지역마다 달라요. 자연재해, 화재·폭발·붕괴, 대중교통 이용 중 사고, 스쿨존 교통사고 부상 치료비, 개 물림 등이 대표적이에요.',
          '다른 지역에서 난 사고도 사고 당시 주민등록지 기준으로 보상받을 수 있어요.',
          '개인 실손보험 등과 중복 보상이 가능해요.',
          '상법에 따라 만 15세 미만은 사망 보장에서 제외돼요.',
          '청구: 사고일로부터 3년 이내. 지역 상담센터에 전화해 필요 서류를 안내받은 뒤 보험사에 접수. 서울·여러 자치구 통합상담 1522-3556.',
          "우리 동네 보장 내용은 카카오페이 앱에서 '동네무료보험'을 검색하면 볼 수 있어요.",
        ],
      },
    ],
    source: '서울시 시민안전보험 안내(2026.3 수정), 강동구·포항시 안내',
  },
  {
    id: 'd-marriage-money',
    stage: 'youth',
    title: '혼인 세액공제와 혼인지원금',
    blocks: [
      {
        kind: 'table',
        header: ['', '혼인 세액공제', '혼인지원금 (예정)'],
        rows: [
          ['혼인신고 시기', '2024.1.1 ~ 2026.12.31', '2027.1.1 이후'],
          ['금액', '1인 50만 원 (부부 최대 100만 원), 생애 1회', '1인 50만 원 (부부 100만 원), 생애 1회'],
          ['받는 방법', '세금에서 빼줌. 낼 세금이 50만 원보다 적으면 그만큼만 공제', '본인 계좌로 현금 지급, 2027년 하반기 예정'],
          ['소득 조건', '세금을 내는 사람만 혜택', '소득·나이 무관, 재혼도 포함'],
          ['상태', '시행 중 (올해 일몰)', '2027년 예산안 단계, 국회 심의 중'],
        ],
      },
      { kind: 'p', text: '혼인신고를 내년으로 미루면 100만 원을 받을 수 있지만, 청약·주택대출처럼 혼인 여부가 조건에 영향을 주는 계획이 있으면 먼저 따져 보세요.' },
    ],
    source: '기획재정부 세법(2024~2026 한시), 성평등가족부 2027년 예산안(2026.9.1)',
  },
  {
    id: 'd-vaccine',
    stage: 'senior',
    title: '어르신 무료 예방접종 (2026~2027절기)',
    blocks: [
      {
        kind: 'table',
        header: ['대상', '독감 시작일', '코로나19 시작일'],
        rows: [
          ['75세 이상 (1951.12.31 이전 출생)', '10월 6일', '10월 12일'],
          ['70~74세 (1952~1956년생)', '10월 12일', '10월 12일'],
          ['65~69세 (1957~1961년생)', '10월 15일', '10월 15일'],
        ],
      },
      {
        kind: 'list',
        items: [
          '코로나19는 2027년 6월 30일까지, 과거 접종력과 관계없이 1회. 이전 접종 후 최소 3개월이 지나야 해요.',
          '코로나19 접종은 올해부터 필수예방접종으로 바뀌었어요.',
          '장소: 전국 지정 위탁의료기관(주소지 무관). 보건소에서 접종하지 않는 지역도 있어요.',
          '준비물: 신분증. 접종 후 20~30분 머물며 이상반응을 확인한 뒤 귀가하세요.',
          '폐렴구균: 1961.12.31 이전 출생자 중 23가 백신을 맞지 않은 분, 연중 1회 무료. 다른 종류(단백결합 백신)는 유료라 의사와 상담 후 결정하세요.',
        ],
      },
    ],
    source: '질병관리청 보도자료(2026.9.17, 10.2)',
  },
  {
    id: 'd-pension',
    stage: 'senior',
    title: '국민연금 노령연금과 기초연금',
    blocks: [
      {
        kind: 'table',
        header: ['출생연도', '노령연금 받는 나이', '당겨 받기 (최대 5년)'],
        rows: [
          ['1953~1956년생', '61세', '56세부터'],
          ['1957~1960년생', '62세', '57세부터'],
          ['1961~1964년생', '63세', '58세부터'],
          ['1965~1968년생', '64세', '59세부터'],
          ['1969년생 이후', '65세', '60세부터'],
        ],
      },
      {
        kind: 'list',
        items: [
          "가입기간이 10년(120개월) 이상이어야 노령연금을 받아요. 10년이 안 되면 낸 보험료에 이자를 붙인 '반환일시금'을 받습니다.",
          '조기노령연금: 1개월당 0.5%(1년 6%) 줄어들고, 줄어든 금액이 평생 그대로예요. 최대 30% 감액.',
          '연기연금: 1개월당 0.6%(1년 7.2%) 늘어나요. 최대 5년, 36% 증액.',
          '연금을 받으면서 소득이 일정 기준을 넘으면 받기 시작한 뒤 5년 동안 일부 감액될 수 있어요. 감액은 연금의 50%를 넘지 않아요.',
          "예상 수령액은 '내 곁에 국민연금' 앱이나 공단 누리집에서 본인 인증 후 바로 조회돼요. 상담 1355.",
        ],
      },
      { kind: 'h', text: '기초연금 (2026년)' },
      {
        kind: 'list',
        items: [
          '만 65세 이상, 소득인정액이 단독가구 월 247만 원, 부부가구 월 395만 2천 원 이하인 분.',
          '월 최대 34만 9,700원. 부부가 모두 받으면 각각 20% 감액돼요.',
          '국민연금을 많이 받으면 기초연금이 일부 줄어들 수 있어요 (연계감액).',
          '공무원·사학·군인연금 등 직역연금 수급자와 배우자는 원칙적으로 제외돼요.',
          '생일이 속한 달의 한 달 전부터 주민센터, 국민연금공단 지사, 복지로에서 신청.',
        ],
      },
    ],
    source: '국민연금법, 국민연금공단, 보건복지부 2026년 기초연금 고시',
  },
  {
    id: 'd-driving',
    stage: 'senior',
    title: '어르신 운전면허 갱신과 자진 반납 지원',
    blocks: [
      {
        kind: 'table',
        header: ['나이', '갱신 주기', '추가 의무'],
        rows: [
          ['65~74세', '5년', '70세 이상은 2종 면허도 적성검사(신체검사) 대상'],
          ['75세 이상', '3년', '인지능력 검사(병원·치매안심센터·면허시험장) → 고령운전자 교통안전교육(무료) 이수 → 적성검사'],
        ],
      },
      { kind: 'p', text: "교육 예약과 갱신 신청은 한국도로교통공단 '안전운전 통합민원'에서 할 수 있어요. 갱신기간은 해당 연도 생일 전후 6개월이에요." },
      {
        kind: 'table',
        header: ['지역 (2026년)', '반납 대상', '지원'],
        rows: [
          ['서울', '70세 이상 (1956.12.31 이전 출생)', '20만 원 충전 선불 교통카드, 1.28부터 예산 소진 시까지 선착순'],
          ['인천', '65세 이상', '인천e음카드 10만 원, 실제 운전 증빙 시 10만 원 추가(총 20만 원), 12.31까지 선착순'],
          ['그 밖의 지역', '65세 또는 70세 이상 (지역마다 다름)', '대부분 10만~30만 원 상당 교통카드·지역화폐, 1회 지급'],
        ],
      },
      { kind: 'p', text: '거주지 주민센터에 유효한 면허증을 가져가면 반납과 지원금 신청을 한 번에 할 수 있어요. 반납하면 면허가 취소되니, 다시 운전하려면 새로 따야 합니다.' },
      { kind: 'p', text: "우리 지역 반납 지원은 '우리 동네 혜택 → 어르신 운전면허 반납'에서 정부24에 등록된 지자체 기준으로 볼 수 있어요." },
    ],
    source: '도로교통법, 서울시(2026.1.26), 인천시 교통 누리집',
  },
  {
    id: 'd-disability',
    stage: 'disability',
    title: '장애인 지원 정리 (2026년)',
    blocks: [
      {
        kind: 'table',
        header: ['지원', '대상', '내용'],
        rows: [
          ['장애인연금', '18세 이상 중증, 소득인정액 단독 140만·부부 224만 원 이하', '기초급여 34만 9,700원 + 부가급여 3만~9만 원, 최대 43만 9,700원 (매월 20일 지급)'],
          ['장애수당', '18세 이상 경증, 기초수급·차상위', '월 6만 원 (보장시설 입소 수급자 3만 원)'],
          ['활동지원', '등록장애인, 종합조사로 시간 결정', '활동보조·방문목욕·방문간호 바우처, 소득별 본인부담'],
          ['통신요금', '등록장애인 본인 명의 1회선', '기본료·통화료 35% 할인, 직접 신청해야 적용'],
          ['고속도로', '등록장애인 차량 (장애인 자동차 표지)', '통행료 50% 감면'],
          ['TV 수신료', '시각·청각장애인 가정', '전액 면제 (한전·KBS 1588-1801·주민센터)'],
          ['세금', '본인 또는 부양가족 중 장애인', '연말정산 1인당 200만 원 추가공제, 장애인 전용 보장성 보험료 연 100만 원 한도 세액공제, 중증장애인 승용차 1대 개별소비세 감면'],
          ['법률', '등록장애인', '대한법률구조공단 무료 법률상담·소송 지원 (심의 통과 사건)'],
        ],
      },
      { kind: 'p', text: '장애인 등록은 주민센터에 장애정도 심사용 진단서를 내고 국민연금공단 심사를 받아요. 우리 지역 추가 혜택은 시·군·구 장애인복지과에 문의하세요.' },
    ],
    source: '보건복지부 2026년 장애인연금·장애수당 기준, 찾기쉬운 생활법령정보, 지자체 장애인 감면 안내',
  },
  {
    id: 'd-care',
    stage: 'senior',
    title: '요양병원과 요양원 비용',
    blocks: [
      {
        kind: 'table',
        header: ['', '요양병원', '요양원'],
        rows: [
          ['성격', '치료 목적 의료기관 (건강보험)', '돌봄 목적 노인의료복지시설 (노인장기요양보험)'],
          ['지원', '진료비·4인실 이상 병실료 건강보험 적용, 본인부담 약 20%. 식비 일부 본인부담', '장기요양등급자 대상, 비용의 80~100% 지원'],
          ['간병비', '현재 100% 본인부담. 2027년 상반기부터 2030년까지 시범사업 예정', '시설 비용에 돌봄 포함'],
        ],
      },
      {
        kind: 'list',
        items: [
          '간병비 지원 계획: 의료중심 요양병원 500곳 안팎을 지정해 의료·간병이 많이 필요한 환자(약 8만 5천 명)의 간병비 본인부담을 100%에서 30% 안팎으로 낮추는 방안. 장기요양 1~2등급, 희귀난치·중증질환자 등이 우선 대상이에요.',
          '본인부담상한제: 1년 동안 낸 건강보험 본인부담금이 소득 구간별 상한액을 넘으면 건강보험공단이 돌려줘요. 간병비 같은 비급여는 빠져요.',
        ],
      },
    ],
    source: "보건복지부 '요양병원 의료혁신 및 간병서비스 제도화' 토론회(2026.7.28)",
  },
];

export const FOOTER = {
  notice: '이 앱은 정부·지자체 공식 자료와 보도를 바탕으로 정리한 안내이며, 정부 기관의 공식 앱이 아닙니다. 지원 금액과 조건은 지역과 시기에 따라 달라질 수 있으니 신청 전 각 기관에 꼭 확인하세요.',
  contact: '궁금한 점은 보건복지상담센터 129, 정부민원안내 110으로 문의할 수 있어요.',
};

export function findDetail(id: string): Detail | undefined {
  return DETAILS.find((d) => d.id === id);
}
export function findStage(key: StageKey): Stage {
  return STAGES.find((s) => s.key === key) ?? STAGES[0];
}
