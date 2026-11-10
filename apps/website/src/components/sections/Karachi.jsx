import { karachi } from '../../content/site.js'
import SectionHeading from '../ui/SectionHeading.jsx'
import Icon from '../ui/Icon.jsx'
import Reveal from '../ui/Reveal.jsx'
import KarachiMap from '../illustrations/KarachiMap.jsx'

const ICONS = ['mapPin', 'clock', 'info']

// Map-led section: framed abstract map with the copy alongside
export default function Karachi() {
  return (
    <section aria-labelledby="karachi-title" className="section">
      <div className="container-page grid items-center gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-12">
        <Reveal>
          <figure>
            <div className="overflow-hidden rounded-[var(--radius-panel)] border border-line bg-ivory-2 p-2 shadow-[var(--shadow-soft)] sm:p-3">
              <KarachiMap className="h-auto w-full rounded-[1.5rem]" />
            </div>
            <figcaption className="mt-3 flex items-center gap-2 text-xs text-ink-3">
              <Icon name="info" size={14} />
              {karachi.mapNote}
            </figcaption>
          </figure>
        </Reveal>

        <div>
          <Reveal>
            <SectionHeading id="karachi-title" eyebrow={karachi.eyebrow} title={karachi.title} intro={karachi.intro} />
          </Reveal>
          <ul className="mt-8 flex flex-col gap-5">
            {karachi.points.map((point, index) => (
              <Reveal as="li" key={point.title} delay={index * 90} className="flex gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-mist text-brand">
                  <Icon name={ICONS[index]} size={22} />
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold text-ink">{point.title}</h3>
                  <p className="mt-1 text-pretty text-ink-2">{point.text}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
