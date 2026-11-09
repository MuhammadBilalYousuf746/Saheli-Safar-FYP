import { colors } from "../../../../theme/colors";

import React from "react";

import Svg, {
  Circle,
  Path,
} from "react-native-svg";

export default function RecoverySymbol() {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 110 110"
    >
      <Circle
        cx="55"
        cy="55"
        r="53"
        fill={colors.artwork.backdropAlt}
      />

      <Circle
        cx="55"
        cy="55"
        r="41"
        fill={colors.artwork.paper}
      />

      <Circle
        cx="55"
        cy="55"
        r="30"
        fill={colors.artwork.backdropAlt}
      />

      <Path
        d="M72 47
           A20 20 0 1 0 75 58"
        fill="none"
        stroke={colors.artwork.purple}
        strokeWidth="5"
        strokeLinecap="round"
      />

      <Path
        d="M73 34 L74 48 L60 47"
        fill="none"
        stroke={colors.artwork.purple}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <Circle
        cx="55"
        cy="57"
        r="4"
        fill={colors.artwork.rose}
      />
    </Svg>
  );
}
