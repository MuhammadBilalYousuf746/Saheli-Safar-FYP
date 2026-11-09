import { colors } from "../../../../theme/colors";

import React from "react";

import Svg, {
  Circle,
  Ellipse,
  G,
  Path,
  Rect,
} from "react-native-svg";

export default function RegistrationArtwork() {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 350 225"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Soft illustration backdrop */}
      <Path
        d="M44 106 C47 47 116 16 182 22
           C256 28 316 70 309 139
           C303 194 247 207 178 201
           C91 193 39 164 44 106Z"
        fill={colors.artwork.backdropAlt}
      />

      <Path
        d="M76 75 C126 24 247 32 291 108"
        stroke={colors.artwork.highlight}
        strokeWidth="2"
        strokeDasharray="5 7"
        fill="none"
        opacity="0.9"
      />

      {/* Faint Karachi buildings */}
      <G opacity="0.65">
        <Rect x="57" y="118" width="38" height="68" rx="3" fill={colors.artwork.paperLight} />
        <Rect x="88" y="101" width="32" height="85" rx="3" fill={colors.artwork.paperLight} />
        <Rect x="116" y="130" width="32" height="56" rx="3" fill={colors.artwork.backdropAlt} />
        <Rect x="242" y="112" width="37" height="74" rx="3" fill={colors.artwork.paperLight} />
        <Rect x="276" y="133" width="28" height="53" rx="3" fill={colors.artwork.backdropAlt} />

        <G fill={colors.artwork.backdropAlt}>
          <Rect x="68" y="130" width="7" height="9" rx="1" />
          <Rect x="81" y="130" width="7" height="9" rx="1" />
          <Rect x="68" y="149" width="7" height="9" rx="1" />
          <Rect x="99" y="115" width="7" height="9" rx="1" />
          <Rect x="99" y="134" width="7" height="9" rx="1" />
          <Rect x="252" y="127" width="7" height="9" rx="1" />
          <Rect x="265" y="127" width="7" height="9" rx="1" />
          <Rect x="252" y="145" width="7" height="9" rx="1" />
          <Rect x="286" y="148" width="7" height="9" rx="1" />
        </G>
      </G>

      {/* Ground */}
      <Ellipse
        cx="180"
        cy="193"
        rx="121"
        ry="10"
        fill={colors.artwork.paperLight}
        opacity="0.6"
      />

      {/* Woman - clothing */}
      <Path
        d="M160 120 C145 120 137 132 134 153
           L125 194 Q176 209 225 194
           L215 148 C211 130 198 120 189 119Z"
        fill={colors.artwork.purple}
      />

      <Path
        d="M155 130 C149 150 147 171 150 196"
        stroke={colors.artwork.rose}
        strokeWidth="2"
        fill="none"
      />

      <Path
        d="M194 131 C204 150 203 174 207 196"
        stroke={colors.artwork.rose}
        strokeWidth="2"
        fill="none"
      />

      {/* Neck */}
      <Rect x="166" y="102" width="18" height="27" rx="8" fill="#DDA78E" />

      {/* Hijab */}
      <Path
        d="M150 93 C145 61 161 48 179 48
           C204 47 214 67 211 96
           C208 114 208 133 225 159
           C207 163 196 150 187 134
           L155 136 C147 119 146 105 150 93Z"
        fill="#47344F"
      />

      {/* Face */}
      <Path
        d="M158 80 C161 66 171 61 183 65
           C196 68 201 79 197 96
           C194 112 184 119 175 116
           C161 111 155 96 158 80Z"
        fill="#E9B69B"
      />

      {/* Hairline / scarf framing */}
      <Path
        d="M154 89 C155 64 170 54 187 58
           C202 61 207 77 202 89
           C196 74 188 69 180 68
           C173 79 164 83 154 89Z"
        fill="#47344F"
      />

      {/* Face details */}
      <Path
        d="M168 90 Q171 87 174 90"
        stroke="#6E4644"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />

      <Path
        d="M185 90 Q188 87 191 90"
        stroke="#6E4644"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />

      <Path
        d="M175 102 Q181 107 187 101"
        stroke="#AD6469"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />

      {/* Scarf drape */}
      <Path
        d="M153 90 C148 109 149 131 162 149
           L174 138 C161 120 161 103 162 86Z"
        fill="#654769"
      />

      <Path
        d="M201 91 C210 111 205 140 221 157
           L205 160 C187 140 190 113 195 96Z"
        fill="#604364"
      />

      {/* Arm / hand holding phone */}
      <Path
        d="M210 143 Q224 149 229 168
           L199 174 L193 164"
        stroke="#E0AC94"
        strokeWidth="13"
        strokeLinecap="round"
        fill="none"
      />

      {/* Phone */}
      <Rect x="187" y="129" width="23" height="39" rx="5" fill="#32283C" />
      <Rect x="190" y="133" width="17" height="29" rx="2" fill={colors.artwork.backdropAlt} />
      <Circle cx="198.5" cy="159" r="1.8" fill={colors.artwork.rose} />

      {/* Hand */}
      <Path
        d="M199 165 Q188 166 186 158"
        stroke="#E9B69B"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />

      {/* Decorative floral accent */}
      <G transform="translate(91 63)">
        <Ellipse cx="0" cy="-12" rx="6" ry="12" fill={colors.artwork.paperLight} />
        <Ellipse cx="12" cy="0" rx="12" ry="6" fill={colors.artwork.paperLight} />
        <Ellipse cx="0" cy="12" rx="6" ry="12" fill={colors.artwork.paperLight} />
        <Ellipse cx="-12" cy="0" rx="12" ry="6" fill={colors.artwork.paperLight} />
        <Circle cx="0" cy="0" r="6" fill={colors.artwork.backdropAlt} />

        <Path
          d="M2 19 C11 31 9 40 5 47"
          stroke={colors.artwork.mint}
          strokeWidth="2"
          fill="none"
        />
      </G>

      {/* Floating verification notification */}
      <G>
        <Rect
          x="222"
          y="52"
          width="106"
          height="52"
          rx="16"
          fill={colors.artwork.paperLight}
          opacity="0.35"
        />

        <Rect x="218" y="47" width="106" height="52" rx="16" fill={colors.artwork.paper} />
        <Circle cx="240" cy="73" r="13" fill={colors.artwork.mint} />

        <Path
          d="M234 73 L239 78 L247 68"
          stroke={colors.artwork.mint}
          strokeWidth="2.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        <Rect x="261" y="65" width="47" height="5" rx="2.5" fill={colors.artwork.purple} />
        <Rect x="261" y="77" width="33" height="4" rx="2" fill={colors.artwork.paperLight} />
      </G>

      {/* Subtle motion marks */}
      <Path
        d="M108 168 Q100 159 92 164"
        stroke={colors.artwork.rose}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      <Circle cx="288" cy="112" r="3" fill={colors.artwork.rose} />
      <Circle cx="79" cy="112" r="3" fill={colors.artwork.rose} />
    </Svg>
  );
}
