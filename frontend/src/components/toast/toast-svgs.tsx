'use client';

import { useId } from 'react';

type GlyphProps = {
  className?: string;
};

/** Large decorative glyphs (120×120 viewBox), scaled via className — default for toast. */
export function ToastGlyphError({ className }: GlyphProps) {
  const uid = useId().replace(/:/g, '');
  const gid = `errorBg-${uid}`;
  const fid = `shadow-${uid}`;

  return (
    <svg
      className={className}
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id={gid} x1="20" y1="16" x2="98" y2="104" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF1F2" />
          <stop offset="1" stopColor="#FFE4E6" />
        </linearGradient>
        <filter
          id={fid}
          x="0"
          y="0"
          width="120"
          height="120"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#0F172A" floodOpacity="0.1" />
        </filter>
      </defs>
      <g filter={`url(#${fid})`}>
        <circle cx="60" cy="60" r="44" fill={`url(#${gid})`} />
        <circle cx="60" cy="60" r="43.5" fill="none" stroke="#FECDD3" strokeWidth="1" />
      </g>
      <circle cx="60" cy="60" r="24" fill="#EF4444" />
      <path d="M60 46V62" stroke="white" strokeWidth="5" strokeLinecap="round" />
      <circle cx="60" cy="72" r="3.5" fill="white" />
    </svg>
  );
}

export function ToastGlyphSuccess({ className }: GlyphProps) {
  const uid = useId().replace(/:/g, '');
  const gid = `successOuter-${uid}`;
  const fid = `successShadow-${uid}`;

  return (
    <svg
      className={className}
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id={gid} x1="20" y1="16" x2="98" y2="104" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ECFDF5" />
          <stop offset="1" stopColor="#D1FAE5" />
        </linearGradient>
        <filter
          id={fid}
          x="0"
          y="0"
          width="120"
          height="120"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#0F172A" floodOpacity="0.1" />
        </filter>
      </defs>
      <g filter={`url(#${fid})`}>
        <circle cx="60" cy="60" r="44" fill={`url(#${gid})`} />
        <circle cx="60" cy="60" r="43.5" fill="none" stroke="#A7F3D0" strokeWidth="1" />
      </g>
      <circle cx="60" cy="60" r="24" fill="#10B981" />
      <path
        d="M49 60.5L56.5 68L71 53.5"
        stroke="white"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ToastGlyphInfo({ className }: GlyphProps) {
  const uid = useId().replace(/:/g, '');
  const gid = `infoOuter-${uid}`;
  const fid = `infoShadow-${uid}`;

  return (
    <svg
      className={className}
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id={gid} x1="20" y1="16" x2="98" y2="104" gradientUnits="userSpaceOnUse">
          <stop stopColor="#EFF6FF" />
          <stop offset="1" stopColor="#DBEAFE" />
        </linearGradient>
        <filter
          id={fid}
          x="0"
          y="0"
          width="120"
          height="120"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#0F172A" floodOpacity="0.1" />
        </filter>
      </defs>
      <g filter={`url(#${fid})`}>
        <circle cx="60" cy="60" r="44" fill={`url(#${gid})`} />
        <circle cx="60" cy="60" r="43.5" fill="none" stroke="#BFDBFE" strokeWidth="1" />
      </g>
      <circle cx="60" cy="60" r="24" fill="#2563EB" />
      <path d="M60 57V70" stroke="white" strokeWidth="5" strokeLinecap="round" />
      <circle cx="60" cy="49" r="3.5" fill="white" />
    </svg>
  );
}

export function ToastGlyphWarning({ className }: GlyphProps) {
  const uid = useId().replace(/:/g, '');
  const gid = `warningOuter-${uid}`;
  const fid = `warningShadow-${uid}`;

  return (
    <svg
      className={className}
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id={gid} x1="20" y1="16" x2="98" y2="104" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFBEB" />
          <stop offset="1" stopColor="#FEF3C7" />
        </linearGradient>
        <filter
          id={fid}
          x="0"
          y="0"
          width="120"
          height="120"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#0F172A" floodOpacity="0.1" />
        </filter>
      </defs>
      <g filter={`url(#${fid})`}>
        <circle cx="60" cy="60" r="44" fill={`url(#${gid})`} />
        <circle cx="60" cy="60" r="43.5" fill="none" stroke="#FDE68A" strokeWidth="1" />
      </g>
      <circle cx="60" cy="60" r="24" fill="#F59E0B" />
      <path d="M60 47V62" stroke="white" strokeWidth="5" strokeLinecap="round" />
      <circle cx="60" cy="72" r="3.5" fill="white" />
    </svg>
  );
}

/** Compact 20×20 icons for dense UI (optional). */
export function ToastGlyphErrorMini({ className }: GlyphProps) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="10" cy="10" r="10" fill="#DC2626" />
      <path d="M10 5.5V10.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <circle cx="10" cy="14" r="1.25" fill="white" />
    </svg>
  );
}

export function ToastGlyphSuccessMini({ className }: GlyphProps) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="10" cy="10" r="10" fill="#10B981" />
      <path
        d="M6 10.5L8.5 13L14 7.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ToastGlyphInfoMini({ className }: GlyphProps) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="10" cy="10" r="10" fill="#2563EB" />
      <path d="M10 8.5V13" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <circle cx="10" cy="6" r="1.25" fill="white" />
    </svg>
  );
}

export function ToastGlyphWarningMini({ className }: GlyphProps) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="10" cy="10" r="10" fill="#F59E0B" />
      <path d="M10 5.5V10.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <circle cx="10" cy="14" r="1.25" fill="white" />
    </svg>
  );
}
