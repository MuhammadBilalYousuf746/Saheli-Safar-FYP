// Original side-view minibus drawing. Rendered inside other SVGs as a <g>.
export default function Minibus({ x = 0, y = 0, scale = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* shadow */}
      <ellipse cx="100" cy="84" rx="96" ry="6" fill="var(--color-brand-deep)" opacity="0.45" />
      {/* body */}
      <path d="M8 22c0-9 7-16 16-16h118c9 0 17 5 22 12l22 28c3 4 4 8 4 13v12c0 5-4 9-9 9H17c-5 0-9-4-9-9z" fill="var(--color-ivory)" />
      {/* coral stripe */}
      <path d="M8 58h182v8H8z" fill="var(--color-coral)" />
      {/* windows */}
      <rect x="20" y="16" width="30" height="24" rx="5" fill="var(--color-brand-soft)" />
      <rect x="56" y="16" width="30" height="24" rx="5" fill="var(--color-brand-soft)" />
      <rect x="92" y="16" width="30" height="24" rx="5" fill="var(--color-brand-soft)" />
      <path d="M128 16h14c4 0 8 2 10 5l14 19h-38z" fill="var(--color-brand-soft)" />
      {/* window glare */}
      <path d="M24 34 36 20M60 34 72 20M96 34 108 20" stroke="var(--color-ivory)" strokeOpacity="0.25" strokeWidth="3" strokeLinecap="round" />
      {/* door line and headlight */}
      <path d="M124 44v28" stroke="var(--color-brand)" strokeOpacity="0.25" strokeWidth="2" />
      <rect x="180" y="50" width="8" height="6" rx="2" fill="var(--color-coral-light)" />
      {/* wheels */}
      <circle cx="46" cy="76" r="12" fill="var(--color-brand-deep)" />
      <circle cx="46" cy="76" r="5" fill="var(--color-line)" />
      <circle cx="154" cy="76" r="12" fill="var(--color-brand-deep)" />
      <circle cx="154" cy="76" r="5" fill="var(--color-line)" />
    </g>
  )
}
