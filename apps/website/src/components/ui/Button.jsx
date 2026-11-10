import { Link } from 'react-router'
import Icon from './Icon.jsx'

const VARIANTS = {
  // Amber distinguishes primary actions from plum and lavender surfaces
  primary:
    'bg-coral text-brand-deep shadow-[0_10px_24px_-12px_rgb(244_188_104/0.9)] hover:bg-coral-hover hover:-translate-y-0.5',
  dark: 'bg-coral text-brand-deep hover:bg-coral-hover hover:-translate-y-0.5',
  outline: 'border border-ink/20 text-ink hover:border-ink hover:bg-ink/[0.04]',
  outlineLight: 'border border-on-brand/30 text-on-brand hover:border-on-brand hover:bg-on-brand/10',
}

const SIZES = {
  md: 'min-h-12 px-6 text-[0.9375rem]',
  sm: 'min-h-11 px-5 text-sm',
}

/*
  Internal paths ("/about", "/#introduction") use the router.
  Pass `as="button"` for form buttons.
*/
export default function Button({
  href,
  as,
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  ...rest
}) {
  const classes = [
    'group inline-flex max-w-full items-center justify-center gap-2 rounded-full py-2 text-center font-bold sm:whitespace-nowrap',
    'transition-[transform,background-color,border-color,color] duration-300 ease-[var(--ease-calm)]',
    'disabled:pointer-events-none disabled:opacity-50',
    VARIANTS[variant],
    SIZES[size],
    className,
  ].join(' ')

  const content = (
    <>
      <span>{children}</span>
      {icon ? (
        <Icon
          name={icon}
          size={18}
          strokeWidth={2}
          className="transition-transform duration-300 group-hover:translate-x-0.5"
        />
      ) : null}
    </>
  )

  if (as === 'button') {
    return (
      <button className={classes} {...rest}>
        {content}
      </button>
    )
  }

  if (href?.startsWith('/')) {
    return (
      <Link to={href} className={classes} {...rest}>
        {content}
      </Link>
    )
  }

  return (
    <a href={href} className={classes} {...rest}>
      {content}
    </a>
  )
}
