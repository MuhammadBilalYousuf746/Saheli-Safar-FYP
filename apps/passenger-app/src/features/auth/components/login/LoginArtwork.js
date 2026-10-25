
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

export default function LoginArtwork() {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 360 220"
      preserveAspectRatio="xMidYMid meet"
    >
      <Defs>
        <LinearGradient id="arch" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#725276" />
          <Stop offset="1" stopColor="#382039" />
        </LinearGradient>

        <LinearGradient id="inside" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#E8D3E9" />
          <Stop offset="1" stopColor="#FFF3E9" />
        </LinearGradient>

        <LinearGradient id="walkway" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" />
          <Stop offset="1" stopColor="#E8D1E2" />
        </LinearGradient>
      </Defs>

      {/* Editorial backdrop */}
      <Ellipse
        cx="180"
        cy="115"
        rx="148"
        ry="95"
        fill="#F2E5F0"
      />

      <Circle cx="69" cy="59" r="24" fill="#F6DDE3" />
      <Circle cx="301" cy="147" r="24" fill="#E6D5EE" />

      {/* Architectural framing */}
      <Path
        d="M84 182 V94
           C84 42 123 16 180 16
           C237 16 276 42 276 94
           V182Z"
        fill="#E0CCDF"
      />

      {/* Main entrance */}
      <Path
        d="M110 180 V95
           C110 50 138 29 180 29
           C222 29 250 50 250 95
           V180Z"
        fill="url(#arch)"
      />

      {/* Interior opening */}
      <Path
        d="M127 180 V100
           C127 65 147 46 180 46
           C213 46 233 65 233 100
           V180Z"
        fill="url(#inside)"
      />

      {/* Decorative arch line */}
      <Path
        d="M119 173 V96
           C119 58 141 38 180 38
           C219 38 241 58 241 96
           V173"
        fill="none"
        stroke="#B995BB"
        strokeWidth="1.5"
      />

      {/* Warm sun */}
      <Circle cx="180" cy="105" r="27" fill="#FFF0C8" />
      <Circle
        cx="180"
        cy="105"
        r="38"
        fill="#FFF0C8"
        opacity="0.25"
      />

      {/* Door-side columns */}
      <Rect
        x="105"
        y="121"
        width="19"
        height="59"
        rx="4"
        fill="#67476C"
      />

      <Rect
        x="236"
        y="121"
        width="19"
        height="59"
        rx="4"
        fill="#67476C"
      />

      {/* Pathway */}
      <Path
        d="M162 138 L198 138
           L251 203 L109 203Z"
        fill="url(#walkway)"
      />

      <Path
        d="M174 143 L150 196"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2"
        opacity="0.8"
      />

      <Path
        d="M186 143 L210 196"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2"
        opacity="0.8"
      />

      {/* Ground */}
      <Ellipse
        cx="180"
        cy="202"
        rx="139"
        ry="9"
        fill="#D8C3D7"
        opacity="0.55"
      />

      {/* Gateway threshold */}
      <Rect
        x="104"
        y="177"
        width="152"
        height="8"
        rx="4"
        fill="#9E7DA4"
      />

      {/* Left ornamental plant */}
      <G>
        <Path
          d="M77 184 Q72 157 87 127"
          stroke="#819786"
          strokeWidth="2.4"
          fill="none"
        />

        <Path
          d="M80 160 Q57 155 61 137
             Q82 141 80 160Z"
          fill="#A4B39B"
        />

        <Path
          d="M83 148 Q98 132 105 140
             Q98 158 83 148Z"
          fill="#819F8C"
        />

        <Rect
          x="63"
          y="177"
          width="30"
          height="19"
          rx="5"
          fill="#C58D9D"
        />

        <Rect
          x="58"
          y="174"
          width="40"
          height="6"
          rx="3"
          fill="#DAAFB9"
        />
      </G>

      {/* Right ornamental plant */}
      <G>
        <Path
          d="M287 184 Q296 157 283 125"
          stroke="#819786"
          strokeWidth="2.4"
          fill="none"
        />

        <Path
          d="M291 159 Q314 150 311 134
             Q288 142 291 159Z"
          fill="#A4B39B"
        />

        <Path
          d="M285 147 Q268 132 262 144
             Q273 158 285 147Z"
          fill="#819F8C"
        />

        <Rect
          x="273"
          y="177"
          width="30"
          height="19"
          rx="5"
          fill="#9473AE"
        />

        <Rect
          x="268"
          y="174"
          width="40"
          height="6"
          rx="3"
          fill="#BCA3D0"
        />
      </G>

      {/* Floating access token */}
      <G transform="translate(263 45)">
        <Circle
          cx="3"
          cy="4"
          r="32"
          fill="#CDB8CF"
          opacity="0.5"
        />

        <Circle cx="0" cy="0" r="32" fill="#FFFFFF" />
        <Circle cx="0" cy="0" r="24" fill="#F4E9F3" />

        {/* Key */}
        <Circle
          cx="-6"
          cy="-4"
          r="7"
          fill="none"
          stroke="#67476C"
          strokeWidth="3.5"
        />

        <Path
          d="M-1 1 L13 15 M7 9 L12 4"
          fill="none"
          stroke="#67476C"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>

      {/* Floating accents */}
      <G
        stroke="#C58DAA"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <Path d="M48 93 V105 M42 99 H54" />
        <Path d="M313 126 V140 M306 133 H320" />
      </G>

      <Circle cx="50" cy="145" r="3" fill="#B99BCE" />
      <Circle cx="318" cy="87" r="3" fill="#DCA9BC" />

      {/* Brand flower */}
      <G transform="translate(110 48)">
        <Ellipse
          cx="0"
          cy="-9"
          rx="4.5"
          ry="9"
          fill="#DDA4BC"
        />

        <Ellipse
          cx="9"
          cy="0"
          rx="9"
          ry="4.5"
          fill="#E9C0CE"
        />

        <Ellipse
          cx="0"
          cy="9"
          rx="4.5"
          ry="9"
          fill="#DDA4BC"
        />

        <Ellipse
          cx="-9"
          cy="0"
          rx="9"
          ry="4.5"
          fill="#E9C0CE"
        />

        <Circle
          cx="0"
          cy="0"
          r="4.5"
          fill="#FFF2D9"
        />
      </G>
    </Svg>
  );
}
