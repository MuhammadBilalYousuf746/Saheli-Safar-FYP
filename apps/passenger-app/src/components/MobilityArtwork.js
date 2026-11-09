import React from "react";
import { View } from "react-native";
import Svg, { Circle, G, Path, Rect } from "react-native-svg";
import { colors } from "../theme/colors";

// Original Saheli route/transport composition, not an operating route or map.
export default function MobilityArtwork() {
  return <View aria-hidden={true} style={{ width: "100%", aspectRatio: 2.6 }}><Svg width="100%" height="100%" viewBox="0 0 312 120">
    <Path d="M18 98H72Q91 98 91 80V38Q91 20 110 20H267Q289 20 289 42V78" stroke={colors.primaryDark} strokeWidth={14} fill="none" strokeLinecap="round" />
    <Path d="M18 98H72Q91 98 91 80V38Q91 20 110 20H267Q289 20 289 42V78" stroke={colors.primaryLight} strokeWidth={1.5} fill="none" strokeDasharray="4 6" />
    <Circle cx={18} cy={98} r={5} fill={colors.primaryLight} /><Circle cx={289} cy={78} r={5} fill={colors.signature} />
    <G transform="translate(126 37)"><Path d="M10 6H92Q101 6 108 17L123 39V63H0V18Q0 6 10 6Z" fill={colors.primary} />
      <Path d="M10 16H86Q94 16 99 24L110 40H10Z" fill={colors.backgroundDark} /><Path d="M40 16V40M72 16V40" stroke={colors.primary} strokeWidth={4} />
      <Rect x={9} y={48} width={61} height={3} rx={1.5} fill={colors.primaryLight} /><Rect x={112} y={46} width={7} height={6} rx={2} fill={colors.textSecondary} />
      <Circle cx={25} cy={64} r={10} fill={colors.background} /><Circle cx={25} cy={64} r={4} fill={colors.textSecondary} /><Circle cx={98} cy={64} r={10} fill={colors.background} /><Circle cx={98} cy={64} r={4} fill={colors.textSecondary} />
    </G>
  </Svg></View>;
}
