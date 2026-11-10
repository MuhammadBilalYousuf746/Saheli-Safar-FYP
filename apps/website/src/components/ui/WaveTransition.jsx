import { useId } from 'react'

export default function WaveTransition({ from = 'var(--color-ivory)', middle = 'var(--color-ivory-3)', to = 'var(--color-brand-soft)', className = 'relative block h-14 w-full sm:h-20' }) {
  const id = useId().replace(/:/g, '')
  return <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className={className} aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={from} stopOpacity=".5" />
            <stop offset="1" stopColor={to} stopOpacity=".1" />
          </linearGradient>
        </defs>
        <path d="M0 0H1440V70C1140 10 990 118 720 93S260 34 0 110Z" fill={`url(#${id})`} />
        <path d="M0 0H1440V43C1170 2 1000 100 720 66S260 20 0 83Z" fill={middle} fillOpacity=".35" />
        <path d="M0 0H1440V20C1150 0 1000 72 720 42S250 4 0 56Z" fill={from} />
      </svg>
}
