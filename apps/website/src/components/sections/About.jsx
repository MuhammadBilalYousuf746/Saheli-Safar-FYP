import { about, karachi } from '../../content/site.js'
import Button from '../ui/Button.jsx'
import Reveal from '../ui/Reveal.jsx'
import Icon from '../ui/Icon.jsx'

export default function About({ showLink = false, headingLevel = 2 }) {
  const Heading = `h${headingLevel}`
  return <section aria-labelledby="about-title" className={`about-minimal ${headingLevel === 1 ? 'page-section' : 'section'}`}>
    <div className="container-page">
      <div className="about-minimal-inner">
        <div className="about-minimal-grid">
          <div>
            <Reveal><p className="eyebrow text-coral-ink">{about.eyebrow}</p><Heading id="about-title" className="about-minimal-title">{about.title}</Heading></Reveal>
            <Reveal delay={80} className="about-minimal-copy">{about.body.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</Reveal>
            <Reveal delay={140}>
              <svg viewBox="0 0 360 70" className="about-route-art" aria-hidden="true" focusable="false"><path className="about-route-line" d="M12 50C90 50 90 20 174 20S270 50 348 25" /><circle cx="12" cy="50" r="5" /><circle cx="174" cy="20" r="5" /><circle cx="348" cy="25" r="5" /></svg>
              {showLink ? <Button href={about.cta.href} variant="outline" icon="arrowRight">{about.cta.label}</Button> : null}
            </Reveal>
          </div>
          <ul className="about-minimal-values">{about.values.map((value, index) => <Reveal as="li" key={value.title} delay={100 + index * 100} className="about-minimal-value">
            <span className="about-minimal-icon" aria-hidden="true"><Icon name={['heart', 'clock', 'users'][index]} size={19} /></span>
            <div><h3>{value.title}</h3><p>{value.text}</p></div>
          </Reveal>)}</ul>
        </div>
        <Reveal delay={180} className="about-city-note"><span className="about-city-pin" aria-hidden="true"><Icon name="mapPin" size={20} /></span><div><h2>{karachi.title}</h2><p>Routes and service areas will be shared once confirmed. Saheli Safar is still in development.</p></div><span className="about-development-badge">In development</span></Reveal>
      </div>
    </div>
  </section>
}
