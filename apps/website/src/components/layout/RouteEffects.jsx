import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'
import { pages } from '../../routes.js'

const byPath = Object.fromEntries(
  Object.values(pages)
    .filter((page) => page.path)
    .map((page) => [page.path, page]),
)

/*
  Runs on every navigation:
  - sets the browser tab title and meta description from content/site.js
  - scrolls to a #section when the link has one, otherwise to the top of the page
  - moves keyboard and screen reader focus to the main content (not on first load)
*/
export default function RouteEffects({ mainRef }) {
  const { pathname, hash } = useLocation()
  const firstLoad = useRef(true)

  useEffect(() => {
    const page = byPath[pathname] ?? pages.notFound
    document.title = page.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', page.description)
  }, [pathname])

  useEffect(() => {
    const isFirst = firstLoad.current
    firstLoad.current = false

    if (hash) {
      // wait one frame so the target section has rendered
      const frame = requestAnimationFrame(() => {
        const target = document.getElementById(decodeURIComponent(hash.slice(1)))
        if (!target) return
        target.scrollIntoView({ behavior: isFirst ? 'instant' : 'smooth', block: 'start' })
        target.setAttribute('tabindex', '-1')
        target.focus({ preventScroll: true })
      })
      return () => cancelAnimationFrame(frame)
    }

    if (isFirst) return undefined

    // "instant" overrides the smooth scrolling set in CSS, so a new page starts at the top
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    mainRef.current?.focus({ preventScroll: true })
    return undefined
  }, [pathname, hash, mainRef])

  return null
}
