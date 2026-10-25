
import React from "react";
import {
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import Svg, {
  Circle,
  Ellipse,
  G,
  Line,
  Path,
  Rect,
  Text as SvgText,
} from "react-native-svg";

import { colors } from "../../../theme/colors";
import { typography } from "../../../theme/typography";
import { spacing } from "../../../theme/spacing";

const C = {
  plum: "#552D50",
  violet: "#40335F",
  lavender: "#9473AE",
  blush: "#F4DFE5",
  coral: "#F29A9C",
  ivory: "#FCF9F6",
  peach: "#F8CEBA",
  skin: "#D99C7B",
  darkSkin: "#A96952",
  road: "#D6CBDC",
  mint: "#87B3A0",
  white: "#FFFFFF",
};

// Shared commuter vehicle illustration
function CommuterBus({ x = 0, y = 0, scale = 1 }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${scale})`}>
      <Ellipse
        cx="110"
        cy="130"
        rx="110"
        ry="12"
        fill="#40335F"
        opacity={0.12}
      />

      <Rect
        x="10"
        y="22"
        width="199"
        height="101"
        rx="21"
        fill={C.plum}
      />

      <Path
        d="M30 22 H184 Q209 22 209 47 V77 H10 V43 Q10 22 30 22Z"
        fill={C.lavender}
      />

      <Rect
        x="27"
        y="38"
        width="44"
        height="36"
        rx="7"
        fill="#DDECF0"
      />
      <Rect
        x="78"
        y="38"
        width="44"
        height="36"
        rx="7"
        fill="#DDECF0"
      />
      <Rect
        x="129"
        y="38"
        width="56"
        height="36"
        rx="7"
        fill="#DDECF0"
      />

      {/* Window highlights */}
      <Path
        d="M31 39 H66"
        stroke={C.white}
        strokeWidth="2"
        opacity={0.65}
      />
      <Path
        d="M82 39 H117"
        stroke={C.white}
        strokeWidth="2"
        opacity={0.65}
      />
      <Path
        d="M133 39 H181"
        stroke={C.white}
        strokeWidth="2"
        opacity={0.65}
      />

      {/* Passenger silhouettes */}
      <G opacity={0.2} fill={C.violet}>
        <Circle cx="55" cy="59" r="6" />
        <Path d="M45 72 Q55 61 65 72Z" />
        <Circle cx="104" cy="59" r="6" />
        <Path d="M94 72 Q104 61 114 72Z" />
      </G>

      <Path
        d="M30 27 H183"
        stroke="#F8D9E1"
        strokeWidth="2"
        opacity={0.42}
      />

      <Path
        d="M37 39 L52 39 L30 70 L27 70Z"
        fill={C.white}
        opacity={0.5}
      />
      <Path
        d="M88 39 L102 39 L80 70 L78 70Z"
        fill={C.white}
        opacity={0.45}
      />

      <Path
        d="M10 91 H209 V105 Q209 123 191 123 H29 Q10 123 10 105Z"
        fill={C.violet}
      />

      <Rect
        x="31"
        y="92"
        width="44"
        height="6"
        rx="3"
        fill={C.coral}
      />
      <Rect
        x="180"
        y="91"
        width="17"
        height="9"
        rx="4"
        fill={C.peach}
      />

      {/* Wheels */}
      <Circle cx="52" cy="124" r="15" fill="#30283E" />
      <Circle cx="52" cy="124" r="7" fill="#DBCFDE" />
      <Circle cx="165" cy="124" r="15" fill="#30283E" />
      <Circle cx="165" cy="124" r="7" fill="#DBCFDE" />
      <Circle cx="52" cy="124" r="3" fill={C.white} opacity={0.65} />
      <Circle cx="165" cy="124" r="3" fill={C.white} opacity={0.65} />

      <Rect
        x="90"
        y="103"
        width="34"
        height="3"
        rx="1.5"
        fill="#E3B5CB"
        opacity={0.65}
      />
    </G>
  );
}

// SCREEN 1 — Women-focused commuting
function WomenCommuteIllustration() {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 360 310"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Background composition */}
      <Circle cx="180" cy="150" r="133" fill="#F5DEE5" />
      <Circle cx="280" cy="65" r="37" fill="#E8CCDD" />
      <Circle cx="68" cy="81" r="12" fill={C.coral} />

      {/* Botanical accents */}
      <G
        stroke="#A7BBA7"
        strokeWidth="3"
        fill="none"
        opacity={0.85}
        strokeLinecap="round"
      >
        <Path d="M302 241 Q305 213 310 193" />
        <Path d="M308 222 Q294 209 294 201" />
        <Path d="M309 211 Q322 199 324 188" />
      </G>

      <G fill="#A7BBA7" opacity={0.78}>
        <Ellipse
          cx="294"
          cy="203"
          rx="7"
          ry="13"
          transform="rotate(-34 294 203)"
        />
        <Ellipse
          cx="323"
          cy="193"
          rx="7"
          ry="13"
          transform="rotate(35 323 193)"
        />
      </G>

      {/* City skyline */}
      <G opacity={0.62}>
        <Rect x="33" y="128" width="43" height="98" rx="5" fill="#D9BFD2" />
        <Rect x="65" y="104" width="48" height="122" rx="5" fill="#CAB4D0" />
        <Rect x="113" y="139" width="39" height="87" rx="5" fill="#D9BFD2" />
        <Rect x="234" y="121" width="45" height="105" rx="5" fill="#CAB4D0" />
        <Rect x="275" y="148" width="42" height="78" rx="5" fill="#D9BFD2" />

        {Array.from({ length: 4 }, (_, i) => (
          <G key={i}>
            <Rect
              x={78}
              y={119 + i * 22}
              width="9"
              height="11"
              rx="2"
              fill={C.ivory}
            />
            <Rect
              x={94}
              y={119 + i * 22}
              width="9"
              height="11"
              rx="2"
              fill={C.ivory}
            />
          </G>
        ))}
      </G>

      {/* Ground */}
      <Ellipse cx="180" cy="259" rx="157" ry="31" fill="#D6CAD8" />
      <Path
        d="M25 247 Q180 229 335 247"
        stroke={C.white}
        strokeWidth="3"
        fill="none"
        opacity={0.65}
      />

      <CommuterBus x={82} y={121} scale={1.05} />

      {/* Woman commuter */}
      <G transform="translate(27 117)">
        <Path
          d="M30 45 Q9 30 18 10 Q27 -4 43 5 Q57 17 45 49Z"
          fill="#33243A"
        />
        <Ellipse cx="34" cy="24" rx="15" ry="19" fill={C.skin} />
        <Path
          d="M17 21 Q16 0 35 1 Q53 2 50 22 L40 11 Q34 26 17 21Z"
          fill="#33243A"
        />

        {/* Face details */}
        <Path
          d="M40 32 Q37 35 34 32"
          stroke="#8A4F45"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M28 24 H29 M39 24 H40"
          stroke="#33243A"
          strokeWidth="2.1"
          strokeLinecap="round"
        />

        {/* Clothing */}
        <Path
          d="M20 50 Q33 39 47 50 L57 111 H9Z"
          fill={C.coral}
        />
        <Path
          d="M22 58 Q34 52 46 58"
          stroke="#FFD2CE"
          strokeWidth="2"
          opacity={0.8}
          fill="none"
        />
        <Path
          d="M35 69 V106"
          stroke="#D77F8E"
          strokeWidth="1.5"
          opacity={0.45}
        />
        <Circle cx="35" cy="83" r="2" fill="#FFCFD0" />

        <Path
          d="M14 64 L3 96"
          stroke={C.skin}
          strokeWidth="11"
          strokeLinecap="round"
        />
        <Path
          d="M48 66 L66 91"
          stroke={C.skin}
          strokeWidth="11"
          strokeLinecap="round"
        />

        {/* Handbag */}
        <Rect x="52" y="88" width="29" height="32" rx="6" fill={C.plum} />
        <Path
          d="M59 92 Q59 79 66 79 Q75 79 75 92"
          stroke={C.plum}
          strokeWidth="5"
          fill="none"
        />

        <Path
          d="M20 110 L17 155 M44 110 L47 155"
          stroke="#433354"
          strokeWidth="13"
          strokeLinecap="round"
        />
        <Path
          d="M7 156 H23 M41 156 H58"
          stroke="#302638"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </G>

      {/* Decorative approval symbol */}
      <Circle cx="313" cy="218" r="22" fill={C.ivory} />
      <Path
        d="M303 218 L310 225 L323 211"
        stroke={C.plum}
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// SCREEN 2 — Scheduled route discovery
function ScheduledTravelIllustration() {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 360 310"
      preserveAspectRatio="xMidYMid meet"
    >
      <Rect
        x="21"
        y="18"
        width="318"
        height="272"
        rx="32"
        fill="#EEE7F0"
      />

      {/* Neighborhood blocks */}
      <G fill="#D9CADF">
        <Rect x="39" y="34" width="89" height="57" rx="10" />
        <Rect x="143" y="34" width="71" height="57" rx="10" />
        <Rect x="230" y="34" width="91" height="57" rx="10" />
        <Rect x="39" y="107" width="72" height="85" rx="10" />
        <Rect x="127" y="107" width="95" height="85" rx="10" />
        <Rect x="239" y="107" width="82" height="85" rx="10" />
        <Rect x="39" y="208" width="102" height="60" rx="10" />
        <Rect x="157" y="208" width="72" height="60" rx="10" />
        <Rect x="245" y="208" width="76" height="60" rx="10" />
      </G>

      {/* Green spaces */}
      <Rect x="48" y="43" width="66" height="39" rx="7" fill="#C7D9C8" />
      <Rect x="252" y="220" width="57" height="35" rx="7" fill="#C7D9C8" />

      <G fill="#A4BAAA" opacity={0.8}>
        <Circle cx="59" cy="59" r="7" />
        <Circle cx="83" cy="59" r="6" />
        <Circle cx="273" cy="237" r="7" />
        <Circle cx="293" cy="238" r="6" />
      </G>

      {/* Building details */}
      <G fill="#F8F2FA" opacity={0.45}>
        <Rect x="152" y="50" width="24" height="4" rx="2" />
        <Rect x="152" y="62" width="38" height="4" rx="2" />
        <Rect x="51" y="129" width="28" height="4" rx="2" />
        <Rect x="51" y="141" width="38" height="4" rx="2" />
      </G>

      {/* Roads */}
      <Path
        d="M120 19 V291 M230 19 V291 M21 99 H339 M21 200 H339"
        stroke={C.ivory}
        strokeWidth="13"
      />

      {/* Route outline */}
      <Path
        d="M69 65 H121 V154 Q121 176 145 176 H229 V235 H290"
        stroke={C.white}
        strokeWidth="15"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Main route */}
      <Path
        d="M69 65 H121 V154 Q121 176 145 176 H229 V235 H290"
        stroke={C.plum}
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Stop markers */}
      <Circle cx="69" cy="65" r="14" fill={C.white} />
      <Circle cx="69" cy="65" r="8" fill={C.mint} />
      <Circle cx="69" cy="65" r="3" fill={C.white} />

      <Circle cx="229" cy="176" r="11" fill={C.white} />
      <Circle cx="229" cy="176" r="5" fill={C.coral} />

      <Circle cx="290" cy="235" r="15" fill={C.white} />
      <Circle cx="290" cy="235" r="9" fill={C.plum} />
      <Circle cx="290" cy="235" r="3" fill={C.white} />

      {/* Shuttle location marker */}
      <G transform="translate(101 124)">
        <Circle cx="24" cy="24" r="27" fill={C.white} />
        <Rect x="9" y="12" width="30" height="24" rx="7" fill={C.plum} />
        <Rect x="13" y="15" width="22" height="10" rx="3" fill="#CFDCEB" />
        <Circle cx="15" cy="37" r="3" fill="#383044" />
        <Circle cx="33" cy="37" r="3" fill="#383044" />
      </G>

      {/* Route labels */}
      <G>
        <Rect x="39" y="20" width="111" height="27" rx="13" fill={C.white} />
        <SvgText
          x="94"
          y="38"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill={C.plum}
        >
          PICKUP
        </SvgText>
      </G>

      <G>
        <Rect x="225" y="257" width="104" height="27" rx="13" fill={C.white} />
        <SvgText
          x="277"
          y="275"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill={C.plum}
        >
          DROP-OFF
        </SvgText>
      </G>
    </Svg>
  );
}

// SCREEN 3 — Driver and vehicle information
function TravelConfidenceIllustration() {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 360 310"
      preserveAspectRatio="xMidYMid meet"
    >
      <Circle cx="169" cy="144" r="124" fill="#F4E1E7" />
      <Circle cx="277" cy="61" r="33" fill="#E2D4EC" />

      {/* Driver profile card */}
      <G transform="translate(100 29)">
        <Rect x="0" y="0" width="161" height="214" rx="24" fill={C.white} />
        <Rect x="10" y="10" width="141" height="141" rx="20" fill="#EDE4EF" />

        {/* Hair and face */}
        <Path
          d="M42 142 Q49 100 82 101 Q114 101 122 142Z"
          fill={C.plum}
        />
        <Path
          d="M57 76 Q36 52 51 28 Q64 8 90 17 Q112 27 108 61 L111 102 H52Z"
          fill="#33243A"
        />
        <Ellipse cx="81" cy="69" rx="29" ry="36" fill={C.darkSkin} />
        <Path
          d="M51 58 Q47 22 76 19 Q108 19 109 54 Q91 52 81 37 Q73 53 51 58Z"
          fill="#33243A"
        />

        {/* Facial details */}
        <Path
          d="M70 86 Q81 96 92 85"
          stroke="#874739"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M63 68 H67 M94 68 H98"
          stroke="#563345"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <Path
          d="M58 55 Q63 51 70 55 M92 55 Q99 51 104 56"
          stroke="#563345"
          strokeWidth="2"
          fill="none"
          opacity={0.72}
        />
        <Path
          d="M79 69 Q76 79 82 79"
          stroke="#985E4D"
          strokeWidth="1.5"
          fill="none"
          opacity={0.75}
        />

        {/* Clothing */}
        <Path
          d="M51 127 Q82 110 111 127 L123 151 H40Z"
          fill={C.lavender}
        />

        {/* Profile information */}
        <Rect x="25" y="164" width="111" height="10" rx="5" fill="#D9D0E0" />
        <Rect x="44" y="184" width="73" height="7" rx="3.5" fill="#E9E3EA" />
        <Circle cx="119" cy="168" r="4" fill="#86B4A1" />
      </G>

      {/* Verification mark */}
      <G>
        <Circle cx="258" cy="188" r="30" fill={C.mint} />
        <Circle cx="258" cy="188" r="24" fill={C.white} />
        <Path
          d="M246 188 L254 197 L270 179"
          stroke="#398269"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>

      {/* Vehicle in foreground */}
      <G transform="translate(20 189)">
        <Ellipse
          cx="93"
          cy="77"
          rx="91"
          ry="13"
          fill="#40335F"
          opacity={0.12}
        />

        <Path
          d="M15 43 L36 14 Q42 8 56 8 H116 Q130 8 140 24 L160 44 Q177 49 177 61 V68 H5 V58 Q5 46 15 43Z"
          fill={C.plum}
        />

        <Path
          d="M42 19 H115 Q125 19 131 33 L139 43 H24Z"
          fill="#D9E8EC"
        />

        <Path d="M85 20 V43" stroke={C.plum} strokeWidth="5" />

        {/* Window highlights */}
        <Path
          d="M44 23 H70 M91 23 H112"
          stroke={C.white}
          strokeWidth="2"
          opacity={0.65}
        />

        <Path
          d="M10 57 H168"
          stroke="#AD7E9F"
          strokeWidth="2.5"
          opacity={0.58}
        />

        <Rect x="13" y="53" width="18" height="8" rx="4" fill={C.peach} />
        <Rect x="151" y="53" width="17" height="8" rx="4" fill={C.peach} />

        <Circle cx="45" cy="68" r="15" fill="#30283E" />
        <Circle cx="45" cy="68" r="7" fill="#DDD3DF" />
        <Circle cx="137" cy="68" r="15" fill="#30283E" />
        <Circle cx="137" cy="68" r="7" fill="#DDD3DF" />
      </G>

      {/* Journey trail */}
      <Path
        d="M278 99 Q319 126 308 170"
        stroke={C.coral}
        strokeWidth="4"
        strokeDasharray="6 9"
        fill="none"
        strokeLinecap="round"
      />
      <Circle cx="278" cy="99" r="7" fill={C.coral} />
    </Svg>
  );
}

const ILLUSTRATIONS = {
  womenCommute: WomenCommuteIllustration,
  scheduledTravel: ScheduledTravelIllustration,
  travelConfidence: TravelConfidenceIllustration,
};

export default function OnboardingSlide({
  eyebrow,
  title,
  description,
  illustration,
}) {
  const { height } = useWindowDimensions();
  const compact = height < 740;

  const Illustration =
    ILLUSTRATIONS[illustration] || WomenCommuteIllustration;

  return (
    <View style={styles.container}>
      <View style={styles.artSection}>
        <View style={styles.illustrationFrame}>
          <Illustration />
        </View>
      </View>

      <View style={styles.contentSection}>
        {!!eyebrow && (
          <View style={styles.eyebrowRow}>
            <View style={styles.eyebrowDot} />
            <Text style={styles.eyebrow}>{eyebrow}</Text>
          </View>
        )}

        <Text
          style={[
            styles.title,
            compact && styles.compactTitle,
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.description,
            compact && styles.compactDescription,
          ]}
        >
          {description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    minHeight: 0,
  },

  artSection: {
    flex: 1.55,
    minHeight: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  illustrationFrame: {
    width: "100%",
    height: "100%",
    maxHeight: 360,
    alignItems: "center",
    justifyContent: "center",
  },

  contentSection: {
    flex: 0.95,
    minHeight: 0,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: spacing.sm,
  },

  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },

  eyebrowDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.coral,
  },

  eyebrow: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.xs,
    letterSpacing: typography.letterSpacing.wide,
    color: colors.primaryLight,
  },

  title: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.fontSize.display,
    lineHeight: typography.lineHeight.display,
    color: colors.primaryDark,
    textAlign: "center",
    letterSpacing: -0.7,
    includeFontPadding: false,
  },

  compactTitle: {
    fontSize: 27,
    lineHeight: 35,
  },

  description: {
    marginTop: spacing.md,
    maxWidth: 310,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.base,
    color: colors.textSecondary,
    textAlign: "center",
    includeFontPadding: false,
  },

  compactDescription: {
    marginTop: spacing.xs,
    lineHeight: typography.lineHeight.sm,
  },
});
