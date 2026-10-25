
import React from "react";

import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from "react-native-svg";

export default function OTPArtwork() {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 350 215"
      preserveAspectRatio="xMidYMid meet"
    >
      <Defs>
        <LinearGradient id="envelope" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#AC8FB9" />
          <Stop offset="1" stopColor="#77547E" />
        </LinearGradient>

        <LinearGradient id="shield" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#77547E" />
          <Stop offset="1" stopColor="#4E3053" />
        </LinearGradient>
      </Defs>

      {/* Background silhouette */}
      <Path
        d="M45 111 C45 58 99 26 170 24
           C249 20 309 64 308 120
           C307 176 258 198 178 196
           C95 194 45 160 45 111Z"
        fill="#F1E1EE"
      />

      <Circle cx="83" cy="71" r="27" fill="#E8D2E6" />
      <Circle cx="278" cy="150" r="19" fill="#F3DDE1" />

      <Path
        d="M56 127 C92 103 111 115 137 130"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeDasharray="4 6"
        fill="none"
      />

      <Path
        d="M224 85 C251 70 279 79 300 98"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeDasharray="4 6"
        fill="none"
      />

      {/* Ground shadow */}
      <Ellipse
        cx="175"
        cy="190"
        rx="112"
        ry="9"
        fill="#D7C1D6"
        opacity="0.55"
      />

      {/* Main envelope shadow */}
      <Rect
        x="90"
        y="85"
        width="165"
        height="104"
        rx="19"
        fill="#BBA3BE"
        opacity="0.25"
      />

      {/* Envelope */}
      <Rect
        x="86"
        y="78"
        width="165"
        height="104"
        rx="18"
        fill="url(#envelope)"
      />

      <Path
        d="M88 92 L168 146 Q172 149 177 146
           L249 92"
        fill="none"
        stroke="#DCC5DF"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <Path
        d="M88 174 L143 129"
        fill="none"
        stroke="#BA9ABE"
        strokeWidth="2"
      />

      <Path
        d="M249 174 L197 129"
        fill="none"
        stroke="#BA9ABE"
        strokeWidth="2"
      />

      {/* OTP message card */}
      <Rect
        x="110"
        y="40"
        width="124"
        height="79"
        rx="14"
        fill="#D7BDD6"
        opacity="0.45"
      />

      <Rect
        x="106"
        y="35"
        width="124"
        height="79"
        rx="14"
        fill="#FFFFFF"
      />

      <Rect
        x="123"
        y="51"
        width="45"
        height="5"
        rx="2.5"
        fill="#D8C7DC"
      />

      <Rect
        x="123"
        y="63"
        width="65"
        height="4"
        rx="2"
        fill="#EDE3EF"
      />

      {/* Six verification dots */}
      <G fill="#77547E">
        <Circle cx="127" cy="88" r="4.5" />
        <Circle cx="144" cy="88" r="4.5" />
        <Circle cx="161" cy="88" r="4.5" />
        <Circle cx="178" cy="88" r="4.5" />
        <Circle cx="195" cy="88" r="4.5" />
        <Circle cx="212" cy="88" r="4.5" />
      </G>

      {/* Floating security shield */}
      <Circle
        cx="252"
        cy="64"
        r="34"
        fill="#FFFFFF"
      />

      <Path
        d="M252 39 L273 47 V65
           C273 80 264 89 252 95
           C240 89 231 80 231 65 V47Z"
        fill="url(#shield)"
      />

      <Path
        d="M242 64 L250 72 L264 56"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Tiny flower */}
      <G transform="translate(73 118)">
        <Ellipse cx="0" cy="-10" rx="5" ry="10" fill="#DAA6BB" />
        <Ellipse cx="10" cy="0" rx="10" ry="5" fill="#E6BECA" />
        <Ellipse cx="0" cy="10" rx="5" ry="10" fill="#DAA6BB" />
        <Ellipse cx="-10" cy="0" rx="10" ry="5" fill="#E6BECA" />
        <Circle cx="0" cy="0" r="5" fill="#FFF2D9" />
      </G>

      {/* Decorative stars */}
      <G
        stroke="#C68CA9"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <Path d="M284 125 V139 M277 132 H291" />
        <Path d="M63 52 V64 M57 58 H69" />
      </G>

      <Circle cx="283" cy="160" r="3" fill="#C8ACD4" />
      <Circle cx="95" cy="35" r="3" fill="#E0B4C4" />
    </Svg>
  );
}
