import { Link } from 'react-router'
import { contact, footer, site } from '../../content/site.js'
import Logo from '../ui/Logo.jsx'
import RouteArt from '../illustrations/RouteArt.jsx'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden bg-brand-deep text-on-brand">
      <RouteArt className="pointer-events-none absolute -bottom-28 -left-48 h-[20rem] w-[40rem] max-w-none opacity-30" />

      <div className="container-page relative grid gap-6 pt-7 pb-6 md:grid-cols-[1fr_2fr] md:gap-8">
        <div className="max-w-sm">
          <Logo tone="dark" className="gap-2 [&>img]:size-8 [&>span]:text-base" />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-on-brand-2">{footer.description}</p>
          {contact.email ? (
            <a href={`mailto:${contact.email}`} className="mt-3 inline-block text-sm font-semibold text-on-brand hover:text-coral-light">
              {contact.email}
            </a>
          ) : null}
        </div>

        <div className="grid grid-cols-3 gap-4 sm:gap-6">
          {footer.columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="font-sans text-[0.6875rem] font-bold tracking-[0.1em] text-on-brand-3 uppercase">
                {column.title}
              </h2>
              <ul className="mt-3 flex flex-col gap-1.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link to={link.href} className="inline-block py-0.5 text-sm leading-snug text-on-brand-2 transition-colors hover:text-on-brand">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="relative border-t border-line-brand">
        <div className="container-page flex flex-col gap-1 py-3.5 text-xs text-on-brand-3 sm:flex-row sm:justify-between">
          <p>
            &copy; {year} {site.name}
          </p>
          <p>{footer.legal}</p>
        </div>
      </div>
    </footer>
  )
}
