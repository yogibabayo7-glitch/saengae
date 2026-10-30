// 우리 동네 혜택 — 정부24(공공서비스 혜택 정보) 자동 수집 데이터를 시·도별로 보여 줘요
import { useEffect, useMemo, useState } from 'react';
import { CAT_LABEL, SIDO_LIST, filterBenefits, loadDetail, loadIndex, sigunguOf, toLines, updatedLabel } from './benefits';
import type { BenefitDetail, BenefitIndex, BenefitSummary, CatKey } from './benefits';
import { useBackLayer } from './back';
import { openLink, track } from './platform';

const CATS: CatKey[] = ['pension', 'elderDriving', 'disability'];
const CAT_SHORT: Record<CatKey, string> = { pension: '연금', elderDriving: '어르신 면허 반납', disability: '장애인' };
export const SIDO_KEY = 'saengae.sido';

export default function Local() {
  const [idx, setIdx] = useState<BenefitIndex | null>(null);
  const [err, setErr] = useState(false);
  const [cat, setCat] = useState<CatKey>('disability');
  const [sido, setSido] = useState<string>(() => {
    try {
      return localStorage.getItem(SIDO_KEY) ?? '';
    } catch {
      return '';
    }
  });
  const [sigungu, setSigungu] = useState('');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<BenefitSummary | null>(null);

  function load() {
    setErr(false);
    loadIndex((fresh) => setIdx(fresh))
      .then(setIdx)
      .catch(() => setErr(true));
  }
  useEffect(load, []);

  useBackLayer(!!open, () => setOpen(null));

  const items = idx?.items ?? [];
  const list = useMemo(() => filterBenefits(items, { cat, sido: sido || undefined, sigungu: sigungu || undefined, q }), [items, cat, sido, sigungu, q]);
  const sigungus = useMemo(() => (sido ? sigunguOf(items, sido) : []), [items, sido]);

  function pickSido(v: string) {
    setSido(v);
    setSigungu('');
    try {
      localStorage.setItem(SIDO_KEY, v);
    } catch {}
  }

  return (
    <>
      <div className="local-top">
        <h2>📍 우리 동네 혜택</h2>
        <p>정부24에 등록된 공공서비스 중 연금·어르신 운전면허 반납·장애인 혜택을 사는 곳 기준으로 보여 줘요. {idx && updatedLabel(idx.updatedAt)}</p>
      </div>

      <div className="cats">
        {CATS.map((c) => (
          <button key={c} className={`tab${cat === c ? ' on' : ''}`} onClick={() => setCat(c)}>
            {CAT_SHORT[c]}
            {idx && ` ${idx.counts[c]}`}
          </button>
        ))}
      </div>

      <div className="filters">
        <select value={sido} onChange={(e) => pickSido(e.target.value)} aria-label="시·도">
          <option value="">전국 전체</option>
          {SIDO_LIST.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {sido && sigungus.length > 0 && (
          <select value={sigungu} onChange={(e) => setSigungu(e.target.value)} aria-label="시·군·구">
            <option value="">{sido} 전체</option>
            {sigungus.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="filters">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="혜택 이름으로 찾기 (예: 활동지원, 교통카드)" inputMode="search" />
      </div>

      {err && !idx ? (
        <div className="empty">
          인터넷 연결을 확인해 주세요.
          <br />
          <button className="btn ghost" style={{ marginTop: 12 }} onClick={load}>
            다시 시도
          </button>
        </div>
      ) : !idx ? (
        <div className="spinner" />
      ) : (
        <>
          <div className="count">
            {CAT_LABEL[cat]} · {sido ? `전국 공통 + ${sigungu || sido}` : '전국'} · {list.length}건
          </div>
          <div className="list">
            {list.length === 0 && <div className="empty">이 조건에 맞는 혜택이 정부24에 등록돼 있지 않아요. 시·도만 고르거나 검색어를 지워 보세요.</div>}
            {list.slice(0, 200).map((b) => (
              <button
                key={b.id}
                className="item"
                onClick={() => {
                  setOpen(b);
                  track('local_detail_opened', { id: b.id, cat });
                }}
              >
                <b>{b.name}</b>
                <div className="org">
                  <span className="pill">{b.sido === '전국' ? '전국' : b.sigungu ? `${b.sido} ${b.sigungu}` : b.sido}</span>
                  {b.org}
                  {b.supportType && ` · ${b.supportType}`}
                </div>
                {b.summary && <div className="sum">{b.summary}</div>}
              </button>
            ))}
            {list.length > 200 && <div className="count">200건까지만 보여요. 시·군·구나 검색어로 줄여 보세요.</div>}
          </div>
        </>
      )}

      <p className="local-note">
        {cat === 'elderDriving' && '면허 반납 지원은 정부24에 등록한 지자체만 나와요. 등록하지 않은 지역은 주민센터에 문의하세요. '}
        {cat === 'pension' && '국민연금 노령연금 자체는 국민연금공단 급여라 정부24 목록에 없어요. 받는 나이·감액은 어르신 → 국민연금 노령연금 → 자세히에서 보세요. '}
        출처: {idx?.source ?? '행정안전부 대한민국 공공서비스(혜택) 정보'}
      </p>

      {open && <LocalDetail b={open} onClose={() => setOpen(null)} />}
    </>
  );
}

export function LocalDetail({ b, onClose }: { b: BenefitSummary; onClose: () => void }) {
  const [d, setD] = useState<BenefitDetail | null | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    loadDetail(b)
      .then((v) => alive && setD(v))
      .catch(() => alive && setD(null));
    return () => {
      alive = false;
    };
  }, [b]);

  const rows: [string, string][] = d
    ? ([
        ['대상', d.target],
        ['선정 기준', d.criteria],
        ['내용', d.content],
        ['신청 방법', d.how],
        ['신청 기한', d.deadline],
        ['서류', d.docs],
        ['접수 기관', d.receiver],
        ['문의', [d.dept, d.phone].filter(Boolean).join(' ')],
      ] as [string, string][]).filter((r) => r[1])
    : [];

  return (
    <div className="sheet-bg" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h3>{b.name}</h3>
          <button onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>
        <div className="sheet-body">
          <p className="meta">
            {b.org}
            {b.supportType && ` · ${b.supportType}`}
            {' · '}
            {b.sido === '전국' ? '전국' : `${b.sido} ${b.sigungu}`.trim()}
          </p>
          {d === undefined ? (
            <div className="spinner" />
          ) : d === null ? (
            <p>자세한 내용을 불러오지 못했어요. 아래 정부24 버튼으로 확인해 주세요.</p>
          ) : (
            <>
              {d.purpose && <p>{d.purpose}</p>}
              <div className="tbl">
                {rows.map(([k, v]) => (
                  <div className="row" key={k}>
                    <b>{k}</b>
                    <Lines s={v} />
                  </div>
                ))}
              </div>
              {d.updated && <p className="src">정부24 수정일: {d.updated}</p>}
            </>
          )}
        </div>
          <div className="sheet-foot">
          {(
            <button
              className="btn block"
              onClick={() => {
                const url = d?.url || 'https://www.gov.kr';
                track('local_gov24_clicked', { id: b.id });
                void openLink(url);
              }}
            >
              정부24에서 신청·자세히 보기 ↗
            </button>
          )}
          {d?.onlineUrl && (
            <button className="btn ghost block" onClick={() => void openLink(d.onlineUrl)}>
              온라인 신청 사이트 ↗
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Lines({ s }: { s: string }) {
  const ls = toLines(s);
  if (ls.length <= 1) return <span>{ls[0] ?? s}</span>;
  return (
    <ul>
      {ls.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ul>
  );
}
