// 생애혜택 안내소 — 정부 혜택 자동 수집
// 출처: 행정안전부_대한민국 공공서비스(혜택) 정보 (공공데이터포털 15113968, 정부24·보조금24와 같은 데이터)
//   목록  GET https://api.odcloud.kr/api/gov24/v3/serviceList
//   상세  GET https://api.odcloud.kr/api/gov24/v3/serviceDetail
// 전체 목록·상세를 1,000개씩 쪽으로 받아(하루 수십 번 호출 → 개발계정 1만 회 한도 안) 우리 분야만 골라 저장해요.
//
// 실행: DATA_GO_KR_KEY=... node --experimental-strip-types scripts/collect-benefits.ts
// 시험: node --experimental-strip-types scripts/collect-benefits.ts --fixture test/fixture.json
//
// 결과: docs/data/app/index.json + app/region/*.json (앱이 읽는 가벼운 파일), docs/data/benefits.json (전체 한 파일),
//       docs/data/benefits-changes.json (지난번과 달라진 것)
// 안전장치: 받은 서비스 수가 너무 적거나 분야 하나라도 0개면 저장하지 않고 실패로 끝내요(앱엔 지난 데이터 유지).

import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname } from 'node:path';

const BASE = 'https://api.odcloud.kr/api/gov24/v3';
const PER_PAGE = 1000;
// 시험(--fixture)일 땐 진짜 데이터를 덮어쓰지 않게 임시 폴더에 써요
const DIR = process.argv.includes('--fixture') ? `${process.env.TMPDIR || '/tmp'}/saengae-test` : 'docs/data';
const OUT = `${DIR}/benefits.json`;
const CHANGES = `${DIR}/benefits-changes.json`;
const MIN_SERVICES = 3000; // 정부24 서비스는 1만 개 넘게 있음 — 이보다 적으면 뭔가 잘못 받은 것

type Raw = Record<string, unknown>;

// ───────── 분야 규칙 ─────────
// name: 서비스명, all: 서비스명+목적+대상+내용 합친 글
type Rule = { key: string; label: string; test: (name: string, all: string, r: Raw) => boolean };

const has = (s: string, words: string[]) => words.some((w) => s.includes(w));

export const RULES: Rule[] = [
  {
    key: 'pension',
    label: '국민연금·노후 연금(기초연금·주택연금·농지연금 포함)',
    test: (name) =>
      has(name, ['국민연금', '노령연금', '기초연금', '반환일시금', '분할연금', '유족연금', '장애연금', '크레딧', '연금보험료', '노후연금', '농지연금', '주택연금']) &&
      !has(name, ['공무원', '군인', '사학', '사립학교', '교직원', '별정우체국', '장제비']),
  },
  {
    key: 'elderDriving',
    label: '어르신 운전면허 반납·적성검사',
    test: (name, all) => {
      const s = name + ' ' + all;
      const license = has(s.replace(/\s/g, ''), ['면허반납', '면허자진반납', '운전면허반납', '면허증반납', '운전면허증반납']);
      const elder = has(s, ['고령', '어르신', '65세', '70세', '75세', '노인']);
      const aptitude = has(name, ['적성검사']) && elder;
      return (license && elder) || aptitude || (has(name.replace(/\s/g, ''), ['고령운전']));
    },
  },
  {
    key: 'disability',
    label: '장애인 혜택',
    test: (name, _all, r) => {
      const target = str(r['지원대상']);
      return has(name, ['장애인', '장애아', '장애수당', '장애연금', '발달장애', '중증장애', '장애 ']) ||
        (has(target, ['장애인', '장애정도', '장애의 정도']) && has(name, ['장애', '활동지원', '보조기기', '재활']));
    },
  },
];

