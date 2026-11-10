import { useEffect, useRef, useState } from 'react'
import { howItWorks } from '../../content/site.js'
import SectionHeading from '../ui/SectionHeading.jsx'
import StatusBadge from '../ui/StatusBadge.jsx'
import Icon from '../ui/Icon.jsx'
import Button from '../ui/Button.jsx'
import Reveal from '../ui/Reveal.jsx'
import './HowItWorks.css'

export default function HowItWorks({ link, showHeading = true }) {
  const { steps } = howItWorks
  const StepHeading = showHeading ? 'h3' : 'h2'
  const liveCount = steps.filter(step => step.status === 'live').length
  const timelineRef = useRef(null)
  const [activeStep, setActiveStep] = useState(null)

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let timer
    let visible = false
    const stop = () => { clearInterval(timer); timer = undefined }
    const sync = () => {
      stop()
      setActiveStep(null)
      if (!visible || motion.matches) return
      setActiveStep(0)
      timer = setInterval(() => setActiveStep(current => current >= steps.length ? 0 : current + 1), 1800)
    }
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      sync()
    }, { threshold: .15 })
    if (observer && timelineRef.current) observer.observe(timelineRef.current)
    else { visible = true; sync() }
    motion.addEventListener('change', sync)
    return () => { stop(); observer?.disconnect(); motion.removeEventListener('change', sync) }
  }, [steps.length])

  return <section id={howItWorks.id} aria-labelledby={showHeading ? 'how-title' : undefined} aria-label={showHeading ? undefined : howItWorks.eyebrow} className={`process-section ${showHeading ? 'section' : 'section pt-0!'}`}>
    <div className="process-stage container-page">
      <div className={showHeading ? 'flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between' : 'hidden'}>
        <Reveal><SectionHeading id="how-title" eyebrow={howItWorks.eyebrow} title={howItWorks.title} intro={howItWorks.intro} /></Reveal>
        {link ? <Reveal delay={100} className="shrink-0"><Button href={link.href} variant="outline" icon="arrowRight">{link.label}</Button></Reveal> : null}
      </div>
      <div ref={timelineRef} className={`process-timeline ${showHeading ? 'relative mt-10 lg:mt-12' : 'relative mt-4'}`}>
        <p className="sr-only">Illustrative process animation. Feature availability is shown by each step's status label.</p>
        <div className="absolute top-7 right-[12.5%] left-[12.5%] hidden h-[3px] lg:block" aria-hidden="true">
          <div className="absolute inset-y-0 left-0 rounded-full bg-brand" style={{ width: `${(liveCount - 1) / (steps.length - 1) * 100}%` }} />
          <div className="absolute inset-y-0 right-0 bg-[repeating-linear-gradient(90deg,var(--color-ink-3)_0_8px,transparent_8px_16px)] opacity-50" style={{ left: `${(liveCount - 1) / (steps.length - 1) * 100}%` }} />
          <span className="process-progress absolute inset-y-0 left-0 rounded-full bg-coral" style={{ width: activeStep === null ? '0%' : `${Math.min(activeStep, steps.length - 1) / (steps.length - 1) * 100}%` }} />
        </div>
        <ol className="relative grid gap-0 lg:grid-cols-4 lg:gap-8">
          {steps.map((step, index) => {
            const live = step.status === 'live'
            return <li key={step.title} data-process-state={activeStep === null ? 'idle' : activeStep === index ? 'current' : activeStep > index ? 'passed' : 'waiting'} className="relative grid grid-cols-[3.5rem_1fr] gap-x-5 pb-10 lg:block lg:pb-0 lg:text-center">
              {index < steps.length - 1 ? <span className={`process-connector absolute top-14 bottom-0 left-7 w-[3px] -translate-x-1/2 lg:hidden ${live && steps[index + 1].status === 'live' ? 'bg-brand' : 'bg-[repeating-linear-gradient(180deg,var(--color-ink-3)_0_8px,transparent_8px_16px)] opacity-50'}`} aria-hidden="true"><span className="process-mobile-progress" style={{ transform: activeStep !== null && activeStep > index ? 'scaleY(1)' : 'scaleY(0)' }} /></span> : null}
              <span className={`process-step-marker relative z-10 flex size-14 items-center justify-center rounded-full font-display text-lg font-bold lg:mx-auto ${live ? 'bg-brand text-on-brand shadow-[0_0_0_8px_var(--color-ivory)]' : 'border-2 border-dashed border-ink/30 bg-ivory text-ink-3 shadow-[0_0_0_8px_var(--color-ivory)]'}`} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <div className="process-step-content pt-2 lg:mt-8 lg:pt-0">
                <span className={`inline-flex ${live ? 'text-brand' : 'text-ink-3'}`}><Icon name={step.icon} size={26} /></span>
                <StepHeading className="mt-3 text-h3 font-bold text-ink"><span className="sr-only">Step {index + 1}: </span>{step.title}</StepHeading>
                <p className="mx-auto mt-2 max-w-xs text-pretty text-ink-2">{step.text}</p>
                <StatusBadge status={step.status} className="mt-4" />
              </div>
            </li>
          })}
        </ol>
      </div>
    </div>
  </section>
}
