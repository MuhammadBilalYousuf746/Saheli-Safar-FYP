
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
        fill="#F1E5F1"
      />

      <Circle
        cx="55"
        cy="55"
        r="41"
        fill="#FFFFFF"
      />

      <Circle
        cx="55"
        cy="55"
        r="30"
        fill="#F8F1F7"
      />

      <Path
        d="M72 47
           A20 20 0 1 0 75 58"
        fill="none"
        stroke="#77547E"
        strokeWidth="5"
        strokeLinecap="round"
      />

      <Path
        d="M73 34 L74 48 L60 47"
        fill="none"
        stroke="#77547E"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <Circle
        cx="55"
        cy="57"
        r="4"
        fill="#C98291"
      />
    </Svg>
  );
}
