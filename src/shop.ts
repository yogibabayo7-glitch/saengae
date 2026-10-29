// 토스쇼핑 상품(쉐어링크) 읽기 — 사장님 PC의 saengae-shop.ps1이 만든 docs/data/shop.json
// 분야(stage)마다 상품 묶음(group) 여러 개, 묶음마다 상품 여러 개. 없으면 content.ts의 이름만 회색으로 보여요.
import { BASES } from './benefits';
import type { StageKey } from './data/content';

export type ShopProduct = { id: string; name: string; thumb: string; url: string; price?: number | null; reviews?: number | null };
export type ShopGroup = { id: string; name: string; items: ShopProduct[] };
export type ShopData = {
  updatedAt: string;
  disclosure: string;
  stages: Partial<Record<StageKey, ShopGroup[]>>;
};

const CACHE_KEY = 'saengae.shop.v1';
let memo: Promise<ShopData | null> | null = null;

function cached(): ShopData | null {
  try {
    const s = localStorage.getItem(CACHE_KEY);
    return s ? (JSON.parse(s) as ShopData) : null;
  } catch {
    return null;
  }
}

export function loadShop(onUpdate?: (d: ShopData) => void): Promise<ShopData | null> {
  if (memo) return memo;
  const old = cached();
  const fresh = (async () => {
    let last: unknown;
    for (const base of BASES) {
      try {
        const res = await fetch(`${base}/shop.json`, { signal: AbortSignal.timeout(8000), cache: 'no-cache' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const d = (await res.json()) as ShopData;
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(d));
        } catch {}
        if (old && old.updatedAt !== d.updatedAt) onUpdate?.(d);
        return d;
      } catch (e) {
        last = e;
      }
    }
    if (old) return old;
    throw last;
  })();
  memo = old ? Promise.resolve(old) : fresh.catch(() => null);
  if (old) fresh.catch(() => {});
  return memo;
}

export function priceLabel(p?: number | null): string {
  return p ? `${p.toLocaleString('ko-KR')}원` : '';
}
