import { colors } from "../../../../theme/colors";

import React from "react";

import Svg, {
  Circle,
  G,
  Path,
} from "react-native-svg";

export default function LoginBackground() {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 390 800"
      preserveAspectRatio="xMidYMid slice"
    >
      <Path
        d="M-75 -65 L166 -65
           C134 23 59 73 -30 67Z"
        fill={colors.backgroundDark}
      />

      <Path
        d="M-33 17 C34 36 85 15 120 -37"
        fill="none"
        stroke={colors.artwork.paperLight}
        strokeWidth="1.5"
      />

      <Path
        d="M321 -48 C370 19 416 102 417 181"
        fill="none"
        stroke={colors.artwork.paperLight}
        strokeWidth="2"
      />

      <Circle cx="352" cy="94" r="46" fill={colors.backgroundDark} />
      <Circle cx="352" cy="94" r="31" fill={colors.backgroundDark} />

      <Path
        d="M-60 670 C23 624 50 693 16 766
           L-27 836 L-72 836Z"
        fill={colors.backgroundDark}
      />

      <Path
        d="M318 677 C366 639 418 676 434 747
           L434 835 L296 835Z"
        fill={colors.backgroundDark}
      />

      <G opacity="0.7">
        <Path
          d="M342 807 Q320 763 348 713"
          stroke={colors.artwork.paperLight}
          strokeWidth="1.5"
          fill="none"
        />

        <Path
          d="M337 770 Q308 767 311 743
             Q336 745 337 770Z"
          fill={colors.backgroundDark}
        />

        <Path
          d="M342 740 Q367 728 376 747
             Q352 756 342 740Z"
          fill={colors.artwork.backdrop}
        />
      </G>

      <Circle cx="45" cy="252" r="3" fill={colors.artwork.backdrop} />
      <Circle cx="353" cy="357" r="3" fill={colors.artwork.backdrop} />

      <G
        stroke={colors.artwork.paperLight}
        strokeWidth="1.6"
        strokeLinecap="round"
      >
        <Path d="M10 520 V534 M3 527 H17" />
        <Path d="M380 525 V539 M373 532 H387" />
      </G>
    </Svg>
  );
}
