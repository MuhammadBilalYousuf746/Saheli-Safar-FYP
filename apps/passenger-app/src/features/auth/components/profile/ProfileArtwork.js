
import React from "react";

import Svg, {
  Circle,
  Ellipse,
  G,
  Path,
  Rect,
} from "react-native-svg";

export default function ProfileArtwork() {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 350 180"
      preserveAspectRatio="xMidYMid meet"
    >
      <Path
        d="M42 93 C46 37 112 16 173 18
           C241 20 310 57 305 113
           C300 163 247 176 169 173
           C89 169 39 143 42 93Z"
        fill="#F1E1EE"
      />

      <Circle cx="79" cy="59" r="25" fill="#E7CDDF" />
      <Circle cx="280" cy="125" r="20" fill="#F6DFE2" />

      <Ellipse
        cx="178"
        cy="164"
        rx="111"
        ry="8"
        fill="#DBC5D8"
        opacity="0.6"
      />

      {/* Card shadow */}
      <G transform="rotate(-6 174 90)">
        <Rect
          x="87"
          y="39"
          width="177"
          height="112"
          rx="20"
          fill="#BFA7C4"
          opacity="0.35"
        />
      </G>

      {/* Profile ID card */}
      <G transform="rotate(-6 170 88)">
        <Rect
          x="82"
          y="32"
          width="177"
          height="112"
          rx="19"
          fill="#FFFFFF"
        />

        <Rect
          x="82"
          y="32"
          width="177"
          height="22"
          rx="19"
          fill="#795A82"
        />

        <Rect
          x="82"
          y="47"
          width="177"
          height="8"
          fill="#795A82"
        />

        {/* Portrait */}
        <Circle
          cx="131"
          cy="91"
          r="29"
          fill="#F6E6ED"
        />

        {/* Hijab */}
        <Path
          d="M112 88 C109 70 116 60 131 60
             C146 60 154 72 150 91
             L154 113 L109 113Z"
          fill="#57405E"
        />

        {/* Face */}
        <Ellipse
          cx="131"
          cy="85"
          rx="14"
          ry="18"
          fill="#E9B69B"
        />

        <Path
          d="M115 83 Q113 62 132 63
             Q149 64 148 83
             C141 74 135 71 130 71
             Q125 80 115 83Z"
          fill="#57405E"
        />

        <Path
          d="M125 91 Q130 95 136 91"
          stroke="#B77678"
          strokeWidth="1.3"
          fill="none"
          strokeLinecap="round"
        />

        {/* Outfit */}
        <Path
          d="M110 114 Q113 101 126 102
             L140 102 Q153 104 156 114Z"
          fill="#9876A6"
        />

        {/* Card details */}
        <Rect
          x="171"
          y="70"
          width="52"
          height="5"
          rx="2.5"
          fill="#795A82"
        />

        <Rect
          x="171"
          y="84"
          width="68"
          height="5"
          rx="2.5"
          fill="#E3D5E5"
        />

        <Rect
          x="171"
          y="98"
          width="54"
          height="5"
          rx="2.5"
          fill="#E3D5E5"
        />

        <Rect
          x="171"
          y="118"
          width="38"
          height="7"
          rx="3.5"
          fill="#F0D9E1"
        />
      </G>

      {/* Heart badge */}
      <Circle cx="258" cy="51" r="22" fill="#FFFFFF" />

      <Path
        d="M258 61 C244 53 244 43 251 41
           Q256 39 258 45
           Q263 39 268 41
           C275 44 272 53 258 61Z"
        fill="#C98291"
      />

      {/* Flower */}
      <G transform="translate(76 124)">
        <Ellipse cx="0" cy="-10" rx="5" ry="10" fill="#DCA5B9" />
        <Ellipse cx="10" cy="0" rx="10" ry="5" fill="#E7BECD" />
        <Ellipse cx="0" cy="10" rx="5" ry="10" fill="#DCA5B9" />
        <Ellipse cx="-10" cy="0" rx="10" ry="5" fill="#E7BECD" />
        <Circle cx="0" cy="0" r="5" fill="#FFF2D9" />
      </G>

      <Circle cx="290" cy="87" r="3" fill="#D5A3C0" />
      <Circle cx="59" cy="85" r="3" fill="#BDA3D1" />
    </Svg>
  );
}
