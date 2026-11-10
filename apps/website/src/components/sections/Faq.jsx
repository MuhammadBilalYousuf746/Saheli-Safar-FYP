import { useId, useState } from 'react'
import { Link } from 'react-router'
import { faqs } from '../../content/site.js'
import SectionHeading from '../ui/SectionHeading.jsx'
import Icon from '../ui/Icon.jsx'
import Button from '../ui/Button.jsx'
import Reveal from '../ui/Reveal.jsx'

function Item({ item, open, onToggle, headingLevel }) {
  const Heading = `h${headingLevel}`
  const id = useId()
  const buttonId = `${id}-button`
  const panelId = `${id}-panel`

  return (
    <li className="border-b border-ink/15">
      <Heading className="font-sans">
        <button
          id={buttonId}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-6 py-6 text-left text-[1.0625rem] font-bold text-ink transition-colors hover:text-brand-soft sm:text-lg"
        >
          {item.q}
          <span
            className={`flex size-9 shrink-0 items-center justify-center rounded-full border transition-[transform,background-color,border-color] duration-300 ${
              open ? 'rotate-180 border-brand bg-brand text-on-brand' : 'border-ink/20 text-ink'
            }`}
          >
            <Icon name="chevronDown" size={18} strokeWidth={2.25} />
          </span>
        </button>
      </Heading>
      {/* grid-rows animation gives a smooth height transition without measuring.
          `inert` removes the closed answer from keyboard focus and screen readers. */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        inert={!open}
        className={`grid transition-[grid-template-rows] duration-400 ease-[var(--ease-calm)] ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <p className="max-w-2xl pb-7 text-pretty text-ink-2">{item.a}</p>
        </div>
      </div>
    </li>
  )
}

/*
  Accessible accordion. `limit` shows the first N questions (home page);
  `pick` shows only the listed question numbers (inner pages).
*/
export default function Faq({ limit, pick, title, showHeading = true, showMore = false }) {
  const [openIndex, setOpenIndex] = useState(0)

  let items = faqs.items
  if (pick) items = pick.map((index) => faqs.items[index]).filter(Boolean)
  if (limit) items = items.slice(0, limit)

  return (
    <section id="faqs" aria-labelledby={showHeading ? 'faq-title' : undefined} aria-label={showHeading ? undefined : 'Questions'} className="section bg-ivory-2">
      <div className={`container-page grid gap-8 ${showHeading ? 'lg:grid-cols-[0.8fr_1.2fr] lg:gap-12' : ''}`}>
        {showHeading ? (
          <Reveal className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading id="faq-title" eyebrow={faqs.eyebrow} title={title ?? faqs.title} />
            <p className="mt-6 text-ink-2">
              {faqs.contactPrompt}{' '}
              <Link to={faqs.contactLink.href} className="font-bold text-coral-ink underline-offset-4 hover:underline">
                {faqs.contactLink.label}
              </Link>
            </p>
          </Reveal>
        ) : null}

        <Reveal delay={100} className={showHeading ? '' : 'mx-auto w-full max-w-4xl'}>
          <ul className="border-t border-ink/15">
            {items.map((item, index) => (
              <Item
                key={item.q}
                item={item}
                open={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
                headingLevel={showHeading ? 3 : 2}
              />
            ))}
          </ul>
          {showMore ? (
            <Button href={faqs.more.href} variant="outline" icon="arrowRight" className="mt-10">
              {faqs.more.label}
            </Button>
          ) : null}
        </Reveal>
      </div>
    </section>
  )
}
