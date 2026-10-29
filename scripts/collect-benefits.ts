// 생애혜택 안내소 — 정부 혜택 자동 수집
// 출처: 행정안전부_대한민국 공공서비스(혜택) 정보 (공공데이터포털 15113968, 정부24·보조금24와 같은 데이터)
//   목록  GET https://api.odcloud.kr/api/gov24/v3/serviceList
//   상세  GET https://api.odcloud.kr/api/gov24/v3/serviceDetail
// 전체 목록·상세를 1,000개씩 쪽으로 받아(하루 수십 번 호출 → 개발계정 1만 회 한도 안) 우리 분야만 골라 저장해요.
//
// 실행: DATA_GO_KR_KEY=... node --experimental-strip-types scripts/collect-benefits.ts
// 시험: node --experimental-strip-types scripts/collect-benefits.ts --fixture test/fixture.json
//
// 결과: docs/data/benefits.json (앱이 읽는 파일), docs/data/benefits-changes.json (지난번과 달라진 것)
// 안전장치: 받은 서비스 수가 너무 적거나 분야 하나라도 0개면 저장하지 않고 실패로 끝내요(앱엔 지난 데이터 유지).

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const BASE = 'https://api.odcloud.kr/api/gov24/v3';
const PER_PAGE = 1000;
const OUT = 'docs/data/benefits.json';
const CHANGES = 'docs/data/benefits-changes.json';
const MIN_SERVICES = 3000; // 정부24 서비스는 1만 개 넘게 있음 — 이보다 적으면 뭔가 잘못 받은 것

type Raw = Record<string, unknown>;

// ───────── 분야 규칙 ─────────
// name: 서비스명, all: 서비스명+목적+대상+내용 합친 글
type Rule = { key: string; label: string; test: (name: string, all: string, r: Raw) => boolean };

const has = (s: string, words: string[]) => words.some((w) => s.includes(w));

