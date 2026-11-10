import { ui } from '../../content/site.js'

// Honest status label: Available now, In development or Next stage.
const STYLES = {
  light: {
    live: 'bg-live/10 text-live',
    building: 'bg-soon/10 text-soon',
    next: 'bg-ink/[0.06] text-ink-3',
  },
  dark: {
    live: 'bg-[#D9BDEF]/15 text-[#DED1E8]',
    building: 'bg-[#F4BC68]/15 text-[#FFD597]',
    next: 'bg-on-brand/10 text-on-brand-2',
  },
}

export default function StatusBadge({ status, tone = 'light', className = '' }) {
  const label = ui.status[status]
  if (!label) return null

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap',
        STYLES[tone][status],
        className,
      ].join(' ')}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {label}
    </span>
  )
}
