import { hero } from '../../content/site.js'
import Button from '../ui/Button.jsx'
import HeroVisual from '../illustrations/HeroVisual.jsx'
import WaveTransition from '../ui/WaveTransition.jsx'

// Coral brush underline drawn under the last headline line
function Underline() {
  return (
    <svg
      viewBox="0 0 300 18"
      preserveAspectRatio="none"
      className="absolute -bottom-[0.12em] left-0 h-[0.22em] w-full"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M3 13C70 4 170 2 297 8" stroke="var(--color-coral)" strokeWidth="7" strokeLinecap="round" fill="none" />
    </svg>
  )
}

export default function Hero() {
  const last = hero.headline.length - 1

  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden bg-brand-deep">
      <WaveTransition />
      {/* layered background: faint route grid fading out towards the bottom */}
      <div
        className="bg-route-grid-dark pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
        aria-hidden="true"
      />

      <div className="container-page relative grid items-center gap-10 pt-4 pb-12 sm:pt-6 lg:grid-cols-[1fr_1.02fr] lg:gap-12 lg:pt-8 lg:pb-16 xl:gap-14">
        <div>
          <h1 id="hero-title" className="mt-0 text-display font-extrabold text-on-brand">
            {hero.headline.map((line, index) => (
              <span
                key={line}
                className="enter block"
                style={{ animationDelay: `${120 + index * 120}ms` }}
              >
                {index === last ? (
                  <span className="relative inline-block">
                    {line}
                    <Underline />
                  </span>
                ) : (
                  line
                )}
              </span>
            ))}
          </h1>

          <p className="enter mt-8 max-w-xl text-lead text-pretty text-on-brand-2" style={{ animationDelay: '520ms' }}>
            {hero.text}
          </p>

          <div className="enter mt-10 flex flex-wrap items-center gap-3" style={{ animationDelay: '620ms' }}>
            <Button href={hero.primary.href} icon="arrowRight">
              {hero.primary.label}
            </Button>
            <Button href={hero.secondary.href} variant="outlineLight">
              {hero.secondary.label}
            </Button>
          </div>

          <p className="enter mt-8 flex items-center gap-2.5 text-sm font-semibold text-on-brand-3" style={{ animationDelay: '720ms' }}>
            <span className="relative flex size-2.5" aria-hidden="true">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-coral/60 motion-reduce:animate-none" />
              <span className="relative inline-flex size-2.5 rounded-full bg-coral" />
            </span>
            {hero.note}
          </p>
        </div>

        <div className="enter" style={{ animationDelay: '300ms' }}>
          <HeroVisual />
        </div>
      </div>
    </section>
  )
}
