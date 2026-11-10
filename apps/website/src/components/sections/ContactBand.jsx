import { contact } from '../../content/site.js'
import Button from '../ui/Button.jsx'
import Reveal from '../ui/Reveal.jsx'
import RouteArt from '../illustrations/RouteArt.jsx'

// Closing call to action used at the end of most pages
export default function ContactBand() {
  const { band } = contact
  return (
    <section aria-labelledby="band-title" className="section-tight">
      <div className="container-page">
        <Reveal className="relative overflow-hidden rounded-[var(--radius-panel)] bg-brand px-6 py-10 sm:px-10 sm:py-12 lg:px-12">
          <RouteArt className="pointer-events-none absolute -right-24 -bottom-10 hidden lg:block h-[18rem] w-[38rem] max-w-none opacity-80" />
          <div className="relative flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <h2 id="band-title" className="text-h2 font-bold text-balance text-on-brand">
                {band.title}
              </h2>
              <p className="mt-4 text-lead text-on-brand-2">{band.text}</p>
            </div>
            <Button href={band.cta.href} icon="arrowRight" className="shrink-0">
              {band.cta.label}
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
