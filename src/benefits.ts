// 생애혜택 안내소 미니앱 — 혜택 데이터 읽기 (화면 틀과 상관없이 그대로 복사해 쓰는 파일)
//
// 데이터는 GitHub Actions가 매주 월 06:20에 정부24 자료로 새로 만들어 saengae 저장소에 올려요.
//   목록:  docs/data/app/index.json          (약 190KB, 압축 전송 시 약 45KB)
//   상세:  docs/data/app/region/<코드>.json   (시·도별, 눌렀을 때만 받음)
//
// 쓰는 법
//   const idx = await loadIndex();                         // 처음 화면: 목록
//   const list = filterBenefits(idx.items, { cat: 'disability', sido: '서울' });
//   const one = await loadDetail(list[0]);                // 상세(신청방법·서류·문의처…)
//
// 순서: ① 폰에 저장해 둔 지난 데이터로 바로 보여주고 ② 새 데이터를 받아 오면 바꿔요.
//       인터넷이 안 되면 지난 데이터 그대로(앱이 빈 화면이 되지 않게).

export const BASES = [
  // GitHub Pages를 켜면(Settings → Pages → main /docs) 이 주소가 제일 먼저 쓰여요
  'https://yogibabayo7-glitch.github.io/saengae/data',
  // 켜기 전에도 되는 주소
  'https://raw.githubusercontent.com/yogibabayo7-glitch/saengae/main/docs/data',
];

export type CatKey = 'pension' | 'elderDriving' | 'disability';

export const CAT_LABEL: Record<CatKey, string> = {
  pension: '국민연금·노후 연금',
  elderDriving: '어르신 운전면허 반납',
  disability: '장애인 혜택',
};

// 시·도 선택 칸에 보여 줄 순서
export const SIDO_LIST = [
  '서울', '경기', '인천', '부산', '대구', '전남·광주', '대전', '울산', '세종',
  '강원', '충북', '충남', '전북', '경북', '경남', '제주',
] as const;

export type BenefitSummary = {
  id: string; name: string; cats: CatKey[]; sido: string; sigungu: string;
  org: string; supportType: string; summary: string;
};

export type BenefitDetail = BenefitSummary & {
  purpose: string; target: string; criteria: string; content: string;
  how: string; deadline: string; docs: string; receiver: string;
  orgType: string; dept: string; phone: string;
  url: string;        // 정부24 상세 (새 창으로 열기)
  onlineUrl: string;  // 온라인 신청 사이트(있을 때만)
  laws: string; views: number; updated: string;
};

export type BenefitIndex = {
  updatedAt: string;          // '2026-10-29T20:22:09+09:00'
  source: string;             // 화면 아래 '출처'에 표시
  sourceUrl: string;
  totalServices: number;
  counts: Record<CatKey, number>;
  labels: Record<CatKey, string>;
  regions: Record<string, { code: string; count: number }>;
  items: BenefitSummary[];
};

const CACHE_KEY = 'saengae.index.v1';
const TIMEOUT_MS = 8000;

// ───────── 저장소(폰) ─────────
function cacheGet<T>(key: string): T | null {
  try { const s = localStorage.getItem(key); return s ? (JSON.parse(s) as T) : null; } catch { return null; }
}
function cacheSet(key: string, v: unknown) {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* 저장 공간 부족 등 — 무시 */ }
}

