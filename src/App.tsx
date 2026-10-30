import { useEffect, useRef, useState } from 'react';
import { StageIcon } from './StageIcon';
import { CHECKED_AT, DETAILS, FOOTER, NOTICES, SHOP_DISCLOSE, STAGES, findDetail, findStage } from './data/content';
import type { Action, Card, CardTab, Detail, DetailBlock, Stage, StageKey } from './data/content';
import { TAB_LABEL } from './data/content';
import StageLocal from './StageLocal';
import { initBackHandler, useBackLayer } from './back';
import { attachBanner, openLink, track, BANNER_AD_ID } from './platform';
import Local from './Local';
import { loadShop, priceLabel } from './shop';
import type { ShopData, ShopGroup } from './shop';

type View = 'home' | 'local' | StageKey;

const TAG_CLASS = { 종료: 'end', '올해 마지막': 'end', '2027 예정': 'plan', '진행 중': 'new' } as const;

export default function App() {
  const [view, setView] = useState<View>('home');
  const [detailId, setDetailId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    initBackHandler();
  }, []);

  // 스크롤이 길어지면 '맨 위로' 버튼 (10/29 사장님 요청)
  function onScroll() {
    const y = scrollRef.current?.scrollTop ?? 0;
    setShowTop((v) => (y > 600 ? true : y < 300 ? false : v));
  }
  function toTop() {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 뒤로가기: 자세히 창 → 닫기, 분야·동네 화면 → 홈, 홈 → 앱 닫기
  useBackLayer(view !== 'home', () => setView('home'));
  useBackLayer(!!detailId, () => setDetailId(null));

  function go(v: View) {
    setView(v);
    setDetailId(null);
    scrollRef.current?.scrollTo({ top: 0 });
    if (v === 'local') track('local_opened');
    else if (v !== 'home') track('stage_opened', { stage: v });
  }
  function openDetail(id: string) {
    setDetailId(id);
    track('detail_opened', { id });
  }

  const detail = detailId ? findDetail(detailId) : undefined;

  return (
    <div className="screen">
      <div className="scroll" ref={scrollRef} onScroll={onScroll}>
        {view === 'home' ? (
          <Home onGo={go} onDetail={openDetail} />
        ) : (
          <>
            <Tabs view={view} onGo={go} />
            {view === 'local' ? <Local /> : <StageView stage={findStage(view)} onGo={go} onDetail={openDetail} />}
          </>
        )}
        <Footer />
      </div>
      {showTop && !detail && (
        <button className="to-top" onClick={toTop} aria-label="맨 위로">
          ▲
        </button>
      )}
      {detail && <DetailSheet d={detail} onClose={() => setDetailId(null)} />}
    </div>
  );
}

