const RouteIllustration = () => (
  <div className="route-art-wrap">
    <svg
      className="route-art"
      viewBox="0 0 540 470"
      role="img"
      aria-labelledby="route-art-title route-art-description"
    >
      <title id="route-art-title">A Saheli Safar journey through Karachi</title>
      <desc id="route-art-description">
        An illustrated city, winding route and friendly shuttle beneath a warm
        evening sun.
      </desc>

      <defs>
        <linearGradient id="art-sky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff7e9" />
          <stop offset="100%" stopColor="#f6e4ed" />
        </linearGradient>
        <linearGradient id="art-bus" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#704365" />
          <stop offset="100%" stopColor="#452b50" />
        </linearGradient>
      </defs>

      <rect x="22" y="18" width="496" height="424" rx="36" fill="url(#art-sky)" />
      <circle cx="404" cy="102" r="49" fill="#f5c777" opacity=".76" />
      <circle cx="404" cy="102" r="63" fill="#f5c777" opacity=".14" />

      <g className="art-cloud" fill="#fff" opacity=".76">
        <path d="M83 106c0-10 8-18 18-18 3-14 15-24 30-24 17 0 30 13 31 29 11 1 19 10 19 21 0 12-10 22-22 22h-54c-12 0-22-10-22-22 0-3 0-5 1-8z" />
      </g>
      <g className="art-cloud art-cloud-late" fill="#fff" opacity=".55">
        <path d="M304 163c0-8 7-15 15-15 3-11 13-19 25-19 13 0 24 10 25 23 9 1 15 8 15 17 0 10-8 18-18 18h-43c-10 0-18-8-18-18 0-2 0-4 1-6z" />
      </g>

      <path d="M22 310c91-48 155-36 233-19 92 21 154 20 263-23v174H22z" fill="#efd8dd" />
      <path d="M22 350c105-55 177-28 255-17 81 12 151 0 241-48v157H22z" fill="#e8cbd5" />

      <g className="art-buildings" stroke="#fff8f4" strokeWidth="4" strokeLinejoin="round">
        <path d="M58 233h83v118H58z" fill="#d899a5" />
        <path d="M70 212h58v24H70z" fill="#c98291" />
        <path d="M78 251h15v18H78zm29 0h15v18h-15zm-29 35h15v18H78zm29 0h15v18h-15z" fill="#fff1da" stroke="none" />
        <path d="M154 266h64v79h-64z" fill="#b78db3" />
        <path d="M167 281h13v17h-13zm26 0h13v17h-13zm-26 32h13v17h-13zm26 0h13v17h-13z" fill="#fff1da" stroke="none" />
        <path d="M323 224h70v121h-70z" fill="#e9a47d" />
        <path d="M313 209h90v18h-90z" fill="#d98970" />
        <path d="M337 244h15v18h-15zm28 0h15v18h-15zm-28 36h15v18h-15zm28 0h15v18h-15z" fill="#fff1da" stroke="none" />
        <path d="M410 251h76v97h-76z" fill="#ae83a8" />
        <path d="M422 269h15v17h-15zm29 0h15v17h-15zm-29 33h15v17h-15zm29 0h15v17h-15z" fill="#fff1da" stroke="none" />
      </g>

      <path
        className="art-route"
        d="M48 368c71-36 121-47 178-21 56 26 83 32 120 5 30-23 13-61-21-56-25 4-36 33-19 50"
        fill="none"
        stroke="#fffaf8"
        strokeWidth="17"
        strokeLinecap="round"
      />
      <path
        className="art-route art-route-dash"
        d="M48 368c71-36 121-47 178-21 56 26 83 32 120 5 30-23 13-61-21-56-25 4-36 33-19 50"
        fill="none"
        stroke="#9b688e"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="2 10"
      />

      <g className="art-stop">
        <circle cx="91" cy="352" r="13" fill="#fff" />
        <circle cx="91" cy="352" r="6" fill="#c98291" />
      </g>
      <g className="art-stop art-stop-late">
        <circle cx="349" cy="305" r="13" fill="#fff" />
        <circle cx="349" cy="305" r="6" fill="#c98291" />
      </g>

      <g className="art-bus">
        <ellipse cx="256" cy="347" rx="90" ry="14" fill="#714665" opacity=".14" />
        <rect x="190" y="276" width="132" height="73" rx="20" fill="url(#art-bus)" />
        <path d="M205 288c0-4 4-8 8-8h31v31h-39zm48-8h29c5 0 9 4 9 8v23h-38z" fill="#f7dfd5" />
        <path d="M207 316h102v8H207z" fill="#c98291" />
        <rect x="288" y="328" width="19" height="21" rx="8" fill="#f2b84b" />
        <rect x="179" y="307" width="12" height="21" rx="5" fill="#d899a5" />
        <circle cx="219" cy="349" r="12" fill="#39273c" />
        <circle cx="219" cy="349" r="5" fill="#fff1da" />
        <circle cx="292" cy="349" r="12" fill="#39273c" />
        <circle cx="292" cy="349" r="5" fill="#fff1da" />
        <path d="M201 338h20m81 0h8" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".75" />
        <path d="M268 295v11m-5-5h10" stroke="#a76d94" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      <g className="art-sparkle" fill="#fff">
        <path d="m453 177 4 10 10 4-10 4-4 10-4-10-10-4 10-4z" />
        <path d="m113 188 3 7 7 3-7 3-3 7-3-7-7-3 7-3z" opacity=".8" />
      </g>
    </svg>

    <div className="art-note art-note-top">
      <span className="art-note-icon"><ShieldCheckIcon /></span>
      <span><strong>People before pickups</strong><small>Designed around women</small></span>
    </div>
    <div className="art-note art-note-bottom">
      <span className="art-note-icon art-note-icon-sun"><MapPinIcon /></span>
      <span><strong>One city. Many journeys.</strong><small>Made for Karachi journeys</small></span>
    </div>
    <span className="art-caption">A safer sort of everyday.</span>
  </div>
);

const ShieldCheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 3 19 6v5c0 4.7-2.9 8.4-7 10-4.1-1.6-7-5.3-7-10V6l7-3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <circle cx="12" cy="10" r="2.3" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

export default RouteIllustration;
