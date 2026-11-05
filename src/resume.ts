// 보던 곳으로 돌아오기 (11/5 사장님 요청)
// 토스쇼핑 상품·정부 사이트를 열면 토스가 이 앱을 닫았다가 다시 열어서 늘 첫 화면으로 왔어요.
// 바깥 링크를 열기 직전에 '지금 보던 곳'(메뉴·칸·자세히 창·스크롤 위치)을 폰에 적어 두고,
// 1시간 안에 다시 들어오면 그 자리로 열어요. 한 번 쓰면 지워요(다음엔 평소처럼 첫 화면).
const KEY = 'saengae.resume.v1';
const TTL = 60 * 60 * 1000;

export type Spot = { view: string; sub: string; detail: string | null; y: number };

let spot: Spot = { view: 'home', sub: '', detail: null, y: 0 };
let getY: () => number = () => 0;

// 화면이 바뀔 때마다 알려 줘요
export function remember(p: Partial<Spot>): void {
  spot = { ...spot, ...p };
}
export function setScrollGetter(fn: () => number): void {
  getY = fn;
}

// 바깥 링크 열기 직전에 불러요 (platform.ts openLink)
export function markLeaving(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...spot, y: Math.round(getY()), at: Date.now() }));
  } catch {}
}

// 앱 시작 때 한 번: 1시간 안에 바깥 링크로 나갔다 온 거면 그 자리
export function takeResume(): Spot | null {
  try {
    const s = localStorage.getItem(KEY);
    if (!s) return null;
    localStorage.removeItem(KEY);
    const d = JSON.parse(s) as Spot & { at: number };
    if (!d.at || Date.now() - d.at > TTL || typeof d.view !== 'string') return null;
    return { view: d.view, sub: d.sub ?? '', detail: d.detail ?? null, y: d.y ?? 0 };
  } catch {
    return null;
  }
}
