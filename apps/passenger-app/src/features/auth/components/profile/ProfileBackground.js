
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
        fill="#F4E7F0"
      />

      <Path
        d="M310 -20 C390 19 395 89 346 154"
        stroke="#D8BFD8"
        strokeWidth="1.5"
        fill="none"
      />

      <Path
        d="M-78 321 C28 272 92 352 53 438
           C22 506 -65 487 -80 423Z"
        fill="#F9E9E8"
      />

      <Path
        d="M-18 335 Q64 357 29 434"
        stroke="#E7C9D4"
        strokeWidth="1.4"
        fill="none"
      />

      <Path
        d="M285 742 C316 677 368 672 420 705
           L420 826 L284 826Z"
        fill="#F2E5F0"
      />

      <G
        stroke="#D3B4CD"
        strokeWidth="1.5"
        fill="none"
      >
        <Path d="M342 803 Q329 748 359 705" />
        <Path d="M338 775 Q308 764 315 741 Q340 744 338 775Z" />
        <Path d="M346 747 Q370 735 378 746 Q361 762 346 747Z" />
      </G>

      <Circle cx="43" cy="198" r="3" fill="#DAB4CB" />
      <Circle cx="345" cy="307" r="4" fill="#EBC4D2" />
      <Circle cx="64" cy="573" r="3" fill="#C8AFD8" />

      <G
        stroke="#D5B5CC"
        strokeWidth="1.6"
        strokeLinecap="round"
      >
        <Path d="M340 223 V237 M333 230 H347" />
        <Path d="M40 650 V662 M34 656 H46" />
      </G>
    </Svg>
  );
}
