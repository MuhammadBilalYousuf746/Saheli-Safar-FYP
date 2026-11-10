import KarachiMap from './KarachiMap.jsx'

// A schematic city backdrop; pin positions are illustrative, not service stops.
const landmarks = [
  { name: 'Mazar-e-Quaid', x: 302, y: 215 },
  { name: 'Frere Hall', x: 245, y: 310 },
  { name: 'Teen Talwar', x: 195, y: 365 },
  { name: 'Clifton', x: 150, y: 415 },
]

export default function AboutCityBackdrop() {
  return <div className="about-city-backdrop" aria-hidden="true">
    <div className="about-city-map-canvas">
      <KarachiMap className="about-city-base-map" preserveAspectRatio="none" />
      <svg viewBox="0 0 640 520" preserveAspectRatio="none" className="about-city-pins" focusable="false">
        {landmarks.map((place, index) => <g key={place.name} transform={`translate(${place.x} ${place.y})`}>
          <circle className="about-pin-halo" r="18" style={{ animationDelay: `${index * .7}s` }} />
          <path d="M0 0C-4-6-11-13-11-20a11 11 0 1 1 22 0C11-13 4-6 0 0Z" fill="var(--color-brand)" />
          <circle cy="-20" r="3.5" fill="var(--color-coral)" />
          <text x="17" y="-15" fontFamily="Manrope, sans-serif" fontSize="11" fontWeight="700" fill="var(--color-brand)">{place.name}</text>
        </g>)}
      </svg>
    </div>
  </div>
}