// ───────── 생애 단계 나누기 (지원조건 JA 코드 + 이름) ─────────
// JA 코드(정부24 지원조건): 0110/0111 나이 범위 · 0301 예비부모·난임 0302 임산부 0303 출산·입양
// 0313~0316 농·어·축·임업인 0317 초 0318 중 0319 고 0320 대학생 0326 근로자·직장인 0327 구직자 0328 장애인
// 0404 1인가구 (값이 'Y'면 해당). 대부분 서비스는 전부 'Y'(제한 없음)라, 몇 개만 'Y'일 때만 '대상'으로 봐요.
export const STAGE_KEYS = ['pregnancy', 'kids', 'school', 'youth', 'midlife', 'senior', 'disability'] as const;
export type StageKey = (typeof STAGE_KEYS)[number];
export type Tag = 'single' | 'worker';
type Cond = Record<string, unknown>;
const G3 = ['JA0301', 'JA0302', 'JA0303', 'JA0313', 'JA0314', 'JA0315', 'JA0316', 'JA0317', 'JA0318', 'JA0319', 'JA0320', 'JA0322', 'JA0326', 'JA0327', 'JA0328', 'JA0329', 'JA0330'];
const G4 = ['JA0401', 'JA0402', 'JA0403', 'JA0404', 'JA0410', 'JA0411', 'JA0412', 'JA0413', 'JA0414'];
// 앱인토스 정책(금융상품·부동산 금지)에 걸릴 수 있는 것, 개인 혜택이 아닌 것은 빼요
const BAN = /대출|융자|모기지|보증(?!금 ?반환)|보험료 지원|펀드|투자|분양|청약|특별공급|우선공급|중개|취득세|자동차세|등록면허세|재산세|적금|저축|재형|자산형성|통장|외국인|계절근로|사업장|법인/;

export function stagesOf(name: string, c: Cond | undefined): { stages: StageKey[]; tags: Tag[] } {
  const none = { stages: [] as StageKey[], tags: [] as Tag[] };
  if (!c) return none;
  if (c['JA0101'] !== 'Y' && c['JA0102'] !== 'Y') return none; // 개인 대상 아님(기업·소상공인)
  if (BAN.test(name)) return none;
  const y3 = G3.filter((k) => c[k] === 'Y');
  const y4 = G4.filter((k) => c[k] === 'Y');
  const t3 = new Set(y3.length > 0 && y3.length <= 4 ? y3 : []);
  const t4 = new Set(y4.length > 0 && y4.length <= 3 ? y4 : []);
  if (t3.size && [...t3].every((k) => ['JA0313', 'JA0314', 'JA0315', 'JA0316'].includes(k))) return none; // 농어업인 전용
  const a = typeof c['JA0110'] === 'number' ? (c['JA0110'] as number) : 0;
  const b = typeof c['JA0111'] === 'number' ? (c['JA0111'] as number) : 120;
  const ov = (lo: number, hi: number) => Math.max(a, lo) <= Math.min(b, hi);
  const narrow = !(a <= 5 && b >= 70);
  const st = new Set<StageKey>();
  const tags = new Set<Tag>();
  const preg = t3.has('JA0301') || t3.has('JA0302') || t3.has('JA0303') || /임신|임산부|출산|난임|산후|산모|신생아|태아/.test(name);
  if (preg) st.add('pregnancy');
  if (narrow) {
    if (b <= 7 || (/영유아|영아|유아|보육|어린이집|아이돌봄/.test(name) && ov(0, 6))) st.add('kids');
    if ((a >= 5 && b <= 19 && b > 7) || t3.has('JA0317') || t3.has('JA0318') || t3.has('JA0319')) st.add('school');
    if (!preg && ((a >= 14 && b <= 45 && b >= 24) || t3.has('JA0320'))) st.add('youth');
    if (a >= 35 && a < 60 && b <= 70) st.add('midlife');
    if (a >= 60) st.add('senior');
  }
  if (/청년/.test(name)) st.add('youth');
  if (/중장년|신중년|장년|50플러스|50\+/.test(name)) st.add('midlife');
  if (/노인|어르신|경로|독거노인|치매|기초연금|노후/.test(name)) st.add('senior');
  if (/초등|중학|고등학|청소년|학생|입학/.test(name) && !/대학/.test(name)) st.add('school');
  if (t3.has('JA0328') || /장애/.test(name)) st.add('disability');
  if (t4.has('JA0404') || /1인 ?가구|독거|고독사|홀몸/.test(name)) tags.add('single');
  if (t3.has('JA0326') || t3.has('JA0327') || /근로자|직장인|노동자|구직|재취업|일자리/.test(name)) tags.add('worker');
  if (!st.size && tags.size) {
    if (a <= 34 && b >= 19) st.add('youth');
    if (ov(40, 64)) st.add('midlife');
    if (tags.has('single') && b >= 65) st.add('senior');
  }
  return { stages: [...st], tags: [...tags] };
}

