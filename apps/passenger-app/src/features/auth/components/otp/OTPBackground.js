
import React from "react";

import Svg, {
  Circle,
  Ellipse,
  G,
  Path,
} from "react-native-svg";

export default function OTPBackground() {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 390 800"
      preserveAspectRatio="xMidYMid slice"
    >
      <Path
        d="M-55 -65 C77 -79 148 23 96 120
           C64 180 -13 165 -43 125Z"
        fill="#F0E2ED"
      />

      <Path
        d="M-26 -20 C88 -25 124 51 80 124"
        stroke="#D8BFD8"
        strokeWidth="1.5"
        fill="none"
      />

      <Path
        d="M299 -56 C397 -18 444 71 388 153
           C349 208 282 160 316 93Z"
        fill="#FAEBE8"
      />

      <Path
        d="M322 -30 C393 17 403 85 368 134"
        stroke="#E9C4D1"
        strokeWidth="1.5"
        fill="none"
      />

      <Path
        d="M322 559 C400 526 440 603 407 679
           C380 742 331 729 304 688
           C270 637 278 579 322 559Z"
        fill="#F2E7F3"
        opacity="0.9"
      />

      <Path
        d="M345 565 C307 607 315 658 371 701"
        stroke="#D8BEDD"
        strokeWidth="1.6"
        fill="none"
      />

      {/* Decorative stars */}
      <G
        stroke="#CBA3BA"
        strokeWidth="1.6"
        strokeLinecap="round"
      >
        <Path d="M55 264 V280 M47 272 H63" />
        <Path d="M346 326 V338 M340 332 H352" />
        <Path d="M35 621 V633 M29 627 H41" />
      </G>

      <Circle cx="72" cy="303" r="3" fill="#EAC7D5" />
      <Circle cx="348" cy="368" r="3" fill="#CEB4DD" />

      {/* Floral decoration */}
      <G opacity="0.6">
        <Path
          d="M32 760 Q52 713 42 671"
          fill="none"
          stroke="#BFA1BA"
          strokeWidth="1.8"
        />

        <Ellipse
          cx="34"
          cy="689"
          rx="8"
          ry="16"
          transform="rotate(-35 34 689)"
          fill="#E6CCDC"
        />

        <Ellipse
          cx="49"
          cy="716"
          rx="7"
          ry="14"
          transform="rotate(43 49 716)"
          fill="#EBCDD3"
        />
      </G>
    </Svg>
  );
}
