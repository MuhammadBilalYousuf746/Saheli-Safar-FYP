import { useRef } from 'react'
import { Outlet } from 'react-router'
import { ui } from '../../content/site.js'
import Header from '../sections/Header.jsx'
import Footer from '../sections/Footer.jsx'
import RouteEffects from './RouteEffects.jsx'

// Shared frame for every page: skip link, header, page content, footer.
export default function Layout() {
  const mainRef = useRef(null)

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-full focus:bg-coral focus:px-5 focus:py-2.5 focus:font-bold focus:text-brand-deep"
      >
        {ui.skipLink}
      </a>
      <RouteEffects mainRef={mainRef} />
      <Header />
      <main id="main" ref={mainRef} tabIndex={-1} className="flex-1 outline-none">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
