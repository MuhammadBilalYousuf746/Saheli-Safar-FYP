import { drivers, ui } from '../../content/site.js'
import SectionHeading from '../ui/SectionHeading.jsx'
import StatusBadge from '../ui/StatusBadge.jsx'
import Button from '../ui/Button.jsx'
import Reveal from '../ui/Reveal.jsx'
import PhoneFrame from '../ui/PhoneFrame.jsx'
import DriverAppPreview from '../showcases/DriverAppPreview.jsx'
import Minibus from '../illustrations/Minibus.jsx'
import Icon from '../ui/Icon.jsx'
import DriverUncle from '../illustrations/DriverUncle.jsx'

// Teal visual panel: road, minibus and the driver onboarding screen
function DriverVisual() {
  return (
    <div className="driver-mockup-scene">
    <div className="driver-mockup-panel relative mx-auto w-full max-w-[26rem] overflow-hidden rounded-[var(--radius-panel)] bg-brand px-5 pt-6 sm:px-6">
      <div className="bg-route-grid-dark absolute inset-0" aria-hidden="true" />
      <div className="driver-mockup-glow" aria-hidden="true" />
      <svg viewBox="0 0 600 200" className="absolute inset-x-0 bottom-0 w-full" aria-hidden="true" focusable="false">
        <rect y="120" width="600" height="80" fill="var(--color-brand-deep)" />
        <path d="M0 160H600" stroke="var(--color-ivory)" strokeOpacity="0.3" strokeWidth="3" strokeDasharray="22 18" />
        <Minibus x={360} y={60} scale={1.1} />
      </svg>
      <div className="driver-mockup-device relative mx-auto w-[58%] max-w-[13rem] pb-[18%]">
        <PhoneFrame className="driver-device-frame" label="Faithful reproduction of Sky Drive identity and licence registration; empty fields">
          <DriverAppPreview />
        </PhoneFrame>
      </div>
      <div className="driver-mockup-tag"><span><Icon name="steering" size={19} /></span><div><strong>Driver workspace</strong><small>Identity &amp; licence</small></div></div>
    </div>
    <DriverUncle className="driver-uncle-mascot" />
    </div>
  )
}

// Split layout, mirrored compared to the passenger section
export default function DriverExperience({ showLink = false, headingLevel = 2 }) {
  return (
    <section aria-labelledby="drivers-title" className={`${headingLevel === 1 ? 'page-section' : 'section'} bg-ivory-2`}>
      <div className="container-page grid items-start gap-8 lg:grid-cols-[1fr_1fr] lg:gap-10">
        <Reveal className="order-2 lg:order-1">
          <DriverVisual />
          <p className="mt-3 text-center text-xs text-ink-3">{ui.illustrative}</p>
        </Reveal>

        <div className="order-1 lg:order-2">
          <Reveal>
            <StatusBadge status={drivers.status} className="mb-4" />
            <SectionHeading level={headingLevel} id="drivers-title" eyebrow={drivers.eyebrow} title={drivers.title.endsWith('forward.') ? <>{drivers.title.slice(0, -8)}<span className="inline-block bg-[#DCC5EE] px-[0.12em] pb-[0.05em] text-[#352641]">forward.</span></> : drivers.title} intro={drivers.intro} />
          </Reveal>

          <ol className="mt-6 flex flex-col">
            {drivers.steps.map((step, index) => (
              <Reveal
                as="li"
                key={step.title}
                delay={index * 70}
                className="grid grid-cols-[2.5rem_1fr] gap-4 border-t border-ink/15 py-3 last:border-b"
              >
                <span className="font-display text-sm font-bold text-coral-ink" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <p className="text-ink-2">
                  <span className="font-bold text-ink">{step.title}.</span> {step.text}
                </p>
              </Reveal>
            ))}
          </ol>

          <Reveal className="mt-6">
            <p className="text-sm text-ink-3">{drivers.note}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href={drivers.cta.href} variant="dark" icon="arrowRight">
                {drivers.cta.label}
              </Button>
              {showLink ? (
                <Button href={drivers.more.href} variant="outline">
                  {drivers.more.label}
                </Button>
              ) : null}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
