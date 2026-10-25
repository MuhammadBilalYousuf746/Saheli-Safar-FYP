
import React from "react";

import {
  Circle,
  Ellipse,
  G,
  Path,
  Rect,
} from "react-native-svg";

const C = {
  plum: "#552D50",
  coral: "#F29A9C",
};

function SaheliShuttle() {
  return (
    <G>
      {/* Vehicle ground shadow */}
      <Ellipse
        cx="180"
        cy="250"
        rx="124"
        ry="12"
        fill="#453550"
        opacity={0.12}
      />

      <G transform="translate(53 144)">
        {/* Shuttle body */}
        <Path
          d="M29 15 Q34 7 47 7 H191
             Q206 7 215 19 L230 43
             Q237 51 237 62 V89
             Q237 102 224 102 H21
             Q8 102 8 89 V37
             Q8 20 29 15Z"
          fill="url(#shuttleBody)"
        />

        {/* Roof highlight */}
        <Path
          d="M35 15 Q42 12 57 12 H188"
          stroke="#C8A5C4"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity={0.8}
        />

        {/* Windows */}
        <Path
          d="M31 25 H185
             Q199 25 207 37
             L218 57 H20 V39
             Q20 25 31 25Z"
          fill="url(#vehicleGlass)"
        />

        {/* Passengers */}
        <G fill="#655778" opacity={0.3}>
          <Circle cx="91" cy="42" r="7" />
          <Path d="M78 58 Q91 45 104 58Z" />

          <Circle cx="145" cy="42" r="7" />
          <Path d="M133 58 Q145 45 157 58Z" />
        </G>

        {/* Window frames */}
        <Path
          d="M68 25 V58 M119 25 V58 M169 25 V58"
          stroke={C.plum}
          strokeWidth="6"
        />

        {/* Reflections */}
        <G fill="#FFFFFF" opacity={0.35}>
          <Path d="M34 28 H47 L25 54 H20Z" />
          <Path d="M77 28 H88 L71 53 V39Z" />
          <Path d="M125 28 H135 L121 48 V34Z" />
        </G>

        {/* Lower window trim */}
        <Path
          d="M20 61 H218"
          stroke="#D2B9D0"
          strokeWidth="2"
          opacity={0.65}
        />

        {/* Vehicle door */}
        <Rect
          x="178"
          y="59"
          width="39"
          height="37"
          rx="3"
          fill="#6D4B74"
        />

        <Path
          d="M197 59 V96"
          stroke="#C29DBB"
          strokeWidth="1.8"
        />

        <Rect
          x="188"
          y="76"
          width="3"
          height="9"
          rx="1.5"
          fill="#EEE2EB"
        />

        {/* Door glass */}
        <Rect
          x="181"
          y="63"
          width="13"
          height="10"
          rx="2"
          fill="#ACC4CD"
          opacity={0.65}
        />

        <Rect
          x="200"
          y="63"
          width="13"
          height="10"
          rx="2"
          fill="#ACC4CD"
          opacity={0.65}
        />

        {/* Coral branding stripe */}
        <Path
          d="M16 75 H172"
          stroke={C.coral}
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Lower highlight */}
        <Path
          d="M22 82 H163"
          stroke="#A97D9F"
          strokeWidth="1.4"
          opacity={0.75}
        />

        {/* Lights */}
        <Rect
          x="220"
          y="72"
          width="10"
          height="11"
          rx="4"
          fill="#F9DDC3"
        />

        <Rect
          x="12"
          y="73"
          width="8"
          height="12"
          rx="3"
          fill="#F4B8BB"
        />

        {/* Chassis line */}
        <Path
          d="M9 91 H236"
          stroke="#36283E"
          strokeWidth="4"
          opacity={0.6}
        />

        {/* Front wheel */}
        <Circle cx="55" cy="101" r="18" fill="#302639" />
        <Circle cx="55" cy="101" r="9" fill="#D2CAD8" />
        <Circle cx="55" cy="101" r="4" fill="#F8F2F5" />

        {/* Rear wheel */}
        <Circle cx="190" cy="101" r="18" fill="#302639" />
        <Circle cx="190" cy="101" r="9" fill="#D2CAD8" />
        <Circle cx="190" cy="101" r="4" fill="#F8F2F5" />

        {/* Wheel reflections */}
        <Path
          d="M47 97 Q55 90 63 97"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          opacity={0.65}
          fill="none"
        />

        <Path
          d="M182 97 Q190 90 198 97"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          opacity={0.65}
          fill="none"
        />
      </G>
    </G>
  );
}

export default React.memo(SaheliShuttle);