// ───────── 도우미 ─────────
function str(v: unknown): string {
  if (v == null) return '';
  return String(v).replace(/\r\n/g, '\n').replace(/[ \t]+\n/g, '\n').trim();
}

const SIDO: [string, string][] = [
  ['전남광주', '전남·광주'],
  ['서울', '서울'], ['부산', '부산'], ['대구', '대구'], ['인천', '인천'], ['광주', '전남·광주'], ['대전', '대전'],
  ['울산', '울산'], ['세종', '세종'], ['경기', '경기'], ['강원', '강원'], ['충청북', '충북'], ['충북', '충북'],
  ['충청남', '충남'], ['충남', '충남'], ['전라북', '전북'], ['전북', '전북'], ['전라남', '전남·광주'], ['전남', '전남·광주'],
  ['경상북', '경북'], ['경북', '경북'], ['경상남', '경남'], ['경남', '경남'], ['제주', '제주'],
];

// 소관기관명 '서울특별시 강남구' → { sido: '서울', sigungu: '강남구' }. 중앙부처·공공기관이면 전국.
// 지방 재단·공단(예: '강북구도시관리공단')은 이름 속 시·도나 시·군·구로 찾아요(guMap: 시군구 이름 → 시·도).
const SIDO_ANY: [RegExp, string][] = [
  [/전남광주/, '전남·광주'], [/서울/, '서울'], [/부산/, '부산'], [/대구/, '대구'], [/인천/, '인천'],
  [/광주광역시/, '전남·광주'], [/대전/, '대전'], [/울산/, '울산'], [/세종특별자치시|세종시/, '세종'], [/경기/, '경기'],
  [/강원/, '강원'], [/충청북도|충북/, '충북'], [/충청남도|충남/, '충남'], [/전라북도|전북/, '전북'],
  [/전라남도|전남/, '전남·광주'], [/경상북도|경북/, '경북'], [/경상남도|경남/, '경남'], [/제주/, '제주'],
];
export function region(orgName: string, orgType: string, guMap?: Map<string, string>): { sido: string; sigungu: string } {
  // 소관기관유형: 중앙행정기관·공공기관 = 전국 / 광역시도·시군구·교육청·지방출자_출연기관·지방공기업 = 지역
  const local = /광역시도|시군구|교육청|지방|지자체/.test(orgType);
  if (!local) return { sido: '전국', sigungu: '' };
  const parts = orgName.trim().split(/\s+/);
  const first = parts[0] ?? '';
  const hit = SIDO.find(([k]) => first.startsWith(k));
  if (hit) return { sido: hit[1], sigungu: parts.slice(1).join(' ') };
  const clean = orgName.replace(/\(재\)|재단법인|\s/g, '');
  const any = SIDO_ANY.find(([re]) => re.test(clean));
  if (any) return { sido: any[1], sigungu: '' };
  if (guMap) {
    const m = clean.match(/^([가-힣]{1,4}?(?:시|군|구))/);
    const gu = m?.[1];
    if (gu && guMap.has(gu)) return { sido: guMap.get(gu)!, sigungu: gu };
  }
  return { sido: '기타', sigungu: orgName.trim() };
}

// 시군구 이름 → 시·도 (같은 이름이 여러 시·도에 있으면(중구·동구 등) 빼요)
function makeGuMap(list: Raw[]) {
  const seen = new Map<string, Set<string>>();
  for (const r of list) {
    if (str(r['소관기관유형']) !== '시군구') continue;
    const { sido, sigungu } = region(str(r['소관기관명']), '시군구');
    if (!sigungu || sido === '기타') continue;
    const gu = sigungu.split(' ')[0];
    if (!seen.has(gu)) seen.set(gu, new Set());
    seen.get(gu)!.add(sido);
  }
  const map = new Map<string, string>();
  for (const [gu, set] of seen) if (set.size === 1) map.set(gu, [...set][0]);
  return map;
}

