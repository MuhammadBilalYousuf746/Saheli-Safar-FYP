import React from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { iconPaths } from "./phosphor-paths";
import { colors } from "../../theme/colors";

// One local, MIT-licensed Phosphor Duotone family. Labels belong to the
// enclosing control; no native accessibility props are forwarded to Svg.
export default function SaheliIcon({ name, size = 24, color = colors.primaryLight, secondary = color }) {
  const paths = iconPaths[name];
  if (!paths) throw new Error(`Unknown Saheli icon: ${name}`);
  return <View aria-hidden={true} style={{ width: size, height: size, flexShrink: 0 }}>
    <Svg width={size} height={size} viewBox="0 0 256 256">
      {paths.map((path, index) => <Path key={index} d={path.d} fill={path.opacity < 1 ? secondary : color} opacity={path.opacity < 1 ? 0.28 : 1} />)}
    </Svg>
  </View>;
}
