import { useEffect, useId, useRef, useState } from 'react'
import PhoneFrame from '../ui/PhoneFrame.jsx'
import { EmergencyScreen, OtpScreen, VerificationScreen } from './PassengerAppScreens.jsx'

const previews = [
  { title: 'Email verification', icon: 'mail', Screen: OtpScreen, description: 'Passenger email verification; no code entered' },
  { title: 'Identity review', icon: 'shield', Screen: VerificationScreen, description: 'Passenger identity verification; no documents selected' },
  { title: 'Emergency contact', icon: 'heart', Screen: EmergencyScreen, description: 'Passenger emergency contact editor; empty fields' },
]

export default function PassengerAppShowcase() {
  const [selected, setSelected] = useState(1)
  const id = useId()
  const containerRef = useRef(null)
  const [paused, setPaused] = useState(false)
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let visible = typeof IntersectionObserver === 'undefined'
    let timer
    const sync = () => {
      clearInterval(timer)
      if (!visible || paused || focused || motion.matches || document.hidden) return
      timer = setInterval(() => setSelected(current => (current + 1) % previews.length), 5000)
    }
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync() }, { threshold: .25 })
    if (observer && containerRef.current) observer.observe(containerRef.current)
    motion.addEventListener('change', sync)
    document.addEventListener('visibilitychange', sync)
    sync()
    return () => { clearInterval(timer); observer?.disconnect(); motion.removeEventListener('change', sync); document.removeEventListener('visibilitychange', sync) }
  }, [paused, focused])
  const active = previews[selected]
  const left = previews[(selected + 2) % previews.length]
  const right = previews[(selected + 1) % previews.length]
  return <div className="passenger-showcase" ref={containerRef} onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false) }}>
    <div className="passenger-showcase-stage" id={`${id}-preview`} role="region" aria-label={`${active.title} app preview`}>
      <div className="passenger-showcase-halo" aria-hidden="true" />
      <div className="passenger-showcase-orbit" aria-hidden="true" />
      <div className="passenger-preview-side passenger-preview-left" aria-hidden="true"><PhoneFrame><left.Screen /></PhoneFrame></div>
      <div className="passenger-preview-side passenger-preview-right" aria-hidden="true"><PhoneFrame><right.Screen /></PhoneFrame></div>
      <div key={selected} className="passenger-preview-front"><PhoneFrame label={`Faithful reproduction of ${active.description}`}><active.Screen /></PhoneFrame></div>
      <div className="passenger-preview-label"><span />{active.title}</div>
    </div>
    <button type="button" className="sr-only focus:not-sr-only focus:relative focus:mt-3 focus:rounded-lg focus:bg-brand focus:px-3 focus:py-2 focus:text-on-brand" onClick={() => setPaused(value => !value)}>{paused ? 'Resume automatic previews' : 'Pause automatic previews'}</button>
  </div>
}
