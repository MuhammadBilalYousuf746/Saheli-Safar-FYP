// Decorative flowing route lines used as a background layer on dark sections.
export default function RouteArt({ className = '', accent = true }) {
  return (
    <svg viewBox="0 0 700 360" fill="none" className={className} aria-hidden="true" focusable="false">
      <path d="M-20 300C120 300 150 120 300 140s170 170 300 90 140-170 140-170" stroke="var(--color-ivory)" strokeOpacity="0.12" strokeWidth="2" />
      <path d="M-20 340C160 330 200 200 330 210s190 120 300 40 110-120 110-120" stroke="var(--color-ivory)" strokeOpacity="0.08" strokeWidth="2" />
      {accent ? (
        <path
          className="route-flow"
          d="M-20 260C100 250 170 60 320 90s160 150 280 80 120-110 120-110"
          stroke="var(--color-coral)"
          strokeOpacity="0.7"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="2 12"
        />
      ) : null}
      <circle cx="320" cy="90" r="5" fill="var(--color-coral)" />
      <circle cx="600" cy="170" r="5" fill="var(--color-ivory)" fillOpacity="0.6" />
    </svg>
  )
}
