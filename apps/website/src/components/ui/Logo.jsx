// TODO: replace src/assets/logo-mark.svg with the original Saheli Safar logo.
// The component does not need to change.
import { Link } from 'react-router'
import logoMark from '../../assets/logo-withoutbg-text.png'
import { site } from '../../content/site.js'

export default function Logo({ tone = 'light', className = '' }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 ${className}`}>
      <img src={logoMark} alt="" width="38" height="38" className="size-[2.375rem] rounded-[11px]" />
      <span
        className={`font-display text-[1.125rem] font-bold tracking-tight whitespace-nowrap ${
          tone === 'dark' ? 'text-on-brand' : 'text-ink'
        }`}
      >
        {site.name}
      </span>
    </Link>
  )
}