async function fetchJson<T>(path: string): Promise<T> {
  let last: unknown;
  for (const base of BASES) {
    try {
      const res = await fetch(`${base}/${path}`, { signal: AbortSignal.timeout(TIMEOUT_MS), cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as T;
    } catch (e) { last = e; }
  }
  throw last ?? new Error('데이터를 받지 못했어요');
}

type RawIndex = Omit<BenefitIndex, 'items'> & { fields: string[]; items: unknown[][] };

function unpack(raw: RawIndex): BenefitIndex {
  const f = raw.fields;
  const items = raw.items.map((row) => Object.fromEntries(f.map((k, i) => [k, row[i]])) as BenefitSummary);
  const { fields: _f, ...rest } = raw;
  return { ...rest, items };
}

// ───────── 목록 ─────────
// onUpdate: 저장해 둔 걸 먼저 돌려준 뒤, 새 데이터가 오면 한 번 더 불러 줘요(화면 새로 그리기용)
export async function loadIndex(onUpdate?: (idx: BenefitIndex) => void): Promise<BenefitIndex> {
  const cached = cacheGet<RawIndex>(CACHE_KEY);
  const fresh = fetchJson<RawIndex>('app/index.json').then((raw) => {
    if (!cached || raw.updatedAt !== cached.updatedAt) {
      cacheSet(CACHE_KEY, raw);
      regionMemo.clear();
      if (cached) onUpdate?.(unpack(raw));
    }
    return unpack(raw);
  });
  if (cached) { fresh.catch(() => {}); return unpack(cached); }
  return fresh; // 처음 여는 사람: 받아질 때까지 기다림(실패하면 에러 → 화면에 '다시 시도' 버튼)
}

// ───────── 거르기 ─────────
// sido를 고르면 '전국(중앙부처) + 그 시·도' 혜택. sigungu까지 고르면 시·도 전체 대상 + 그 시·군·구.
export function filterBenefits(
  items: BenefitSummary[],
  o: { cat?: CatKey; sido?: string; sigungu?: string; q?: string; includeNation?: boolean } = {},
): BenefitSummary[] {
  const q = o.q?.replace(/\s/g, '');
  const nation = o.includeNation ?? true;
  return items.filter((b) => {
    if (o.cat && !b.cats.includes(o.cat)) return false;
    if (o.sido) {
      if (b.sido === '전국') { if (!nation) return false; }
      else if (b.sido !== o.sido) return false;
      else if (o.sigungu && b.sigungu && !b.sigungu.startsWith(o.sigungu)) return false;
    }
    if (q && !(b.name + b.org + b.summary).replace(/\s/g, '').includes(q)) return false;
    return true;
  });
}

// 시·도 안의 시·군·구 목록(선택 칸용)
export function sigunguOf(items: BenefitSummary[], sido: string): string[] {
  const s = new Set<string>();
  for (const b of items) if (b.sido === sido && b.sigungu) s.add(b.sigungu.split(' ')[0]);
  return [...s].sort((a, b) => a.localeCompare(b, 'ko'));
}

// ───────── 상세 ─────────
const regionMemo = new Map<string, Promise<Map<string, BenefitDetail>>>();

function regionCode(idx: BenefitIndex | null, sido: string) {
  return idx?.regions[sido]?.code ?? FALLBACK_CODE[sido] ?? 'etc';
}
const FALLBACK_CODE: Record<string, string> = {
  '전국': 'nation', '서울': 'seoul', '부산': 'busan', '대구': 'daegu', '인천': 'incheon', '전남·광주': 'jeonnam-gwangju',
  '대전': 'daejeon', '울산': 'ulsan', '세종': 'sejong', '경기': 'gyeonggi', '강원': 'gangwon', '충북': 'chungbuk',
  '충남': 'chungnam', '전북': 'jeonbuk', '경북': 'gyeongbuk', '경남': 'gyeongnam', '제주': 'jeju', '기타': 'etc',
};

export async function loadDetail(b: BenefitSummary): Promise<BenefitDetail | null> {
  const idx = cacheGet<RawIndex>(CACHE_KEY);
  const code = regionCode(idx as unknown as BenefitIndex, b.sido);
  if (!regionMemo.has(code)) {
    const key = `saengae.region.${code}`;
    const p = (async () => {
      const cached = cacheGet<{ updatedAt: string; items: BenefitDetail[] }>(key);
      let data = cached;
      if (!cached || cached.updatedAt !== idx?.updatedAt) {
        try { data = await fetchJson(`app/region/${code}.json`); cacheSet(key, data); }
        catch (e) { if (!cached) throw e; }
      }
      return new Map((data?.items ?? []).map((d) => [d.id, d]));
    })();
    p.catch(() => regionMemo.delete(code)); // 실패하면 다음에 다시 받게
    regionMemo.set(code, p);
  }
  return (await regionMemo.get(code)!).get(b.id) ?? null;
}

// ───────── 보여 주기 도우미 ─────────
export function updatedLabel(iso: string) {
  const d = new Date(iso);
  return isNaN(+d) ? '' : `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()} 기준`;
}

// '○ 첫째\n○ 둘째' 같은 정부24 글을 줄 목록으로
export function toLines(s: string): string[] {
  return s.split(/\n+|(?=○)|(?=●)/).map((t) => t.replace(/^[\s○●□■◦•※▶-]+/, '').trim()).filter(Boolean);
}
