
import React from "react";

import {
  Circle,
  G,
  Line,
  Path,
  Rect,
} from "react-native-svg";

export default function KarachiBackdrop() {
  return (
    <G>
      {/* Main illustration background */}
      <Path
        d="M24 147 C42 75 106 32 185 28
           C273 24 330 90 335 171
           C337 223 299 268 222 271
           H108 C49 265 12 215 24 147Z"
        fill="url(#sceneBlush)"
      />

      {/* Curved light detail */}
      <Path
        d="M46 175 C64 108 119 65 187 64"
        stroke="#FFFFFF"
        strokeWidth="2"
        opacity={0.7}
        fill="none"
      />

      {/* Residential buildings */}
      <G opacity={0.86}>
        <Rect x="39" y="116" width="66" height="117" rx="4" fill="#E0CCD9" />
        <Rect x="49" y="103" width="46" height="13" rx="3" fill="#D3B8CF" />

        <Rect x="98" y="92" width="57" height="141" rx="4" fill="#D6BFD4" />
        <Rect x="105" y="85" width="43" height="10" rx="3" fill="#C7A9C9" />

        <Rect x="151" y="130" width="47" height="103" rx="4" fill="#E3D1E1" />

        <Rect x="232" y="111" width="55" height="122" rx="4" fill="#D9C3D8" />
        <Rect x="279" y="142" width="47" height="91" rx="4" fill="#E4D2DF" />
      </G>

      {/* Building windows */}
      <G fill="#FFF9FB">
        <Rect x="50" y="133" width="14" height="20" rx="2" />
        <Rect x="76" y="133" width="14" height="20" rx="2" />
        <Rect x="50" y="166" width="14" height="20" rx="2" />
        <Rect x="76" y="166" width="14" height="20" rx="2" />

        <Rect x="110" y="111" width="12" height="18" rx="2" />
        <Rect x="131" y="111" width="12" height="18" rx="2" />
        <Rect x="110" y="142" width="12" height="18" rx="2" />
        <Rect x="131" y="142" width="12" height="18" rx="2" />

        <Rect x="244" y="130" width="13" height="18" rx="2" />
        <Rect x="265" y="130" width="13" height="18" rx="2" />
        <Rect x="244" y="161" width="13" height="18" rx="2" />
        <Rect x="265" y="161" width="13" height="18" rx="2" />
      </G>

      {/* Window depth */}
      <G stroke="#C5AEC9" strokeWidth="1">
        <Path d="M57 133 V153 M83 133 V153" />
        <Path d="M116 111 V129 M137 111 V129" />
        <Path d="M250 130 V148 M271 130 V148" />
      </G>

      {/* Balcony rails */}
      <G stroke="#BDA5C6" strokeWidth="1.8">
        <Line x1="47" y1="193" x2="96" y2="193" />
        <Line x1="108" y1="171" x2="146" y2="171" />
        <Line x1="240" y1="190" x2="282" y2="190" />
      </G>

      {/* Building edge shading */}
      <G stroke="#BFA7C7" strokeWidth="2" opacity={0.35}>
        <Path d="M103 94 V228" />
        <Path d="M283 113 V230" />
      </G>

      {/* Trees */}
      <G>
        <Path
          d="M21 233 V197 M333 234 V199"
          stroke="#7F9F91"
          strokeWidth="5"
          strokeLinecap="round"
        />

        <Circle cx="21" cy="192" r="18" fill="#BED5C3" />
        <Circle cx="10" cy="202" r="12" fill="#A9C8B3" />
        <Circle cx="33" cy="204" r="12" fill="#A9C8B3" />

        <Circle cx="333" cy="192" r="19" fill="#B4D0BC" />
        <Circle cx="320" cy="202" r="12" fill="#A9C8B3" />
        <Circle cx="345" cy="204" r="12" fill="#A9C8B3" />

        {/* Leaf highlights */}
        <Circle
          cx="13"
          cy="188"
          r="6"
          fill="#D3E3D3"
          opacity={0.55}
        />

        <Circle
          cx="326"
          cy="185"
          r="7"
          fill="#D3E3D3"
          opacity={0.5}
        />
      </G>
    </G>
  );
}