async function getPage(path: string, key: string, page: number, attempt = 1): Promise<{ data: Raw[]; totalCount: number }> {
  // 공공데이터포털 키는 '인코딩'·'디코딩' 두 가지로 줌 — % 들어 있으면 인코딩 키라 그대로, 아니면 인코딩해서 보냄
  const sk = key.includes('%') ? key : encodeURIComponent(key);
  const url = `${BASE}/${path}?page=${page}&perPage=${PER_PAGE}&returnType=JSON&serviceKey=${sk}`;
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(60_000) });
    const text = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`);
    let j: Raw;
    try { j = JSON.parse(text); } catch { throw new Error(`JSON 아님: ${text.slice(0, 300)}`); }
    if (!Array.isArray(j.data)) throw new Error(`data 없음: ${text.slice(0, 300)}`);
    return { data: j.data as Raw[], totalCount: Number(j.totalCount ?? 0) };
  } catch (e) {
    const msg = (e as Error).message;
    // 키 문제는 다시 해도 안 됨
    if (/401|403|SERVICE_KEY|등록되지 않은|인증/.test(msg) || attempt >= 4) throw e;
    console.warn(`  ${path} ${page}쪽 다시 시도(${attempt}): ${msg}`);
    await new Promise((r) => setTimeout(r, 3000 * attempt));
    return getPage(path, key, page, attempt + 1);
  }
}

async function getAll(path: string, key: string): Promise<Raw[]> {
  const first = await getPage(path, key, 1);
  const pages = Math.ceil(first.totalCount / PER_PAGE);
  const all = [...first.data];
  for (let p = 2; p <= pages; p++) all.push(...(await getPage(path, key, p)).data);
  console.log(`  ${path}: ${all.length} / ${first.totalCount}개 (${pages}쪽)`);
  return all;
}

// ───────── 정리 ─────────
export type Benefit = {
  id: string; name: string; purpose: string; target: string; criteria: string; content: string;
  supportType: string; how: string; deadline: string; docs: string; receiver: string;
  org: string; orgType: string; dept: string; sido: string; sigungu: string; phone: string;
  url: string; onlineUrl: string; laws: string; views: number; updated: string; cats: string[];
  stages: StageKey[]; tags: Tag[];
};

export function build(list: Raw[], details: Raw[], conds: Record<string, Cond> = {}) {
  const det = new Map(details.map((d) => [str(d['서비스ID']), d]));
  const guMap = makeGuMap(list);
  const items: Benefit[] = [];
  for (const r of list) {
    const id = str(r['서비스ID']);
    if (!id) continue;
    const d = det.get(id) ?? {};
    const name = str(r['서비스명']);
    const all = [str(r['서비스목적요약']), str(d['서비스목적']), str(r['지원대상']), str(r['지원내용'])].join(' ');
    const cats = RULES.filter((rule) => rule.test(name, all, r)).map((rule) => rule.key);
    const { stages, tags } = stagesOf(name, conds[id]);
    if (!cats.length && !stages.length) continue;
    const orgType = str(r['소관기관유형']);
    const org = str(r['소관기관명']);
    const { sido, sigungu } = region(org, orgType, guMap);
    items.push({
      id, name, cats, stages, tags,
      purpose: str(d['서비스목적']) || str(r['서비스목적요약']),
      target: str(d['지원대상']) || str(r['지원대상']),
      criteria: str(d['선정기준']) || str(r['선정기준']),
      content: str(d['지원내용']) || str(r['지원내용']),
      supportType: str(d['지원유형']) || str(r['지원유형']),
      how: str(d['신청방법']) || str(r['신청방법']),
      deadline: str(d['신청기한']) || str(r['신청기한']),
      docs: str(d['구비서류']),
      receiver: str(d['접수기관명']) || str(r['접수기관']),
      org, orgType, dept: str(r['부서명']), sido, sigungu,
      phone: str(d['문의처']) || str(r['전화문의']),
      url: str(r['상세조회URL']),
      onlineUrl: str(d['온라인신청사이트URL']),
      laws: [str(d['법령']), str(d['자치법규']), str(d['행정규칙'])].filter(Boolean).join('\n'),
      views: Number(r['조회수'] ?? 0) || 0,
      updated: str(d['수정일시']) || str(r['수정일시']),
    });
  }
  // 전국(중앙) 먼저, 그다음 조회수 많은 순
  items.sort((a, b) => (a.sido === '전국' ? 0 : 1) - (b.sido === '전국' ? 0 : 1) || b.views - a.views);
  const categories: Record<string, { label: string; ids: string[] }> = {};
  for (const rule of RULES) categories[rule.key] = { label: rule.label, ids: items.filter((i) => i.cats.includes(rule.key)).map((i) => i.id) };
  const stageCounts = Object.fromEntries(STAGE_KEYS.map((k) => [k, items.filter((i) => i.stages.includes(k)).length]));
  return { items, categories, stageCounts };
}

// 지난번 파일과 비교 — 새로 생김 / 내용 바뀜 / 없어짐 (분기 점검 때 이것만 보면 됨)
export function diff(prev: Benefit[], next: Benefit[]) {
  const sig = (b: Benefit) => [b.name, b.target, b.criteria, b.content, b.how, b.deadline, b.phone, b.url].join('|');
  const p = new Map(prev.map((b) => [b.id, b]));
  const n = new Map(next.map((b) => [b.id, b]));
  const pick = (b: Benefit) => ({ id: b.id, name: b.name, org: b.org, cats: b.cats, stages: b.stages, updated: b.updated });
  return {
    added: next.filter((b) => !p.has(b.id)).map(pick),
    changed: next.filter((b) => p.has(b.id) && sig(p.get(b.id)!) !== sig(b)).map(pick),
    removed: prev.filter((b) => !n.has(b.id)).map(pick),
  };
}

// ───────── 앱용 가벼운 파일 ─────────
// benefits.json(1MB 넘음)을 앱이 처음부터 다 받으면 느려서 둘로 나눠요.
//   app/index.json         목록 화면용 — 이름·분야·지역·한 줄 요약만 (전체 혜택)
//   app/region/<코드>.json  눌렀을 때 보는 상세 — 시·도별로 묶음 (전국 = 중앙부처·공공기관)
export const REGION_CODE: Record<string, string> = {
  '전국': 'nation', '서울': 'seoul', '부산': 'busan', '대구': 'daegu', '인천': 'incheon', '전남·광주': 'jeonnam-gwangju',
  '대전': 'daejeon', '울산': 'ulsan', '세종': 'sejong', '경기': 'gyeonggi', '강원': 'gangwon', '충북': 'chungbuk',
  '충남': 'chungnam', '전북': 'jeonbuk', '경북': 'gyeongbuk', '경남': 'gyeongnam', '제주': 'jeju', '기타': 'etc',
};

function oneLine(s: string, max = 70) {
  const t = s.replace(/^\s*-\s+/gm, ' ').replace(/[○●□■◦•※▶]\s*/g, ' ').replace(/\s+/g, ' ').trim();
  return t.length > max ? t.slice(0, max - 1) + '…' : t;
}

export function splitForApp(meta: Record<string, unknown>, items: Benefit[]) {
  const regions: Record<string, { code: string; count: number }> = {};
  const byRegion = new Map<string, Benefit[]>();
  for (const b of items) {
    const code = REGION_CODE[b.sido] ?? 'etc';
    if (!byRegion.has(code)) byRegion.set(code, []);
    byRegion.get(code)!.push(b);
    regions[b.sido] ??= { code, count: 0 };
    regions[b.sido].count++;
  }
  // 우리 동네(연금·면허 반납·장애인) 화면용 — 예전 그대로
  const catItems = items.filter((b) => b.cats.length);
  const index = {
    ...meta,
    regions,
    // [id, 이름, 분야들, 시·도, 시·군·구, 기관, 지원유형, 한 줄 요약]
    fields: ['id', 'name', 'cats', 'sido', 'sigungu', 'org', 'supportType', 'summary'],
    items: catItems.map((b) => [b.id, b.name, b.cats, b.sido, b.sigungu, b.org, b.supportType, oneLine(b.content || b.purpose)]),
  };
  const files: Record<string, unknown> = { 'app/index.json': index };
  // 분야(생애 단계)별 목록 — 그 분야 화면을 열 때만 받아요
  for (const k of STAGE_KEYS) {
    const list = items.filter((b) => b.stages.includes(k));
    files[`app/stage/${k}.json`] = {
      updatedAt: meta.updatedAt, source: meta.source, regions,
      fields: ['id', 'name', 'tags', 'sido', 'sigungu', 'org', 'supportType', 'summary'],
      items: list.map((b) => [b.id, b.name, b.tags, b.sido, b.sigungu, b.org, b.supportType, oneLine(b.content || b.purpose)]),
    };
  }
  // 상세(시·도별) — 조회수는 매일 바뀌어서 빼요(안 바뀌면 파일도 그대로)
  for (const [code, list] of byRegion) files[`app/region/${code}.json`] = { items: list.map(({ views: _v, ...rest }) => rest) };
  return files;
}

// ───────── 복지로 지자체 복지서비스 (한국사회보장정보원, 공공데이터포털 15108347) ─────────
// 같은 DATA_GO_KR_KEY로 받아요(포털에서 이 API 활용신청 필요 — 자동승인). 안 되면 건너뛰고 정부24 자료만 써요.
// 목록만 받아요(개발계정 하루 1,000회). 생애주기(lifeNmArray)·대상(trgterIndvdlNmArray)·관심주제로 분야를 나눠요.
const BOKJIRO = 'https://apis.data.go.kr/B554287/LocalGovernmentWelfareInformations/LcgvWelfarelist';
export function xmlItems(xml: string, tag: string): Record<string, string>[] {
  const out: Record<string, string>[] = [];
  const re = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'g');
  for (const m of xml.matchAll(re)) {
    const o: Record<string, string> = {};
    for (const f of m[1].matchAll(/<([A-Za-z0-9_]+)>([\s\S]*?)<\/\1>/g)) o[f[1]] = f[2].replace(/<!\[CDATA\[|\]\]>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
    out.push(o);
  }
  return out;
}
export async function getBokjiro(key: string): Promise<Record<string, string>[]> {
  const sk = key.includes('%') ? key : encodeURIComponent(key);
  const all: Record<string, string>[] = [];
  for (let page = 1; page <= 40; page++) {
    const url = `${BOKJIRO}?serviceKey=${sk}&pageNo=${page}&numOfRows=500`;
    let res: Response | null = null;
    let text = '';
    for (let a = 1; a <= 4; a++) {
      try {
        res = await fetch(url, { signal: AbortSignal.timeout(60_000) });
        text = await res.text();
        if (res.status < 500) break;
      } catch (e) {
        if (a === 4) throw e;
      }
      console.warn(`  복지로 ${page}쪽 다시 시도(${a})`);
      await new Promise((r) => setTimeout(r, 5000 * a));
    }
    if (!res) throw new Error('복지로 응답 없음');
    if (!res.ok || /SERVICE_KEY|NOT_REGISTERED|Unauthorized|등록되지 않은/i.test(text.slice(0, 600))) throw new Error(`복지로 API 응답: HTTP ${res.status} ${text.slice(0, 200)}`);
    const items = xmlItems(text, 'servList');
    if (page === 1) console.log(`  복지로 지자체: 총 ${text.match(/<totalCount>(\d+)</)?.[1] ?? '?'}건`);
    all.push(...items);
    if (items.length < 500) break;
  }
  return all;
}
const LIFE: [RegExp, StageKey][] = [[/임신|출산/, 'pregnancy'], [/영유아/, 'kids'], [/아동|청소년/, 'school'], [/청년/, 'youth'], [/중장년/, 'midlife'], [/노년|노인/, 'senior']];
export function fromBokjiro(rows: Record<string, string>[]): Benefit[] {
  const out: Benefit[] = [];
  for (const r of rows) {
    const name = r.servNm ?? '';
    if (!r.servId || !name || BAN.test(name)) continue;
    const life = r.lifeNmArray ?? '';
    const who = r.trgterIndvdlNmArray ?? '';
    const theme = r.intrsThemaNmArray ?? '';
    const stages = new Set<StageKey>();
    const lifeN = life.split(',').filter((x) => x.trim()).length;
    // 생애주기를 5개 이상 적은 건 '모든 나이'라 이름으로만 나눠요
    if (lifeN > 0 && lifeN < 5) for (const [re, k] of LIFE) if (re.test(life)) stages.add(k);
    if (/임신|임산부|출산|난임|산후|산모|신생아/.test(name)) stages.add('pregnancy');
    if (/영유아|영아|어린이집|보육/.test(name)) stages.add('kids');
    if (/초등|중학|고등학|청소년|학생|입학/.test(name) && !/대학/.test(name)) stages.add('school');
    if (/청년/.test(name)) stages.add('youth');
    if (/중장년|신중년|50플러스/.test(name)) stages.add('midlife');
    if (/노인|어르신|경로|치매/.test(name)) stages.add('senior');
    if (/장애/.test(who) || /장애/.test(name)) stages.add('disability');
    const tags = new Set<Tag>();
    if (/1인|독거|홀몸|고독/.test(who + name)) tags.add('single');
    if (/일자리|취업|근로/.test(theme + name)) tags.add('worker');
    if (!stages.size && tags.size) {
      stages.add('youth');
      stages.add('midlife');
      if (tags.has('single')) stages.add('senior');
    }
    if (!stages.size) continue;
    const { sido, sigungu } = region(`${r.ctpvNm ?? ''} ${r.sggNm ?? ''}`.trim(), '시군구');
    const summary = r.servDgst ?? '';
    out.push({
      id: 'BJ' + r.servId, name, cats: [], stages: [...stages], tags: [...tags],
      purpose: summary, target: [life && `생애주기: ${life}`, who && `대상: ${who}`].filter(Boolean).join('\n'), criteria: '', content: summary,
      supportType: r.srvPvsnNm ?? '', how: r.aplyMtdNm ?? '', deadline: '', docs: '', receiver: r.bizChrDeptNm ?? '',
      org: [r.ctpvNm, r.sggNm].filter(Boolean).join(' '), orgType: '지자체(복지로)', dept: r.bizChrDeptNm ?? '', sido, sigungu,
      phone: r.inqNum ?? '', url: r.servDtlLink ?? 'https://www.bokjiro.go.kr', onlineUrl: '', laws: '', views: Number(r.inqNum ?? 0) || 0,
      updated: r.lastModYmd ?? '',
    });
  }
  return out;
}

// ───────── 실행 ─────────
async function main() {
  const fx = process.argv.indexOf('--fixture');
  let list: Raw[], details: Raw[];
  let conds: Record<string, Cond> = {};
  if (fx > 0) {
    const f = JSON.parse(readFileSync(process.argv[fx + 1], 'utf8'));
    list = f.list; details = f.details; conds = f.conds ?? {};
  } else {
    const key = process.env.DATA_GO_KR_KEY?.trim();
    if (!key) throw new Error('DATA_GO_KR_KEY(공공데이터포털 인증키)가 없어요 — GitHub 저장소 Secrets에 넣어 주세요');
    console.log('정부24 공공서비스 받는 중…');
    list = await getAll('serviceList', key);
    details = await getAll('serviceDetail', key);
    // 지원조건(나이·가구·직업 표시) — 생애 단계 나누기용
    for (const c of await getAll('supportConditions', key)) conds[str(c['서비스ID'])] = c;
  }

  const built = build(list, details, conds);
  const { categories, stageCounts } = built;
  let items = built.items;
  // 복지로 지자체 자료 더하기 (정부24에 같은 이름·지역이 이미 있으면 빼요)
  const bkey = process.env.DATA_GO_KR_KEY?.trim();
  if (fx < 0 && bkey) {
    try {
      const extra = fromBokjiro(await getBokjiro(bkey));
      const norm = (s: string) => s.replace(/[\s()\[\]·.,-]/g, '');
      const seen = new Set(items.map((b) => b.sido + '|' + norm(b.name)));
      const add = extra.filter((b) => !seen.has(b.sido + '|' + norm(b.name)));
      items = [...items, ...add];
      for (const k of STAGE_KEYS) stageCounts[k] = items.filter((i) => i.stages.includes(k)).length;
      console.log(`  복지로 지자체 ${extra.length}건 중 새로 ${add.length}건 더함`);
    } catch (e) {
      // 일시적인 오류면 지난번에 받은 복지로 자료를 그대로 둬요(목록에서 갑자기 사라지지 않게)
      const old: Benefit[] = existsSync(OUT) ? (JSON.parse(readFileSync(OUT, 'utf8')).items ?? []).filter((b: Benefit) => b.id.startsWith('BJ')) : [];
      items = [...items, ...old.map((b) => ({ ...b, views: 0 }))];
      for (const k of STAGE_KEYS) stageCounts[k] = items.filter((i) => i.stages.includes(k)).length;
      console.warn(`복지로 지자체 자료 못 받음 — 지난 자료 ${old.length}건 유지:`, (e as Error).message);
    }
  }
  const counts = Object.fromEntries(Object.entries(categories).map(([k, v]) => [k, v.ids.length]));
  console.log(`전체 ${list.length}개 중 우리 분야 ${items.length}개`, counts, stageCounts);

  if (fx < 0) {
    if (list.length < MIN_SERVICES) throw new Error(`서비스가 ${list.length}개밖에 안 옴 — 저장 안 함`);
    const empty = Object.entries(counts).filter(([, c]) => c === 0).map(([k]) => k);
    if (empty.length) throw new Error(`0개인 분야: ${empty.join(', ')} — 규칙이나 데이터 확인 필요, 저장 안 함`);
    const emptyStage = Object.entries(stageCounts).filter(([, c]) => c === 0).map(([k]) => k);
    if (emptyStage.length) throw new Error(`0개인 생애 단계: ${emptyStage.join(', ')} — 지원조건 확인 필요, 저장 안 함`);
  }

  const prevFile = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : null;
  const prev: Benefit[] = prevFile?.items ?? [];
  const changes = diff(prev, items);
  const now = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Seoul' }).replace(' ', 'T') + '+09:00';
  const slim = items.map(({ views: _v, ...rest }) => rest);
  // 내용이 하나도 안 바뀌었으면 큰 파일은 그대로 두고 '확인한 시각'만 적어요(저장소가 매일 커지지 않게)
  const same = !!prevFile && JSON.stringify(prevFile.items) === JSON.stringify(slim) && existsSync(`${DIR}/app/stage`);
  mkdirSync(`${DIR}/app`, { recursive: true });
  writeFileSync(`${DIR}/app/checked.json`, JSON.stringify({ checkedAt: now, totalServices: list.length, changed: !same }));
  if (same) { console.log('달라진 내용 없음 — 확인 시각만 저장'); return; }

  mkdirSync(dirname(OUT), { recursive: true });
  const meta = {
    updatedAt: now,
    source: items.some((b) => b.id.startsWith('BJ')) ? '행정안전부 공공서비스(정부24) · 한국사회보장정보원 지자체 복지서비스(복지로)' : '행정안전부 대한민국 공공서비스(혜택) 정보 (정부24·공공데이터포털)',
    sourceUrl: 'https://www.data.go.kr/data/15113968/openapi.do',
    totalServices: list.length,
    counts,
    stageCounts,
    labels: Object.fromEntries(Object.entries(categories).map(([k, v]) => [k, v.label])),
  };
  writeFileSync(OUT, JSON.stringify({ ...meta, categories, items: slim }));
  rmSync(`${DIR}/app/region`, { recursive: true, force: true });
  rmSync(`${DIR}/app/stage`, { recursive: true, force: true });
  mkdirSync(`${DIR}/app/region`, { recursive: true });
  mkdirSync(`${DIR}/app/stage`, { recursive: true });
  for (const [f, v] of Object.entries(splitForApp(meta, items))) writeFileSync(`${DIR}/${f}`, JSON.stringify(v));
  rmSync(`${DIR}/conditions.json`, { force: true });
  rmSync(`${DIR}/conditions-sample.json`, { force: true });
  writeFileSync(`${DIR}/services-index.json`, JSON.stringify(list.map((r) => [str(r['서비스ID']), str(r['서비스명']), str(r['소관기관명']), str(r['소관기관유형'])])));
  writeFileSync(CHANGES, JSON.stringify({ updatedAt: now, first: prev.length === 0, ...changes }, null, 1));
  console.log(`저장: ${OUT} · 새로 ${changes.added.length} / 바뀜 ${changes.changed.length} / 없어짐 ${changes.removed.length}`);
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('collect-benefits.ts')) {
  main().catch((e) => { console.error('실패:', e.message); process.exit(1); });
}
