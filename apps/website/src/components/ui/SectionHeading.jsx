/*
  Eyebrow, heading and intro used by every section.
  level: 1 for a page's main heading, 2 for sections.
  tone:  'light' on ivory backgrounds, 'dark' on emerald teal backgrounds.
*/
export default function SectionHeading({
  eyebrow,
  showEyebrowLine = true,
  title,
  intro,
  id,
  level = 2,
  tone = 'light',
  align = 'left',
  className = '',
}) {
  const Heading = `h${level}`
  const dark = tone === 'dark'
  const centered = align === 'center'

  return (
    <div className={[centered ? 'mx-auto text-center' : '', 'max-w-3xl', className].join(' ')}>
      {eyebrow ? (
        <p className={`eyebrow mb-4 ${dark ? 'text-coral-light' : 'text-coral-ink'} ${centered ? 'justify-center' : ''}`}>
          {showEyebrowLine ? <span className="h-px w-8 bg-current" aria-hidden="true" /> : null}
          {eyebrow}
        </p>
      ) : null}
      <Heading
        id={id}
        className={[
          level === 1 ? 'text-h1' : 'text-h2',
          'font-bold text-balance',
          dark ? 'text-on-brand' : 'text-ink',
        ].join(' ')}
      >
        {title}
      </Heading>
      {intro ? (
        <p className={`mt-4 max-w-2xl text-lead text-pretty ${dark ? 'text-on-brand-2' : 'text-ink-2'} ${centered ? 'mx-auto' : ''}`}>
          {intro}
        </p>
      ) : null}
    </div>
  )
}
