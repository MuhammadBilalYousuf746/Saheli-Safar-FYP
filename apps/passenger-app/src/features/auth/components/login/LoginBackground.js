
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
        fill="#F0E7F3"
      />

      <Path
        d="M-33 17 C34 36 85 15 120 -37"
        fill="none"
        stroke="#D8C3E0"
        strokeWidth="1.5"
      />

      <Path
        d="M321 -48 C370 19 416 102 417 181"
        fill="none"
        stroke="#D8B6D2"
        strokeWidth="2"
      />

      <Circle cx="352" cy="94" r="46" fill="#F7EBED" />
      <Circle cx="352" cy="94" r="31" fill="#F3E0E8" />

      <Path
        d="M-60 670 C23 624 50 693 16 766
           L-27 836 L-72 836Z"
        fill="#F2E8F4"
      />

      <Path
        d="M318 677 C366 639 418 676 434 747
           L434 835 L296 835Z"
        fill="#F8EAE9"
      />

      <G opacity="0.7">
        <Path
          d="M342 807 Q320 763 348 713"
          stroke="#CDAAC8"
          strokeWidth="1.5"
          fill="none"
        />

        <Path
          d="M337 770 Q308 767 311 743
             Q336 745 337 770Z"
          fill="#E5CEDF"
        />

        <Path
          d="M342 740 Q367 728 376 747
             Q352 756 342 740Z"
          fill="#EDCAD7"
        />
      </G>

      <Circle cx="45" cy="252" r="3" fill="#D5BBDE" />
      <Circle cx="353" cy="357" r="3" fill="#E8BECE" />

      <G
        stroke="#CEAAC7"
        strokeWidth="1.6"
        strokeLinecap="round"
      >
        <Path d="M41 520 V534 M34 527 H48" />
        <Path d="M343 525 V539 M336 532 H350" />
      </G>
    </Svg>
  );
}
