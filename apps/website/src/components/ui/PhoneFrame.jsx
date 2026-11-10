/*
  Device frame for app previews.

  - Pass `image` (an imported screenshot) to show a real app screenshot.
  - Otherwise pass a static source-referenced reproduction (see components/showcases).

  The frame is a size container, so screen contents scale with its width (cqw units).
  Reproductions are labelled honestly and contain no executable app or private data.
  Never use screenshots that show real names, CNIC images, numbers or selfies.
*/
export default function PhoneFrame({ image, alt = '', label, className = '', children }) {
  return (
    <figure className={`@container ${className}`}>
      <div
        className="relative aspect-[9/19] w-full rounded-[13cqw] bg-brand-deep p-[3.2cqw] shadow-[var(--shadow-phone)]"
        role={label ? 'img' : undefined}
        aria-label={label}
      >
        <div className="relative h-full w-full overflow-hidden rounded-[10cqw] bg-ivory">
          {/* camera notch */}
          <div
            className="absolute top-[2.4cqw] left-1/2 z-10 h-[5.5cqw] w-[26cqw] -translate-x-1/2 rounded-full bg-brand-deep"
            aria-hidden="true"
          />
          {image ? (
            <img src={image} alt={alt} loading="lazy" className="h-full w-full object-cover object-top" />
          ) : (
            <div className="h-full w-full text-[4.1cqw]" aria-hidden="true">
              {children}
            </div>
          )}
        </div>
      </div>
    </figure>
  )
}
