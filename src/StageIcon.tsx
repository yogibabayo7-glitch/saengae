// 사람 모양 분야 아이콘 — 직접 그린 3D(점토 느낌) SVG. 이모지 대신 써요.
import { useId } from 'react';
import type { StageKey } from './data/content';

type Pal = [string, string, string]; // 밝은 · 중간 · 어두운

const PAL: Partial<Record<StageKey, Pal>> = {
  pregnancy: ['#ffd0dc', '#ff7fa0', '#d4486f'],
  kids: ['#fff0b8', '#ffc53d', '#dd8f00'],
  youth: ['#cfe6ff', '#5aa2ff', '#2a62c8'],
  senior: ['#ebe2ff', '#a98bff', '#6a4bd0'],
  disability: ['#c9f5ec', '#3cc9b0', '#128a76'],
};

export const HAS_ICON = (k: StageKey) => k in PAL;

function Defs({ id, pal }: { id: string; pal: Pal }) {
  return (
    <defs>
      <radialGradient id={`${id}s`} cx="0.35" cy="0.3" r="0.8">
        <stop offset="0" stopColor="#fff3e6" />
        <stop offset="0.55" stopColor="#ffcfa6" />
        <stop offset="1" stopColor="#e39c6c" />
      </radialGradient>
      <radialGradient id={`${id}b`} cx="0.32" cy="0.22" r="0.95">
        <stop offset="0" stopColor={pal[0]} />
        <stop offset="0.5" stopColor={pal[1]} />
        <stop offset="1" stopColor={pal[2]} />
      </radialGradient>
      <radialGradient id={`${id}h`} cx="0.35" cy="0.25" r="0.9">
        <stop offset="0" stopColor="#8a6450" />
        <stop offset="1" stopColor="#4a2f22" />
      </radialGradient>
      <radialGradient id={`${id}g`} cx="0.35" cy="0.25" r="0.9">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="1" stopColor="#b4b4c2" />
      </radialGradient>
      <radialGradient id={`${id}r`} cx="0.35" cy="0.3" r="0.8">
        <stop offset="0" stopColor="#ffb4b4" />
        <stop offset="0.5" stopColor="#ff5f5f" />
        <stop offset="1" stopColor="#c42e2e" />
      </radialGradient>
      <linearGradient id={`${id}w`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#9aa3b2" />
        <stop offset="1" stopColor="#3b4250" />
      </linearGradient>
    </defs>
  );
}

// 얼굴: 머리 공 + 반사광 + 눈·볼
function Head({ id, cx, cy, r, glasses }: { id: string; cx: number; cy: number; r: number; glasses?: boolean }) {
  const e = r * 0.36;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id}s)`} />
      <ellipse cx={cx - r * 0.38} cy={cy - r * 0.45} rx={r * 0.28} ry={r * 0.18} fill="#fff" opacity="0.6" />
      <circle cx={cx - e} cy={cy + r * 0.1} r={r * 0.11} fill="#3a2a22" />
      <circle cx={cx + e} cy={cy + r * 0.1} r={r * 0.11} fill="#3a2a22" />
      <ellipse cx={cx - r * 0.6} cy={cy + r * 0.42} rx={r * 0.17} ry={r * 0.11} fill="#ff8a8a" opacity="0.45" />
      <ellipse cx={cx + r * 0.6} cy={cy + r * 0.42} rx={r * 0.17} ry={r * 0.11} fill="#ff8a8a" opacity="0.45" />
      <path d={`M${cx - r * 0.18} ${cy + r * 0.45} Q${cx} ${cy + r * 0.6} ${cx + r * 0.18} ${cy + r * 0.45}`} stroke="#9a5a3a" strokeWidth={r * 0.09} fill="none" strokeLinecap="round" />
      {glasses && (
        <g stroke="#5b4636" strokeWidth="1.1" fill="none">
          <circle cx={cx - e} cy={cy + r * 0.1} r={r * 0.27} />
          <circle cx={cx + e} cy={cy + r * 0.1} r={r * 0.27} />
          <path d={`M${cx - e + r * 0.27} ${cy + r * 0.1} H${cx + e - r * 0.27}`} />
        </g>
      )}
    </g>
  );
}


// 앞머리 덮개: 머리 윗부분을 덮고 아래 끝은 옆으로 쓸린 곡선
function Hair({ id, cx, cy, r, fill = 'h' }: { id: string; cx: number; cy: number; r: number; fill?: string }) {
  const L = cx - r * 1.02, R = cx + r * 1.02, y = cy - r * 0.05;
  return (
    <g>
      <path d={`M${L} ${y} A${r * 1.02} ${r * 1.02} 0 0 1 ${R} ${y} C${cx + r * 0.7} ${cy - r * 0.5} ${cx + r * 0.1} ${cy - r * 0.42} ${cx - r * 0.25} ${cy - r * 0.62} C${cx - r * 0.45} ${cy - r * 0.3} ${cx - r * 0.8} ${cy - r * 0.35} ${L} ${y} Z`} fill={`url(#${id}${fill})`} />
      <path d={`M${cx - r * 0.55} ${cy - r * 0.78} Q${cx - r * 0.1} ${cy - r * 1.0} ${cx + r * 0.35} ${cy - r * 0.85}`} stroke="#fff" strokeWidth={r * 0.12} opacity="0.35" fill="none" strokeLinecap="round" />
    </g>
  );
}

const Shadow = ({ cx = 32, rx = 17 }: { cx?: number; rx?: number }) => <ellipse cx={cx} cy={59} rx={rx} ry={3} fill="#000" opacity="0.12" />;

function Body({ id, d }: { id: string; d: string }) {
  return (
    <g>
      <path d={d} fill={`url(#${id}b)`} />
    </g>
  );
}

