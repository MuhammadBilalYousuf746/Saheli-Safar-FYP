import { intro } from '../../content/site.js'
import Reveal from '../ui/Reveal.jsx'

// Short editorial introduction before the scroll-driven journey.
export default function Intro() {
  return (
    <section id={intro.id} aria-labelledby="intro-title" className="section bg-ivory-2">
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
          <Reveal>
            <p className="eyebrow mb-5 text-coral-ink">
              <span className="h-px w-8 bg-current" aria-hidden="true" />
              {intro.eyebrow}
            </p>
            <h2 id="intro-title" className="text-h2 font-bold text-balance text-ink">
              {intro.title}
            </h2>
          </Reveal>

          <Reveal delay={120} className="flex flex-col gap-5 lg:pt-4">
            {intro.body.map((paragraph) => (
              <p key={paragraph} className="text-lead text-pretty text-ink-2">
                {paragraph}
              </p>
            ))}
          </Reveal>
        </div>


      </div>
    </section>
  )
}
