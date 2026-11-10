import { passengers, ui } from '../../content/site.js'
import SectionHeading from '../ui/SectionHeading.jsx'
import Icon from '../ui/Icon.jsx'
import Button from '../ui/Button.jsx'
import Reveal from '../ui/Reveal.jsx'
import PassengerAppShowcase from '../showcases/PassengerAppShowcase.jsx'

export default function PassengerExperience({ showLink = false, headingLevel = 2 }) {
  return (
    <section aria-labelledby="passengers-title" className={`${headingLevel === 1 ? 'page-section' : 'section'} overflow-hidden`}>
      <div className="container-page grid items-start gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
        <div>
          <Reveal>
            <SectionHeading showEyebrowLine={false} level={headingLevel} id="passengers-title" eyebrow={passengers.eyebrow} title={passengers.title} intro={passengers.intro} />
          </Reveal>

          <Reveal as="ul" delay={100} className="mt-8 flex flex-col gap-4">
            {passengers.live.map((item) => (
              <li key={item} className="passenger-benefit flex items-start gap-3.5 text-[1.0625rem] font-semibold text-ink">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-brand text-on-brand">
                  <Icon name="check" size={14} strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </Reveal>

          <Reveal delay={160} className="mt-8 flex items-start gap-3 rounded-2xl border border-dashed border-ink/20 p-4 text-ink-2">
            <Icon name="clock" size={20} className="mt-0.5 shrink-0 text-ink-3" />
            <p>{passengers.next}</p>
          </Reveal>

          {showLink ? (
            <Reveal delay={200} className="mt-10">
              <Button href={passengers.cta.href} variant="dark" icon="arrowRight">
                {passengers.cta.label}
              </Button>
            </Reveal>
          ) : null}
        </div>

        <Reveal delay={120}>
          <PassengerAppShowcase />
          <p className="mt-2 text-center text-xs text-ink-3">{ui.illustrative}</p>
        </Reveal>
      </div>
    </section>
  )
}