function Figure({ k, id }: { k: StageKey; id: string }) {
  switch (k) {
    case 'pregnancy':
      return (
        <g>
          <Shadow />
          <Body id={id} d="M20 57 C18 42 22 31 32 31 C42 31 46 42 44 57 Z" />
          <circle cx="39" cy="46" r="10" fill={`url(#${id}b)`} />
          <path d="M39 49.5 C34.5 46 36 42 39 44 C42 42 43.5 46 39 49.5 Z" fill="#fff" opacity="0.9" />
          <path d="M22 20 C21 9 43 8 42 20 C39 14 26 13 22 20 Z" fill={`url(#${id}h)`} />
          <circle cx="32" cy="8.5" r="4.2" fill={`url(#${id}h)`} />
          <Head id={id} cx={32} cy={21} r={10} />
          <Hair id={id} cx={32} cy={21} r={10} />
        </g>
      );
    case 'kids':
      return (
        <g>
          <Shadow cx={30} rx={14} />
          <line x1="40" y1="45" x2="49" y2="22" stroke="#9aa0aa" strokeWidth="1" />
          <ellipse cx="50" cy="15" rx="7.5" ry="8.5" fill={`url(#${id}r)`} />
          <ellipse cx="47.5" cy="11.5" rx="2" ry="1.4" fill="#fff" opacity="0.7" />
          <Body id={id} d="M21 57 C20 47 23 39 30 39 C37 39 40 47 39 57 Z" />
          <path d="M36 44 L41 45" stroke={PAL.kids![2]} strokeWidth="3.4" strokeLinecap="round" />
          <circle cx="41" cy="45" r="2" fill={`url(#${id}s)`} />
          <Head id={id} cx={30} cy={28} r={11} />
          <Hair id={id} cx={30} cy={28} r={11} />
          <path d="M30 17.8 C28.5 13.5 31 11.5 33.5 12.8" stroke="#4a2f22" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'youth':
      return (
        <g>
          <Shadow />
          <Body id={id} d="M19 57 C18 43 23 34 32 34 C41 34 46 43 45 57 Z" />
          <path d="M26 36 C25 42 25 47 25.5 52" stroke={PAL.youth![2]} strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <path d="M38 36 C39 42 39 47 38.5 52" stroke={PAL.youth![2]} strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <path d="M22 21 C21 10 43 9 42 21 C40 15 30 13 22 21 Z" fill={`url(#${id}h)`} />
          <Head id={id} cx={32} cy={22} r={10} />
          <Hair id={id} cx={32} cy={22} r={10} />
          <path d="M51 9 L52.6 13 L56.6 13.6 L53.6 16.2 L54.5 20.2 L51 18 L47.5 20.2 L48.4 16.2 L45.4 13.6 L49.4 13 Z" fill="#ffd23f" stroke="#e0a800" strokeWidth="0.6" />
        </g>
      );
    case 'senior':
      return (
        <g>
          <Shadow cx={33} />
          <path d="M51 31 C51 26.5 56 26.5 56 31 L56 57" stroke="#8a5a2b" strokeWidth="3" fill="none" strokeLinecap="round" />
          <Body id={id} d="M18 57 C17 44 21 34 30 34 C39 34 43 44 42 57 Z" />
          <path d="M38 41 L50 40" stroke={PAL.senior![2]} strokeWidth="3.4" strokeLinecap="round" />
          <circle cx="51.5" cy="40" r="2.6" fill={`url(#${id}s)`} />
          <circle cx="20.5" cy="21" r="3.6" fill={`url(#${id}g)`} />
          <circle cx="39.5" cy="21" r="3.6" fill={`url(#${id}g)`} />
          <Head id={id} cx={30} cy={22} r={10} glasses />
          <Hair id={id} cx={30} cy={22} r={10} fill="g" />
          <circle cx="30" cy="10" r="4" fill={`url(#${id}g)`} />
        </g>
      );
    case 'disability':
      return (
        <g>
          <Shadow cx={34} rx={19} />
          <path d="M20 41 H41 L46 54" stroke="#4b5260" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20 41 L18 28" stroke="#4b5260" strokeWidth="2.4" strokeLinecap="round" />
          <Body id={id} d="M21 41 C19 31 23 26 30 26 C37 26 39 32 37 41 Z" />
          <path d="M32 40 H42 L44 51" stroke={PAL.disability![1]} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="28" cy="46" r="11" fill="none" stroke={`url(#${id}w)`} strokeWidth="3.6" />
          <path d="M20.5 41 A9 9 0 0 1 28 36.5" stroke="#fff" strokeWidth="1.2" fill="none" opacity="0.6" strokeLinecap="round" />
          <circle cx="28" cy="46" r="2.6" fill={`url(#${id}w)`} />
          <circle cx="48" cy="55" r="3" fill={`url(#${id}w)`} />
          <path d="M21 15 C20 5 40 4 39 15 C37 10 27 9 21 15 Z" fill={`url(#${id}h)`} />
          <Head id={id} cx={30} cy={16} r={9} />
          <Hair id={id} cx={30} cy={16} r={9} />
        </g>
      );
    default:
      return null;
  }
}

export function StageIcon({ k, emoji, size = 40 }: { k: StageKey; emoji: string; size?: number }) {
  const id = useId().replace(/:/g, '');
  const pal = PAL[k];
  if (!pal) return <span className="emoji">{emoji}</span>;
  return (
    <svg className="stage-icon" width={size} height={size} viewBox="4 2 57 60" aria-hidden="true">
      <Defs id={id} pal={pal} />
      <Figure k={k} id={id} />
    </svg>
  );
}