export const RULES: Rule[] = [
  {
    key: 'pension',
    label: '국민연금·노후 연금',
    test: (name) =>
      has(name, ['국민연금', '노령연금', '기초연금', '반환일시금', '분할연금', '유족연금', '장애연금', '연금 크레딧', '크레딧']) &&
      !has(name, ['공무원연금', '군인연금', '사학연금']),
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

// ───────── 도우미 ─────────
function str(v: unknown): string {
  if (v == null) return '';
  return String(v).replace(/\r\n/g, '\n').replace(/[ \t]+\n/g, '\n').trim();
}

const SIDO: [string, string][] = [
  ['서울', '서울'], ['부산', '부산'], ['대구', '대구'], ['인천', '인천'], ['광주', '광주'], ['대전', '대전'],
  ['울산', '울산'], ['세종', '세종'], ['경기', '경기'], ['강원', '강원'], ['충청북', '충북'], ['충북', '충북'],
  ['충청남', '충남'], ['충남', '충남'], ['전라북', '전북'], ['전북', '전북'], ['전라남', '전남'], ['전남', '전남'],
  ['경상북', '경북'], ['경북', '경북'], ['경상남', '경남'], ['경남', '경남'], ['제주', '제주'],
];

// 소관기관명 '서울특별시 강남구' → { sido: '서울', sigungu: '강남구' }. 중앙부처·공공기관이면 전국.
export function region(orgName: string, orgType: string): { sido: string; sigungu: string } {
  if (!orgType.includes('지자체') && !orgType.includes('지방')) return { sido: '전국', sigungu: '' };
  const parts = orgName.trim().split(/\s+/);
  const first = parts[0] ?? '';
  const hit = SIDO.find(([k]) => first.startsWith(k));
  if (!hit) return { sido: '기타', sigungu: orgName.trim() };
  return { sido: hit[1], sigungu: parts.slice(1).join(' ') };
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
};

export function build(list: Raw[], details: Raw[]) {
  const det = new Map(details.map((d) => [str(d['서비스ID']), d]));
  const items: Benefit[] = [];
  for (const r of list) {
    const id = str(r['서비스ID']);
    if (!id) continue;
    const d = det.get(id) ?? {};
    const name = str(r['서비스명']);
    const all = [str(r['서비스목적요약']), str(d['서비스목적']), str(r['지원대상']), str(r['지원내용'])].join(' ');
    const cats = RULES.filter((rule) => rule.test(name, all, r)).map((rule) => rule.key);
    if (!cats.length) continue;
    const orgType = str(r['소관기관유형']);
    const org = str(r['소관기관명']);
    const { sido, sigungu } = region(org, orgType);
    items.push({
      id, name, cats,
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
  return { items, categories };
}

// 지난번 파일과 비교 — 새로 생김 / 내용 바뀜 / 없어짐 (분기 점검 때 이것만 보면 됨)
export function diff(prev: Benefit[], next: Benefit[]) {
  const sig = (b: Benefit) => [b.name, b.target, b.criteria, b.content, b.how, b.deadline, b.phone, b.url].join('|');
  const p = new Map(prev.map((b) => [b.id, b]));
  const n = new Map(next.map((b) => [b.id, b]));
  const pick = (b: Benefit) => ({ id: b.id, name: b.name, org: b.org, cats: b.cats, updated: b.updated });
  return {
    added: next.filter((b) => !p.has(b.id)).map(pick),
    changed: next.filter((b) => p.has(b.id) && sig(p.get(b.id)!) !== sig(b)).map(pick),
    removed: prev.filter((b) => !n.has(b.id)).map(pick),
  };
}

// ───────── 실행 ─────────
async function main() {
  const fx = process.argv.indexOf('--fixture');
  let list: Raw[], details: Raw[];
  if (fx > 0) {
    const f = JSON.parse(readFileSync(process.argv[fx + 1], 'utf8'));
    list = f.list; details = f.details;
  } else {
    const key = process.env.DATA_GO_KR_KEY?.trim();
    if (!key) throw new Error('DATA_GO_KR_KEY(공공데이터포털 인증키)가 없어요 — GitHub 저장소 Secrets에 넣어 주세요');
    console.log('정부24 공공서비스 받는 중…');
    list = await getAll('serviceList', key);
    details = await getAll('serviceDetail', key);
  }

  const { items, categories } = build(list, details);
  const counts = Object.fromEntries(Object.entries(categories).map(([k, v]) => [k, v.ids.length]));
  console.log(`전체 ${list.length}개 중 우리 분야 ${items.length}개`, counts);

  if (fx < 0) {
    if (list.length < MIN_SERVICES) throw new Error(`서비스가 ${list.length}개밖에 안 옴 — 저장 안 함`);
    const empty = Object.entries(counts).filter(([, c]) => c === 0).map(([k]) => k);
    if (empty.length) throw new Error(`0개인 분야: ${empty.join(', ')} — 규칙이나 데이터 확인 필요, 저장 안 함`);
  }

  const prev: Benefit[] = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')).items ?? [] : [];
  const changes = diff(prev, items);
  const now = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Seoul' }).replace(' ', 'T') + '+09:00';

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify({
    updatedAt: now,
    source: '행정안전부 대한민국 공공서비스(혜택) 정보 (정부24·공공데이터포털)',
    sourceUrl: 'https://www.data.go.kr/data/15113968/openapi.do',
    totalServices: list.length,
    counts, categories, items,
  }));
  writeFileSync(CHANGES, JSON.stringify({ updatedAt: now, first: prev.length === 0, ...changes }, null, 1));
  console.log(`저장: ${OUT} · 새로 ${changes.added.length} / 바뀜 ${changes.changed.length} / 없어짐 ${changes.removed.length}`);
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('collect-benefits.ts')) {
  main().catch((e) => { console.error('실패:', e.message); process.exit(1); });
}
