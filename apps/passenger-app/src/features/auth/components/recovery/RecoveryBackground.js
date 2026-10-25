
import React from "react";

import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  Stop,
} from "react-native-svg";

export default function RecoveryBackground() {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 390 800"
      preserveAspectRatio="xMidYMid slice"
    >
      <Defs>
        <LinearGradient id="topGlow" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#E9D8EB" />
          <Stop offset="1" stopColor="#F8EFF5" />
        </LinearGradient>

        <LinearGradient id="bottomGlow" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#F8E6E8" />
          <Stop offset="1" stopColor="#F2E4F4" />
        </LinearGradient>
      </Defs>

      {/* Top abstract composition */}
      <Path
        d="M-80 -90 L275 -90
           C277 -18 227 36 158 55
           C86 75 37 116 -49 79Z"
        fill="url(#topGlow)"
      />

      <Path
        d="M-45 39 C44 92 162 53 195 -26"
        fill="none"
        stroke="#D0B1D5"
        strokeWidth="1.5"
        opacity="0.7"
      />

      <Path
        d="M-40 54 C52 111 161 75 211 -12"
        fill="none"
        stroke="#E2CBE1"
        strokeWidth="1"
      />

      {/* Fine architectural rings */}
      <Circle
        cx="350"
        cy="147"
        r="89"
        fill="none"
        stroke="#E8D7E8"
        strokeWidth="1.5"
      />

      <Circle
        cx="350"
        cy="147"
        r="66"
        fill="none"
        stroke="#F0E2EF"
        strokeWidth="1.5"
      />

      <Circle cx="350" cy="147" r="43" fill="#F7EDF4" />

      {/* Floating accents */}
      <Circle cx="306" cy="232" r="4" fill="#D5B7D9" />
      <Circle cx="46" cy="286" r="3" fill="#E0BDCE" />

      <G
        stroke="#D4B5CE"
        strokeWidth="1.5"
        strokeLinecap="round"
      >
        <Path d="M337 315 V327 M331 321 H343" />
        <Path d="M48 481 V493 M42 487 H54" />
      </G>

      {/* Bottom abstract wave */}
      <Path
        d="M-63 663
           C49 600 112 681 210 666
           C309 650 354 608 442 662
           L442 865 L-63 865Z"
        fill="url(#bottomGlow)"
      />

      <Path
        d="M-45 689
           C57 632 119 713 216 694
           C315 675 361 650 430 702"
        fill="none"
        stroke="#DCC3DB"
        strokeWidth="1.5"
      />

      <Path
        d="M-40 719
           C75 665 128 741 223 726
           C325 708 362 683 433 734"
        fill="none"
        stroke="#E9D4E4"
        strokeWidth="1.2"
      />

      <Ellipse
        cx="369"
        cy="623"
        rx="42"
        ry="42"
        fill="#F5E5E9"
        opacity="0.75"
      />

      <Circle cx="312" cy="755" r="5" fill="#D8BCD8" />
      <Circle cx="76" cy="638" r="3" fill="#D9B5CB" />
    </Svg>
  );
}
