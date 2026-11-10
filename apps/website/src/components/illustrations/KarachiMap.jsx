import { karachi } from '../../content/site.js'

/*
  Abstract, Karachi-inspired map: a coastline on the Arabian Sea, a loose street grid
  and two illustrative routes between generic destinations. It is not geographically
  accurate and shows no real or planned route.
*/
export default function KarachiMap({ className = '', preserveAspectRatio = 'xMidYMid meet' }) {
  const { sea, city } = karachi.mapLabels

  return (
    <svg
      viewBox="0 0 640 520"
      preserveAspectRatio={preserveAspectRatio}
      className={className}
      role="img"
      aria-label="Abstract illustration of Karachi beside the Arabian Sea with two illustrative routes"
    >
      <defs>
        <clipPath id="land">
          <path d="M0 0H640V330C580 340 540 380 470 372S360 420 300 440 170 470 120 500 40 520 0 520z" />
        </clipPath>
        <pattern id="waves" width="40" height="16" patternUnits="userSpaceOnUse">
          <path d="M0 8c10-6 10-6 20 0s10 6 20 0" fill="none" stroke="var(--color-brand)" strokeOpacity="0.12" strokeWidth="1.5" />
        </pattern>
      </defs>

      {/* sea */}
      <rect width="640" height="520" fill="var(--color-brand-mist)" />
      <rect width="640" height="520" fill="url(#waves)" />

      {/* land */}
      <g clipPath="url(#land)">
        <rect width="640" height="520" fill="var(--color-ivory)" />
        {/* street grid, slightly rotated */}
        <g stroke="var(--color-brand)" strokeOpacity="0.07" strokeWidth="1.5" transform="rotate(-14 320 260)">
          {Array.from({ length: 18 }, (_, i) => (
            <path key={`a${i}`} d={`M${-100 + i * 50} -100V700`} />
          ))}
          {Array.from({ length: 14 }, (_, i) => (
            <path key={`b${i}`} d={`M-100 ${-60 + i * 50}H800`} />
          ))}
        </g>
        {/* main roads */}
        <path d="M-10 120C160 140 300 90 660 160" stroke="var(--color-ivory-3)" strokeWidth="10" fill="none" />
        <path d="M120 -10C170 160 230 300 260 520" stroke="var(--color-ivory-3)" strokeWidth="10" fill="none" />
        <path d="M420 -10C410 140 470 260 640 300" stroke="var(--color-ivory-3)" strokeWidth="8" fill="none" />
        {/* rivers, abstract */}
        <path d="M600 40C520 110 520 200 430 250S330 330 300 420" stroke="var(--color-on-brand-3)" strokeOpacity="0.6" strokeWidth="4" fill="none" />
      </g>

      {/* coastline */}
      <path
        d="M640 330C580 340 540 380 470 372S360 420 300 440 170 470 120 500 40 520 0 520"
        stroke="var(--color-brand)"
        strokeOpacity="0.35"
        strokeWidth="2"
        fill="none"
      />

      {/* illustrative routes */}
      <path d="M90 90C180 120 220 210 300 240s170 10 230-60" stroke="var(--color-brand)" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path
        className="route-flow"
        d="M110 330C190 300 230 330 300 240s120-140 220-150"
        stroke="var(--color-coral)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="2 12"
        fill="none"
      />

      {/* stops */}
      {[
        [90, 90, 'var(--color-brand)'],
        [300, 240, 'var(--color-coral)'],
        [530, 180, 'var(--color-brand)'],
        [110, 330, 'var(--color-coral)'],
        [520, 90, 'var(--color-coral)'],
      ].map(([cx, cy, color]) => (
        <g key={`${cx}-${cy}`}>
          <circle cx={cx} cy={cy} r="13" fill={color} fillOpacity="0.15" />
          <circle cx={cx} cy={cy} r="6.5" fill="var(--color-ivory)" stroke={color} strokeWidth="3.5" />
        </g>
      ))}

      {/* labels */}
      <text x="455" y="300" textAnchor="middle" fontFamily="Sora, sans-serif" fontWeight="700" fontSize="26" fill="var(--color-brand)">
        {city}
      </text>
      <text x="96" y="488" fontFamily="Manrope, sans-serif" fontWeight="700" fontSize="14" letterSpacing="3" fill="var(--color-brand)" fillOpacity="0.55">
        {sea.toUpperCase()}
      </text>

      {/* compass */}
      <g transform="translate(588 470)">
        <circle r="22" fill="var(--color-ivory)" stroke="var(--color-brand)" strokeOpacity="0.2" />
        <path d="M0 -14 6 4 0 0-6 4z" fill="var(--color-coral)" />
        <text y="18" textAnchor="middle" fontFamily="Manrope, sans-serif" fontWeight="800" fontSize="9" fill="var(--color-brand)">
          N
        </text>
      </g>
    </svg>
  )
}
