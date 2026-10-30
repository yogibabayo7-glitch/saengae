// 토스 SDK 연결부: 링크 열기, 이벤트 기록, 배너 광고 (오늘밥상물가와 같은 방식)
import { Analytics, Device, TossAds } from '@apps-in-toss/web-framework';

// 정부 사이트 등 바깥 링크 열기 (토스 안에서는 토스 브라우저, 미리보기에서는 새 창)
export async function openLink(url: string): Promise<void> {
  try {
    await Device.openURL(url);
    return;
  } catch {}
  try {
    window.open(url, '_blank', 'noopener');
  } catch {}
}

export type TrackEvent =
  | 'stage_opened' // 분야 탭 누름
  | 'stage_subtab' // 분야 안 칸(기본·1인가구·직장인·우리 동네)
  | 'stage_local_opened' // 분야 안 우리 동네 혜택 상세
  | 'detail_opened' // 자세히 열림
  | 'gov_link_clicked' // 정부 사이트 버튼
  | 'shop_clicked' // 상품(제휴) 링크
  | 'local_opened' // 우리 동네 혜택 열림
  | 'local_detail_opened' // 정부24 혜택 상세
  | 'local_gov24_clicked'; // 정부24 상세 페이지 열기

export function track(name: TrackEvent, params: Record<string, string | number> = {}): void {
  try {
    void Analytics.click({ log_name: name, ...params });
  } catch {}
}

// ── 배너 광고 (토스가 광고를 채워줘요) ──
// .env의 VITE_BANNER_AD_ID에 콘솔에서 받은 광고 그룹 ID를 넣어요. 비어 있으면 광고 자리를 안 만들어요.
export const BANNER_AD_ID: string = import.meta.env.VITE_BANNER_AD_ID ?? '';
let adsInitialized = false;

export function attachBanner(el: HTMLElement): () => void {
  if (!BANNER_AD_ID) return () => {};
  try {
    if (!TossAds.attachBanner.isSupported()) return () => {};
    if (!adsInitialized && TossAds.initialize.isSupported()) {
      adsInitialized = true;
      TossAds.initialize({});
    }
    const banner = TossAds.attachBanner(BANNER_AD_ID, el, { theme: 'light', variant: 'card' });
    return () => {
      try {
        banner?.destroy();
      } catch {}
    };
  } catch {
    return () => {};
  }
}
