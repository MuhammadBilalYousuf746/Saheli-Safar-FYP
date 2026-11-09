import { colors } from "../../../../theme/colors";

import React from "react";

import Svg, {
  Circle,
  G,
  Path,
} from "react-native-svg";

export default function RegistrationBackground() {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 390 800"
      preserveAspectRatio="xMidYMid slice"
    >
      <Path
        d="M260 -70 C380 -95 460 32 392 137
           C343 211 267 181 262 112
           C258 66 305 37 349 62"
        fill={colors.backgroundDark}
      />

      <Path
        d="M310 -50 C390 24 305 92 390 168"
        stroke={colors.artwork.paperLight}
        strokeWidth="1.5"
        fill="none"
        opacity="0.75"
      />

      <Path
        d="M-72 475 C45 402 95 508 31 583
           C-21 643 -64 590 -72 548Z"
        fill={colors.backgroundDark}
      />

      <Path
        d="M-18 465 C53 455 67 510 27 560"
        stroke={colors.artwork.paperLight}
        strokeWidth="1.5"
        fill="none"
      />

      <Circle cx="351" cy="298" r="4" fill={colors.artwork.backdrop} />
      <Circle cx="340" cy="315" r="2.5" fill={colors.artwork.backdrop} />
      <Circle cx="37" cy="310" r="3" fill={colors.artwork.backdrop} />

      <G opacity="0.55">
        <Path
          d="M354 700 C329 662 328 628 347 600"
          stroke={colors.artwork.paperLight}
          strokeWidth="2"
          fill="none"
        />

        <Path
          d="M344 666 C316 665 313 648 317 635
             C336 635 349 647 344 666Z"
          fill={colors.artwork.backdrop}
        />

        <Path
          d="M340 631 C359 615 371 619 375 626
             C362 643 349 644 340 631Z"
          fill={colors.artwork.backdrop}
        />
      </G>
    </Svg>
  );
}
