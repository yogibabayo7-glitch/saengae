// 리뷰 요청 + 마감 알림 신청 (11/5 사장님: 앱인토스 웨비나 정리대로 진행)
// 근거: 개발자센터 '리뷰 요청'(같은 세션 반복 호출 금지, 노출 여부에 흐름을 묶지 말 것)
//       '푸시알림'(기능성 메시지만, 알림 동의문 templateCode는 콘솔 푸시알림 메뉴의 발송 코드 = 'saengae-benefit-'로 시작)
import { Notification, Review } from '@apps-in-toss/web-framework';
import { track } from './platform';

// ── 마감 알림: 콘솔 '푸시알림'에서 템플릿을 만들고 검수 통과하면 여기 발송 코드를 넣어요. 비어 있으면 버튼이 안 보여요.
export const ALERT_CODES: Record<string, string> = {
  'culture-card': '', // 문화누리카드 11월 30일 발급 마감 (발송: 11/27 오전, 1회)
  'energy-voucher': '', // 에너지바우처 12월 31일 신청 마감 (발송: 12/28 오전, 1회)
};

export function alertSupported(key?: string): boolean {
  if (!key || !ALERT_CODES[key]) return false;
  try {
    return Notification.requestAgreement.isSupported();
  } catch {
    return false;
  }
}

export type AlertResult = 'new' | 'already' | 'rejected' | 'failed';

export function askAlert(key: string, done: (r: AlertResult) => void): void {
  const templateCode = ALERT_CODES[key];
  if (!templateCode) return done('failed');
  let off: (() => void) | undefined;
  try {
    off = Notification.requestAgreement({
      options: { templateCode },
      onEvent: ({ type }) => {
        const r: AlertResult = type === 'newAgreement' ? 'new' : type === 'alreadyAgreed' ? 'already' : 'rejected';
        track('alert_agreed', { key, result: r });
        done(r);
        off?.();
      },
      onError: () => {
        done('failed');
        off?.();
      },
    });
  } catch {
    done('failed');
  }
}

// ── 리뷰 요청: 정부 사이트를 다녀왔을 때·가족에게 혜택을 보낸 직후 (핵심 일을 마친 순간)
// 한 세션에 한 번, 30일에 한 번, 두 번째 방문부터만.
const REVIEW_KEY = 'saengae.review.v1';
const VISIT_KEY = 'saengae.visits.v1';
let askedThisSession = false;

export function countVisit(): void {
  try {
    localStorage.setItem(VISIT_KEY, String(Number(localStorage.getItem(VISIT_KEY) || '0') + 1));
  } catch {}
}

export function askReview(reason: 'gov_return' | 'shared'): void {
  if (askedThisSession) return;
  try {
    if (!Review.request.isSupported()) return;
    const visits = Number(localStorage.getItem(VISIT_KEY) || '0');
    const last = Number(localStorage.getItem(REVIEW_KEY) || '0');
    if (visits < 2 || Date.now() - last < 30 * 24 * 60 * 60 * 1000) return;
    askedThisSession = true;
    localStorage.setItem(REVIEW_KEY, String(Date.now()));
    track('review_requested', { reason });
    void Review.request().catch(() => {});
  } catch {}
}
