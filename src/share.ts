// 가족에게 혜택 보내기 (11/1 사장님 요청 — 중장년·어르신 메뉴에만)
// 자녀 → 부모님: "엄마, 아빠 이거 대상자일 수 있대요"
// 부모님 → 자녀: "이거 나도 받을 수 있는지 봐 주고 신청 좀 도와줄래?"
// 토스 안에서는 휴대폰 공유창(카카오톡 등)을 열고, 미리보기에서는 브라우저 공유 또는 복사로 대신해요.
import { Environment, Share } from '@apps-in-toss/web-framework';
import { STAGES } from './data/content';
import type { Card, StageKey } from './data/content';

export type ShareWho = 'toParent' | 'toChild';
export type ShareResult = 'shared' | 'copied' | 'failed';

// 공유창이 있는 메뉴
export const SHARE_STAGES: StageKey[] = ['midlife', 'senior'];

// 토스 링크를 못 만들 때 쓰는 앱 공유 주소 (사장님이 받은 미니앱 공유 링크)
const FALLBACK_LINK = 'https://tossminiapp.com/s/XAESUR6e';
const APP_NAME = 'saengae-benefit';

const linkCache = new Map<string, string>();

// 카드 번호 = 그 분야 cards 배열 안의 순서 (링크에 넣어 그 카드로 바로 가요)
export function cardIndex(stage: StageKey, c: Card): number {
  return STAGES.find((s) => s.key === stage)?.cards.indexOf(c) ?? -1;
}

// 누르면 토스에서 이 앱의 해당 메뉴(와 카드)가 바로 열리는 링크
async function appLink(stage: StageKey, card: number): Promise<string> {
  const q = card >= 0 ? `stage=${stage}&card=${card}` : `stage=${stage}`;
  const hit = linkCache.get(q);
  if (hit) return hit;
  try {
    const url = await Share.createLink({ path: `intoss://${APP_NAME}?${q}` });
    if (url) {
      linkCache.set(q, url);
      return url;
    }
  } catch {}
  return FALLBACK_LINK;
}

function cardLines(c: Card): string[] {
  const head = `[${c.title}] ${c.amount}${c.amountNote ? ` (${c.amountNote})` : ''}`;
  const lines = [head];
  if (c.who) lines.push(`· ${c.who}`);
  for (const b of c.bullets.slice(0, 2)) lines.push(`· ${b}`);
  return lines;
}

const OPEN = {
  toParent: '엄마, 아빠! 이거 대상자일 수 있대요.',
  toChild: '얘야, 이 혜택 나도 받을 수 있는지 좀 봐 줄래?',
};
const CLOSE = {
  toParent: '주말에 내가 같이 확인하고 신청 도와드릴게요!',
  toChild: '신청하는 것도 같이 도와주면 고맙겠다.',
};

export function buildMessage(who: ShareWho, cards: Card[], link: string, stageName: string): string {
  const parts: string[] = [OPEN[who], ''];
  if (cards.length === 1) {
    parts.push(...cardLines(cards[0]));
  } else {
    parts.push(`${stageName} 혜택 중에 이런 게 있어요.`);
    for (const c of cards.slice(0, 5)) parts.push(`· ${c.title} — ${c.amount}`);
  }
  parts.push('', CLOSE[who], '', `👉 생애혜택 안내소에서 자세히 보기`, link);
  return parts.join('\n');
}

export async function shareBenefit(who: ShareWho, stage: StageKey, stageName: string, cards: Card[]): Promise<ShareResult> {
  const link = await appLink(stage, cards.length === 1 ? cardIndex(stage, cards[0]) : -1);
  const message = buildMessage(who, cards, link, stageName);
  try {
    await Share.sendMessage({ message });
    return 'shared';
  } catch {}
  try {
    if (navigator.share) {
      await navigator.share({ text: message });
      return 'shared';
    }
  } catch {
    return 'failed'; // 사용자가 공유창을 닫은 경우도 여기로 와요
  }
  try {
    await navigator.clipboard.writeText(message);
    return 'copied';
  } catch {}
  return 'failed';
}

// 공유 링크로 들어왔을 때 열 메뉴·카드 (intoss://saengae-benefit?stage=senior&card=1)
// 토스는 들어올 때 쓴 주소를 Environment.initialURL로 알려줘요 (웹 주소창 쿼리엔 안 붙어요 — 10/31 실기기 확인).
export type StartTarget = { stage: StageKey; card: number };

export function entryURL(): string {
  const parts: string[] = [];
  try {
    parts.push(String(Environment.initialURL ?? ''));
  } catch {}
  try {
    parts.push(window.location.search, window.location.hash);
  } catch {}
  return parts.join(' ');
}

export function startTarget(): StartTarget | null {
  const url = entryURL();
  const m = url.match(/[?&#]stage=([a-z]+)/);
  if (!m) return null;
  const stage = STAGES.find((s) => s.key === m[1])?.key;
  if (!stage) return null;
  const c = url.match(/[?&#]card=(\d+)/);
  return { stage, card: c ? Number(c[1]) : -1 };
}
