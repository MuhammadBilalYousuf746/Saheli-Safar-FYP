import { pages } from '../content/site.js'
import SectionHeading from '../components/ui/SectionHeading.jsx'
import Button from '../components/ui/Button.jsx'

export default function NotFoundPage() {
  const { eyebrow, heading, text, cta } = pages.notFound

  return (
    <section aria-labelledby="not-found-title" className="section">
      <div className="container-page">
        <SectionHeading level={1} id="not-found-title" eyebrow={eyebrow} title={heading} intro={text} />
        <Button href="/" icon="arrowRight" className="mt-10">
          {cta}
        </Button>
      </div>
    </section>
  )
}
