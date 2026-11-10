import { safety } from '../../content/site.js'
import SectionHeading from '../ui/SectionHeading.jsx'
import Icon from '../ui/Icon.jsx'
import Button from '../ui/Button.jsx'
import Reveal from '../ui/Reveal.jsx'
import RouteArt from '../illustrations/RouteArt.jsx'

// Layered verification motif: rings, a shield and the three review layers
function TrustArt() {
  const layers = ['Email', 'Identity', 'Review']
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[22rem]" aria-hidden="true">
      <svg viewBox="0 0 320 320" className="absolute inset-0 size-full">
        <circle cx="160" cy="160" r="150" fill="none" stroke="var(--color-ivory)" strokeOpacity="0.08" strokeWidth="2" />
        <circle cx="160" cy="160" r="112" fill="none" stroke="var(--color-ivory)" strokeOpacity="0.12" strokeWidth="2" strokeDasharray="4 10" />
        <circle cx="160" cy="160" r="74" fill="var(--color-brand-soft)" />
        <path d="M160 112 124 126v28c0 22 15 39 36 46 21-7 36-24 36-46v-28z" fill="var(--color-ivory)" />
        <path d="m145 158 10 10 21-22" stroke="var(--color-coral)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      {layers.map((label, index) => (
        <span
          key={label}
          className={[
            'absolute rounded-full bg-on-brand px-3 py-1.5 text-xs font-bold text-brand shadow-[var(--shadow-soft)]',
            ['top-[6%] left-[8%]', 'top-[40%] -right-[2%]', 'bottom-[8%] left-[14%]'][index],
          ].join(' ')}
        >
          {label}
        </span>
      ))}
    </div>
  )
}

// Full-width deep teal section
export default function Safety({ showLink = false }) {
  return (
    <section id={safety.id} aria-labelledby="safety-title" className="section relative overflow-hidden bg-brand text-on-brand">
      <div className="bg-route-grid-dark pointer-events-none absolute inset-0" aria-hidden="true" />
      <RouteArt className="pointer-events-none absolute -bottom-24 -left-40 hidden lg:block h-[24rem] w-[50rem] max-w-none opacity-60" />

      <div className="container-page relative grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <SectionHeading tone="dark" id="safety-title" eyebrow={safety.eyebrow} title={safety.title} intro={safety.intro} />
          </Reveal>
          <Reveal delay={150} className="mt-8 hidden lg:block">
            <TrustArt />
          </Reveal>
        </div>

        <div>
          <ol className="divide-y divide-line-brand border-y border-line-brand">
            {safety.items.map((item, index) => (
              <Reveal as="li" key={item.title} delay={index * 80} className="grid grid-cols-[auto_1fr] gap-5 py-7 sm:gap-7">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-coral-light">
                  <Icon name={item.icon} size={24} />
                </span>
                <div>
                  <h3 className="text-h3 font-bold text-on-brand">{item.title}</h3>
                  <p className="mt-2 text-pretty text-on-brand-2">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </ol>

          <Reveal className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex max-w-md items-start gap-2.5 text-sm text-on-brand-3">
              <Icon name="info" size={18} className="mt-0.5 shrink-0" />
              {safety.note}
            </p>
            {showLink ? (
              <Button href={safety.cta.href} variant="outlineLight" icon="arrowRight" className="shrink-0">
                {safety.cta.label}
              </Button>
            ) : null}
          </Reveal>
        </div>
      </div>
    </section>
  )
}