function Home({ onGo, onDetail }: { onGo: (v: View) => void; onDetail: (id: string) => void }) {
  return (
    <>
      <header className="hero">
        <h1>
          <b>0~100세</b> 생애혜택 안내소
        </h1>
        <p>나이별로 받을 수 있는 나라 지원과 무료 보험을 공식 자료로 정리했어요. 버튼을 누르면 정부 사이트가 열립니다.</p>
        <span className="stamp">자료 확인일 {CHECKED_AT}</span>
      </header>

      <div className="home-grid">
        <button className="home-tile local" onClick={() => onGo('local')}>
          <span className="emoji pin">📍</span>
          <span>
            <b>우리 동네 혜택 찾기</b>
            <br />
            <small>연금 · 어르신 면허 반납 · 장애인 — 정부24 자료로 시·도별 조회</small>
          </span>
        </button>
        {STAGES.map((s) => (
          <button key={s.key} className={`home-tile${s.mini ? ' mini' : ''}`} onClick={() => onGo(s.key)}>
            <StageIcon k={s.key} emoji={s.emoji} size={54} />
            <b>{s.name}</b>
            <small>{s.age}</small>
          </button>
        ))}
      </div>

      <aside className="notice">
        <h2>지금 꼭 확인할 변경 사항</h2>
        <ul>
          {NOTICES.map((n) => (
            <li key={n.title}>
              <span className={`tag ${TAG_CLASS[n.tag]}`}>{n.tag}</span>
              <b>{n.title}</b> {n.text}
              {n.go && (
                <div className="notice-go">
                  {n.go.map((a, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (a.kind === 'link') {
                          track('gov_link_clicked', { url: a.url, title: n.title });
                          void openLink(a.url);
                        } else if (a.kind === 'detail') onDetail(a.id);
                        else onGo(a.stage);
                      }}
                    >
                      {a.kind === 'detail' ? a.label ?? '자세히' : a.label} {a.kind === 'link' ? '↗' : '›'}
                    </button>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      </aside>
      <AdSlot />
    </>
  );
}

function Tabs({ view, onGo }: { view: View; onGo: (v: View) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current?.querySelector<HTMLElement>('.tab.on');
    el?.scrollIntoView({ inline: 'center', block: 'nearest' });
  }, [view]);
  return (
    <nav className="tabs" ref={ref}>
      <button className="tab" onClick={() => onGo('home')}>
        🏡 홈
      </button>
      <button className={`tab local${view === 'local' ? ' on' : ''}`} onClick={() => onGo('local')}>
        <span className="pin">📍</span> 우리 동네
      </button>
      {STAGES.filter((s) => !s.mini || view === s.key).map((s) => (
        <button key={s.key} className={`tab${view === s.key ? ' on' : ''}`} onClick={() => onGo(s.key)}>
          {s.name}
        </button>
      ))}
    </nav>
  );
}

type SubTab = '' | CardTab | 'local';

function StageView({ stage, onGo, onDetail }: { stage: Stage; onGo: (v: View) => void; onDetail: (id: string) => void }) {
  const [sub, setSub] = useState<SubTab>('');
  const [localTag, setLocalTag] = useState('');
  useEffect(() => {
    setSub('');
    setLocalTag('');
  }, [stage.key]);
  const has = (t: CardTab) => stage.cards.some((c) => c.tab === t);
  const subs: [SubTab, string][] = [['', '기본']];
  if (has('single')) subs.push(['single', TAB_LABEL.single]);
  if (has('worker')) subs.push(['worker', TAB_LABEL.worker]);
  if (!stage.mini) subs.push(['local', '우리 동네']);
  const cards = sub === 'local' ? [] : stage.cards.filter((c) => (c.tab ?? '') === sub);
  const plain = cards.filter((c) => !c.group);
  const groups = [...new Set(cards.filter((c) => c.group).map((c) => c.group!))];
  return (
    <>
      <div className="stage-head">
        <h2>
          <StageIcon k={stage.key} emoji={stage.emoji} size={38} /> {stage.name}
          <span className="age">{stage.age}</span>
        </h2>
        <p>{stage.intro}</p>
      </div>
      {subs.length > 1 && (
        <div className="subtabs">
          {subs.map(([k, label]) => (
            <button
              key={k}
              className={`subtab${sub === k ? ' on' : ''}`}
              onClick={() => {
                setSub(k);
                setLocalTag('');
                track('stage_subtab', { stage: stage.key, sub: k || 'basic' });
              }}
            >
              {k === 'local' && <span className="pin">📍</span>} {label}
            </button>
          ))}
        </div>
      )}
      {sub === 'local' ? (
        <StageLocal key={stage.key + localTag} stageKey={stage.key} stageName={stage.name} initialTag={localTag} />
      ) : (
        <>
          <div className="cards">
            {plain.map((c) => (
              <CardView key={c.title} c={c} onGo={onGo} onDetail={onDetail} />
            ))}
          </div>
          {groups.map((g) => (
            <div key={g}>
              <h3 className="group-head">{g}</h3>
              <div className="cards">
                {cards
                  .filter((c) => c.group === g)
                  .map((c) => (
                    <CardView key={c.title} c={c} onGo={onGo} onDetail={onDetail} />
                  ))}
              </div>
            </div>
          ))}
          {sub !== '' && (
            <button
              className="btn ghost block more-local"
              onClick={() => {
                setLocalTag(sub);
                setSub('local');
              }}
            >
              <span className="pin">📍</span> 우리 동네 {sub === 'single' ? '1인가구' : '직장인·일자리'} 혜택 더 보기
            </button>
          )}
          {sub === '' && stage.checklist && (
            <div className="check">
              <h3>✅ {stage.checklist.title}</h3>
              <ol>
                {stage.checklist.items.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ol>
            </div>
          )}
        </>
      )}
      <ShopBox stage={stage} />
      <AdSlot />
    </>
  );
}

// 분야별 상품: shop.json(토스쇼핑 쉐어링크, PC에서 자동 갱신)이 있으면 묶음마다 상품 카드 여러 개,
// 없으면 content.ts의 이름(url 있으면 버튼, 없으면 회색)으로.
function ShopBox({ stage }: { stage: Stage }) {
  const [data, setData] = useState<ShopData | null>(null);
  useEffect(() => {
    let alive = true;
    loadShop((d) => alive && setData(d)).then((d) => alive && setData(d));
    return () => {
      alive = false;
    };
  }, []);
  const groups: ShopGroup[] = (data?.stages[stage.key] ?? []).filter((g) => g.items.length > 0);
  const fallback = stage.shop ?? [];
  if (groups.length === 0 && fallback.length === 0) return null;
  const title = stage.shopTitle ?? '함께 준비하면 좋은 물건';

  if (groups.length === 0) {
    const hasLink = fallback.some((s) => s.url);
    return (
      <div className="shop">
        <h3>🛒 {title}</h3>
        <div className="shop-list">
          {fallback.map((it) =>
            it.url ? (
              <button
                key={it.name}
                onClick={() => {
                  track('shop_clicked', { stage: stage.key, name: it.name });
                  void openLink(it.url);
                }}
              >
                {it.name}
              </button>
            ) : (
              <span key={it.name} title="상품 준비 중">
                {it.name}
              </span>
            ),
          )}
        </div>
        {hasLink && <p className="disclose">{SHOP_DISCLOSE}</p>}
      </div>
    );
  }

  return (
    <div className="shop">
      <h3>🛒 {title}</h3>
      {groups.map((g) => (
        <div className="shop-group" key={g.id}>
          <div className="shop-group-name">{g.name}</div>
          <div className="shop-strip">
            {g.items.map((p) => (
              <button
                className="prod"
                key={p.id}
                onClick={() => {
                  track('shop_clicked', { stage: stage.key, group: g.id, id: p.id });
                  void openLink(p.url);
                }}
              >
                <img src={p.thumb} alt="" loading="lazy" />
                <span className="prod-name">{p.name}</span>
                {p.price ? <span className="prod-price">{priceLabel(p.price)}</span> : null}
              </button>
            ))}
          </div>
        </div>
      ))}
      <p className="disclose">ⓘ {data?.disclosure || SHOP_DISCLOSE}</p>
    </div>
  );
}

function CardView({ c, onGo, onDetail }: { c: Card; onGo: (v: View) => void; onDetail: (id: string) => void }) {
  function run(a: Action) {
    if (a.kind === 'link') {
      track('gov_link_clicked', { url: a.url, title: c.title });
      void openLink(a.url);
    } else if (a.kind === 'detail') onDetail(a.id);
    else onGo(a.stage);
  }
  return (
    <div className={`card${c.tone ? ' ' + c.tone : ''}`}>
      <h3>{c.title}</h3>
      <div className="amount">
        {c.amount}
        {c.amountNote && <small>{c.amountNote}</small>}
      </div>
      {c.who && <p className="who">{c.who}</p>}
      <ul>
        {c.bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
      <div className="actions">
        {c.actions.map((a, i) => (
          <button key={i} className={`btn${a.kind === 'link' && a.primary ? '' : ' ghost'}`} onClick={() => run(a)}>
            {a.kind === 'link' ? `${a.label} ↗` : a.kind === 'detail' ? (a.label ?? '자세히') : a.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function DetailSheet({ d, onClose }: { d: Detail; onClose: () => void }) {
  return (
    <div className="sheet-bg" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h3>{d.title}</h3>
          <button onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>
        <div className="sheet-body">
          {d.meta && <p className="meta">{d.meta}</p>}
          {d.blocks.map((b, i) => (
            <Block key={i} b={b} />
          ))}
          <p className="src">출처: {d.source}</p>
          <p className="src">금액과 조건은 바뀔 수 있으니 신청 전에 공식 사이트에서 한 번 더 확인하세요.</p>
        </div>
      </div>
    </div>
  );
}

function Block({ b }: { b: DetailBlock }) {
  if (b.kind === 'p') return <p>{b.text}</p>;
  if (b.kind === 'h') return <h4>{b.text}</h4>;
  if (b.kind === 'list')
    return (
      <ul>
        {b.items.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    );
  // 표: 첫 칸을 제목으로, 나머지 칸은 '머리글: 값' 줄로 (폰 폭에 맞게)
  const header = b.header;
  return (
    <div className="tbl">
      {b.rows.map((r, i) => (
        <div className="row" key={i}>
          {header ? (
            <>
              <b>{r[0]}</b>
              {r.slice(1).map((v, j) => (
                <div className="cell" key={j}>
                  {header[j + 1] && <i>{header[j + 1]}</i>}
                  <span>{v}</span>
                </div>
              ))}
            </>
          ) : (
            <>
              <b>{r[0]}</b>
              <span>{r[1]}</span>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function AdSlot() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    return attachBanner(ref.current);
  }, []);
  if (!BANNER_AD_ID) return null;
  return <div className="ad-slot" ref={ref} />;
}

function Footer() {
  return (
    <footer className="foot">
      <p>{FOOTER.notice}</p>
      <p>{FOOTER.contact}</p>
      <p>자료 확인일: {CHECKED_AT}</p>
    </footer>
  );
}

// 자세히 목록이 분야와 맞는지 개발 중 확인용 (빌드엔 영향 없음)
void DETAILS;
