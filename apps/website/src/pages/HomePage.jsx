import Hero from '../components/sections/Hero.jsx'
import Intro from '../components/sections/Intro.jsx'
import HowItWorks from '../components/sections/HowItWorks.jsx'
import Safety from '../components/sections/Safety.jsx'
import Showcase from '../components/sections/Showcase.jsx'
import Faq from '../components/sections/Faq.jsx'
import ContactBand from '../components/sections/ContactBand.jsx'

export default function HomePage() {
  return <>
    <Hero />
    <Intro />
    <HowItWorks />
    <Safety />
    <Showcase />
    <Faq />
    <ContactBand />
  </>
}
