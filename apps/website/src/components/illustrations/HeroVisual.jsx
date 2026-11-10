import { useId } from 'react'
import { hero } from '../../content/site.js'
import Icon from '../ui/Icon.jsx'
import Minibus from './Minibus.jsx'

// Stylized Karachi landmarks, composed together as artwork rather than a route map.
function Scene() {
  const id = useId().replace(/:/g, '')
  return <svg viewBox="0 0 600 640" className="absolute inset-0 size-full" role="img" aria-labelledby={`${id}-title ${id}-description`}>
    <title id={`${id}-title`}>Karachi: Mazar-e-Quaid, Frere Hall and Teen Talwar</title>
    <desc id={`${id}-description`}>An illustrated Karachi evening with Mazar-e-Quaid at the centre, Frere Hall, Teen Talwar, coastal waves and a Saheli Safar minibus. A decorative composition, not an operating route.</desc>
    <defs>
      <linearGradient id={`${id}-sky`} x2="0" y2="1">
        <stop stopColor="var(--color-brand-soft)" />
        <stop offset="1" stopColor="var(--color-brand-deep)" />
      </linearGradient>
      <linearGradient id={`${id}-marble`} x2="1" y2="1">
        <stop stopColor="var(--color-ivory)" />
        <stop offset="1" stopColor="var(--color-ivory-3)" />
      </linearGradient>
    </defs>
    <rect width="600" height="640" fill={`url(#${id}-sky)`} />
    <circle cx="430" cy="150" r="66" fill="var(--color-coral)" opacity=".85" />
    <circle cx="430" cy="150" r="84" fill="none" stroke="var(--color-coral-light)" opacity=".12" />
    <g fill="none" stroke="var(--color-on-brand)" strokeLinecap="round" opacity=".5">
      <path d="M94 160q8-9 16 0q8-9 16 0M135 184q6-7 12 0q6-7 12 0M446 244q7-8 14 0q7-8 14 0" />
    </g>
    <text x="300" y="94" textAnchor="middle" fill="var(--color-on-brand)" fontFamily="Sora, sans-serif" fontSize="30" fontWeight="700" letterSpacing="8">KARACHI</text>
    <path d="M225 112h150" stroke="var(--color-coral)" strokeWidth="2" opacity=".6" />

    {/* Distant city silhouettes, kept subordinate to the monuments. */}
    <g fill="var(--color-on-brand)" opacity=".07">
      <path d="M0 440V345h40v95M46 440V320h35v120M88 440V370h40v70M455 440V345h25v95M539 440V302h26v138M574 440V353h26v87" />
    </g>
    <ellipse cx="300" cy="469" rx="270" ry="26" fill="var(--color-brand-deep)" opacity=".7" />

    {/* Mazar-e-Quaid: raised marble platform, tapered cube, central pointed arch and dome. */}
    <g>
      <path d="M168 460h264v12H168zM180 448h240v12H180zM190 436h220v12H190z" fill="var(--color-ivory-3)" />
      <path d="M194 436l18-161h176l18 161z" fill={`url(#${id}-marble)`} />
      <path d="M212 275h176v13H212z" fill="var(--color-on-brand)" />
      <path d="M244 275v-11c0-30 25-54 56-54s56 24 56 54v11z" fill="var(--color-ivory)" />
      <path d="M300 210v-12" stroke="var(--color-ivory)" strokeWidth="3" />
      <path d="M260 436v-84q0-27 40-52q40 25 40 52v84z" fill="var(--color-brand-soft)" />
      <path d="M270 436v-82q0-20 30-41q30 21 30 41v82" fill="none" stroke="var(--color-ivory-3)" strokeWidth="3" />
      <path d="M224 314v100M376 314v100" stroke="var(--color-brand-soft)" strokeOpacity=".12" strokeWidth="3" />
      <path d="M294 436v-70m12 70v-70" stroke="var(--color-on-brand)" strokeOpacity=".17" strokeWidth="2" />
    </g>

    {/* Frere Hall: pointed arcade, pitched roof and its distinctive clock tower/spire. */}
    <g transform="translate(24 340)">
      <path d="M0 116h157v12H0z" fill="var(--color-ivory-3)" />
      <path d="M12 65h133v51H12z" fill="var(--color-coral-light)" />
      <path d="M6 65l72-38l73 38z" fill="var(--color-brand-soft)" stroke="var(--color-coral-light)" strokeWidth="2" />
      <path d="M76 33V-18h25v57z" fill="var(--color-coral-light)" />
      <path d="M72-18l17-39l17 39z" fill="var(--color-ivory-3)" />
      <path d="M89-57v-9" stroke="var(--color-coral-light)" strokeWidth="2" />
      <circle cx="89" cy="0" r="7" fill="var(--color-brand)" />
      <path d="M89-5v5l3 2" stroke="var(--color-coral-light)" strokeWidth="1.5" fill="none" />
      {[25, 52, 79, 106].map(x => <path key={x} d={`M${x} 116V89q0-8 9-14q9 6 9 14v27z`} fill="var(--color-brand)" />)}
      <path d="M12 72h133M16 120h125" stroke="var(--color-ivory)" strokeOpacity=".55" strokeWidth="2" />
    </g>

    {/* Teen Talwar: three rising marble swords on one plinth. */}
    <g transform="translate(473 277)">
      <ellipse cx="34" cy="185" rx="49" ry="11" fill="var(--color-brand-soft)" />
      <path d="M-7 169h82v11H-7zM2 159h64v10H2z" fill="var(--color-ivory-3)" />
      {[[9, 17], [32, 0], [55, 24]].map(([x, y]) => <g key={x} transform={`translate(${x} ${y})`}>
        <path d={`M-5 ${159-y}V20L0 0l5 20v${139-y}z`} fill="var(--color-ivory)" />
        <path d="M-11 113h22M0 117v17" stroke="var(--color-coral-light)" strokeWidth="3" />
      </g>)}
    </g>

    {/* Landmark labels are names, not claims of service coverage. */}
    <g fill="var(--color-on-brand-2)" fontFamily="Manrope, sans-serif" fontSize="12" fontWeight="600" textAnchor="middle">
      <text x="300" y="493">Mazar-e-Quaid</text>
      <text x="103" y="493">Frere Hall</text>
      <text x="507" y="493">Teen Talwar</text>
    </g>
    <path d="M0 523h600v65H0z" fill="var(--color-brand-deep)" />
    <path className="route-flow" d="M0 556h600" stroke="var(--color-coral)" strokeWidth="2" strokeDasharray="8 15" opacity=".55" />
    <Minibus x={228} y={493} scale={.86} />
    <g fill="none" stroke="var(--color-on-brand)" strokeOpacity=".12" strokeWidth="2">
      <path d="M0 603q25-12 50 0t50 0t50 0t50 0t50 0t50 0t50 0t50 0t50 0t50 0t50 0t50 0M0 621q25-12 50 0t50 0t50 0t50 0t50 0t50 0t50 0t50 0t50 0t50 0t50 0t50 0" />
    </g>
  </svg>
}

function Chip({ icon, children, className, delay }) {
  return <div style={{ animationDelay: `${delay}s` }} className={`hero-feature-chip absolute flex items-center gap-[1.6cqw] rounded-[3cqw] bg-ivory py-[1.8cqw] pr-[3cqw] pl-[1.8cqw] shadow-[var(--shadow-lift)] ${className}`}>
    <span className="flex size-[7cqw] items-center justify-center rounded-[2cqw] bg-brand text-on-brand"><Icon name={icon} size="60%" strokeWidth={2} /></span>
    <span className="text-[max(11px,2.9cqw)] font-bold whitespace-nowrap text-ink">{children}</span>
  </div>
}

export default function HeroVisual() {
  return <div className="@container relative mx-auto w-full max-w-[34rem]">
    <div className="relative aspect-[1/1.08] w-full">
      <div className="absolute inset-x-[2%] top-[2%] bottom-[4%] overflow-hidden rounded-[6cqw] border border-line-brand shadow-[var(--shadow-lift)]"><Scene /></div>
      {hero.visual.chips.map((chip, index) => (
        <Chip key={chip.text} icon={chip.icon} className={chip.position} delay={index * 1.8}>
          {chip.text}
        </Chip>
      ))}
    </div>
  </div>
}
