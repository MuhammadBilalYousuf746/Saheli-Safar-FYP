import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router'
import { nav, ui } from '../../content/site.js'
import Logo from '../ui/Logo.jsx'
import Icon from '../ui/Icon.jsx'

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const toggleRef = useRef(null)
  const firstLinkRef = useRef(null)
  const { pathname } = useLocation()

  // Close the mobile menu whenever the page changes
  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Mobile menu: lock page scroll, focus first link, Escape closes, closes at desktop width
  useEffect(() => {
    if (!open) return undefined

    document.body.style.overflow = 'hidden'
    firstLinkRef.current?.focus()

    const onKey = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    const desktop = window.matchMedia('(min-width: 1280px)')
    const onResize = () => desktop.matches && setOpen(false)

    document.addEventListener('keydown', onKey)
    desktop.addEventListener('change', onResize)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
      desktop.removeEventListener('change', onResize)
    }
  }, [open])

  const desktopLink = ({ isActive }) =>
    [
      'relative rounded-full px-3 py-2 text-[0.9375rem] font-semibold transition-colors duration-200',
      isActive ? 'text-ink' : 'text-ink-2 hover:text-ink',
      // active underline
      "after:absolute after:inset-x-3 after:-bottom-0.5 after:h-[2px] after:rounded-full after:bg-coral after:transition-transform after:duration-300 after:content-['']",
      isActive ? 'after:scale-x-100' : 'after:scale-x-0',
    ].join(' ')

  const mobileLink = ({ isActive }) =>
    [
      'flex items-center justify-between border-b border-line py-4 font-display text-2xl font-semibold',
      isActive ? 'text-coral-ink' : 'text-ink',
    ].join(' ')

  return (
    <header
      className={[
        'sticky top-0 z-50 transition-[background-color,box-shadow] duration-300',
        scrolled || open
          ? 'bg-ivory/90 shadow-[0_1px_0_var(--color-line),0_12px_30px_-20px_rgb(53_38_65/0.3)] backdrop-blur-lg'
          : 'bg-ivory',
      ].join(' ')}
    >
      <div className="container-page flex h-[4.5rem] items-center justify-between gap-6">
        <Logo />

        <nav aria-label="Main" className="hidden xl:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => (
              <li key={item.href}>
                <NavLink to={item.href} end={item.href === '/'} className={desktopLink}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2 xl:hidden">
          <button
            ref={toggleRef}
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:bg-ink/5 xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? ui.menuClose : ui.menuOpen}
            onClick={() => setOpen((value) => !value)}
          >
            <Icon name={open ? 'close' : 'menu'} size={22} strokeWidth={2} />
          </button>
        </div>
      </div>

      <nav
        id="mobile-menu"
        aria-label="Mobile"
        hidden={!open}
        className="h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-line bg-ivory xl:hidden"
      >
        <div className="container-page flex min-h-full flex-col pt-4 pb-10">
          <ul>
            {nav.map((item, index) => (
              <li key={item.href}>
                <NavLink
                  ref={index === 0 ? firstLinkRef : undefined}
                  to={item.href}
                  end={item.href === '/'}
                  onClick={() => setOpen(false)}
                  className={mobileLink}
                >
                  {item.label}
                  <Icon name="arrowRight" size={20} strokeWidth={2} className="text-ink-3" />
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  )
}
