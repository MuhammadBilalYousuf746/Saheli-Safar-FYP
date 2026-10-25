
import React from "react";

import Svg, {
  Defs,
  LinearGradient,
  Path,
  Stop,
} from "react-native-svg";

export default function ResetOTPBackground() {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 390 800"
      preserveAspectRatio="xMidYMid slice"
    >
      <Defs>
        <LinearGradient
          id="topShape"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <Stop offset="0" stopColor="#EEDFED" />
          <Stop offset="1" stopColor="#FAF3F7" />
        </LinearGradient>

        <LinearGradient
          id="bottomShape"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <Stop offset="0" stopColor="#F8EAEB" />
          <Stop offset="1" stopColor="#F0E5F4" />
        </LinearGradient>
      </Defs>

      {/* Top organic curve */}
      <Path
        d="M-65 -50 H455 V67
           C348 129 254 57 161 92
           C63 128 5 137 -65 103Z"
        fill="url(#topShape)"
      />

      {/* One fine accent line */}
      <Path
        d="M-45 120
           C55 153 91 111 168 83
           C272 48 349 115 430 71"
        fill="none"
        stroke="#DBC7DD"
        strokeWidth="1.2"
        opacity="0.75"
      />

      {/* Bottom organic curve */}
      <Path
        d="M-50 709
           C46 655 116 710 207 705
           C296 699 352 653 440 704
           L440 860 H-50Z"
        fill="url(#bottomShape)"
      />

      <Path
        d="M-35 731
           C57 687 129 741 213 731
           C307 719 359 684 428 731"
        fill="none"
        stroke="#E1CDE1"
        strokeWidth="1.2"
      />
    </Svg>
  );
}
