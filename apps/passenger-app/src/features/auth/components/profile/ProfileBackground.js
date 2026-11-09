import { colors } from "../../../../theme/colors";

import React from "react";

import Svg, {
  Circle,
  G,
  Path,
} from "react-native-svg";

export default function ProfileBackground() {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 390 800"
      preserveAspectRatio="xMidYMid slice"
    >
      <Path
        d="M260 -70 C380 -55 441 48 390 151
           C357 214 296 187 285 129
           C274 72 326 30 368 50"
        fill={colors.backgroundDark}
      />

      <Path
        d="M310 -20 C390 19 395 89 346 154"
        stroke={colors.artwork.paperLight}
        strokeWidth="1.5"
        fill="none"
      />

      <Path
        d="M-78 321 C28 272 92 352 53 438
           C22 506 -65 487 -80 423Z"
        fill={colors.backgroundDark}
      />

      <Path
        d="M-18 335 Q64 357 29 434"
        stroke={colors.artwork.paperLight}
        strokeWidth="1.4"
        fill="none"
      />

      <Path
        d="M285 742 C316 677 368 672 420 705
           L420 826 L284 826Z"
        fill={colors.backgroundDark}
      />

      <G
        stroke={colors.artwork.paperLight}
        strokeWidth="1.5"
        fill="none"
      >
        <Path d="M342 803 Q329 748 359 705" />
        <Path d="M338 775 Q308 764 315 741 Q340 744 338 775Z" />
        <Path d="M346 747 Q370 735 378 746 Q361 762 346 747Z" />
      </G>

      <Circle cx="43" cy="198" r="3" fill={colors.artwork.backdrop} />
      <Circle cx="345" cy="307" r="4" fill={colors.artwork.backdrop} />
      <Circle cx="64" cy="573" r="3" fill={colors.artwork.backdrop} />

      <G
        stroke={colors.artwork.paperLight}
        strokeWidth="1.6"
        strokeLinecap="round"
      >
        <Path d="M340 223 V237 M333 230 H347" />
        <Path d="M40 650 V662 M34 656 H46" />
      </G>
    </Svg>
  );
}
