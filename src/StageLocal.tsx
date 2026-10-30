// 분야 화면 안의 '우리 동네' 칸 — 정부24(행정안전부) 공공서비스 중 이 분야에 맞는 것을 사는 곳 기준으로
import { useEffect, useMemo, useState } from 'react';
import { SIDO_LIST, filterBenefits, loadStage, sigunguOf, updatedLabel } from './benefits';
import type { StageItem, StageList } from './benefits';
import { LocalDetail, SIDO_KEY } from './Local';
import { useBackLayer } from './back';
import { track } from './platform';

const TAGS: [string, string][] = [
  ['', '전체'],
  ['single', '1인가구'],
  ['worker', '직장인·일자리'],
];

export default function StageLocal({ stageKey, stageName, initialTag = '' }: { stageKey: string; stageName: string; initialTag?: string }) {
  const [data, setData] = useState<StageList | null>(null);
  const [err, setErr] = useState(false);
  const [tag, setTag] = useState(initialTag);
  const [sido, setSido] = useState<string>(() => {
    try {
      return localStorage.getItem(SIDO_KEY) ?? '';
    } catch {
      return '';
    }
  });
  const [sigungu, setSigungu] = useState('');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<StageItem | null>(null);
  const [limit, setLimit] = useState(60);

  function load() {
    setErr(false);
    setData(null);
    loadStage(stageKey, (fresh) => setData(fresh))
      .then(setData)
      .catch(() => setErr(true));
  }
  useEffect(load, [stageKey]);
  useEffect(() => setLimit(60), [tag, sido, sigungu, q, stageKey]);

  useBackLayer(!!open, () => setOpen(null));

  const items = data?.items ?? [];
  const byTag = useMemo(() => (tag ? items.filter((b) => b.tags.includes(tag)) : items), [items, tag]);
  const list = useMemo(
    () => filterBenefits(byTag, { sido: sido || undefined, sigungu: sigungu || undefined, q }) as StageItem[],
    [byTag, sido, sigungu, q],
  );
  const sigungus = useMemo(() => (sido ? sigunguOf(items, sido) : []), [items, sido]);
  const tagCount = (t: string) => (t ? items.filter((b) => b.tags.includes(t)).length : items.length);

  function pickSido(v: string) {
    setSido(v);
    setSigungu('');
    try {
      localStorage.setItem(SIDO_KEY, v);
    } catch {}
  }

  return (
    <div className="stage-local">
      <p className="local-lead">
        정부24에 등록된 {stageName} 대상 혜택을 사는 곳 기준으로 모았어요. 시·도를 고르면 전국 공통 + 우리 지역 혜택이 나와요. {data && updatedLabel(data.updatedAt)}
      </p>

      {data && (
        <div className="cats">
          {TAGS.filter(([t]) => !t || tagCount(t) > 0).map(([t, label]) => (
            <button key={t} className={`tab${tag === t ? ' on' : ''}`} onClick={() => setTag(t)}>
              {label} {tagCount(t)}
            </button>
          ))}
        </div>
      )}

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
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="혜택 이름으로 찾기" inputMode="search" />
      </div>

      {err && !data ? (
        <div className="empty">
          인터넷 연결을 확인해 주세요.
          <br />
          <button className="btn ghost" style={{ marginTop: 12 }} onClick={load}>
            다시 시도
          </button>
        </div>
      ) : !data ? (
        <div className="spinner" />
      ) : (
        <>
          <div className="count">
            {sido ? `전국 공통 + ${sigungu || sido}` : '전국'} · {list.length}건
          </div>
          <div className="list">
            {list.length === 0 && <div className="empty">이 조건에 맞는 혜택이 정부24에 없어요. 시·도만 고르거나 검색어를 지워 보세요.</div>}
            {list.slice(0, limit).map((b) => (
              <button
                key={b.id}
                className="item"
                onClick={() => {
                  setOpen(b);
                  track('stage_local_opened', { id: b.id, stage: stageKey });
                }}
              >
                <b>{b.name}</b>
                <div className="org">
                  <span className="pill">{b.sido === '전국' ? '전국' : b.sigungu ? `${b.sido} ${b.sigungu}` : b.sido}</span>
                  {b.tags.includes('single') && <span className="pill soft">1인가구</span>}
                  {b.tags.includes('worker') && <span className="pill soft">직장인·일자리</span>}
                  {b.org}
                </div>
                {b.summary && <div className="sum">{b.summary}</div>}
              </button>
            ))}
            {list.length > limit && (
              <button className="btn ghost block" onClick={() => setLimit((n) => n + 60)}>
                더 보기 ({list.length - limit}건 남음)
              </button>
            )}
          </div>
        </>
      )}

      <p className="local-note">출처: {data?.source ?? '행정안전부 대한민국 공공서비스(혜택) 정보'} · 매일 새벽 갱신</p>

      {open && <LocalDetail b={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
