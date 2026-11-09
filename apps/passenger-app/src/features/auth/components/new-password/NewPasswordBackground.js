import { colors } from "../../../../theme/colors";

import React from "react";

import Svg, {
  Defs,
  LinearGradient,
  Path,
  Stop,
  Circle,
} from "react-native-svg";

export default function NewPasswordBackground() {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 390 800"
      preserveAspectRatio="xMidYMid slice"
    >
      <Defs>
        <LinearGradient
          id="passwordTop"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <Stop offset="0" stopColor={colors.backgroundDark} />
          <Stop offset="1" stopColor={colors.backgroundDark} />
        </LinearGradient>

        <LinearGradient
          id="passwordBottom"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <Stop offset="0" stopColor={colors.backgroundDark} />
          <Stop offset="1" stopColor={colors.backgroundDark} />
        </LinearGradient>
      </Defs>

      {/* Top asymmetric abstract shape */}
      <Path
        d="M-50 -60 H450 V89
           C359 46 301 121 203 89
           C102 56 35 151 -50 107Z"
        fill="url(#passwordTop)"
      />

      <Path
        d="M-36 124
           C49 166 111 67 204 104
           C299 140 356 68 427 110"
        fill="none"
        stroke={colors.artwork.paperLight}
        strokeWidth="1.3"
      />

      {/* Minimal linework */}
      <Path
        d="M353 242
           C315 258 301 304 330 340"
        fill="none"
        stroke={colors.artwork.paperLight}
        strokeWidth="1.5"
      />

      <Circle cx="329" cy="342" r="4" fill={colors.artwork.backdrop} />
      <Circle cx="39" cy="418" r="3" fill={colors.artwork.backdrop} />

      {/* Bottom layered curves */}
      <Path
        d="M-51 707
           C54 651 121 696 196 728
           C281 760 355 669 443 702
           L443 863 H-51Z"
        fill="url(#passwordBottom)"
      />

      <Path
        d="M-34 732
           C64 677 132 725 197 749
           C293 784 351 704 432 728"
        fill="none"
        stroke={colors.artwork.paperLight}
        strokeWidth="1.3"
      />

      <Circle cx="55" cy="664" r="4" fill={colors.artwork.backdrop} />
    </Svg>
  );
}
