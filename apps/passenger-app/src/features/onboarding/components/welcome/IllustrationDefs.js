import { colors } from "../../../../theme/colors";

import React from "react";

import {
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";

export default function IllustrationDefs() {
  return (
    <Defs>
      {/* Illustration background */}
      <LinearGradient
        id="sceneBlush"
        x1="0%"
        y1="0%"
        x2="100%"
        y2="100%"
      >
        <Stop offset="0%" stopColor={colors.artwork.backdropAlt} />
        <Stop offset="100%" stopColor={colors.artwork.backdropAlt} />
      </LinearGradient>

      {/* Saheli Safar shuttle */}
      <LinearGradient
        id="shuttleBody"
        x1="0%"
        y1="0%"
        x2="0%"
        y2="100%"
      >
        <Stop offset="0%" stopColor={colors.artwork.purple} />
        <Stop offset="58%" stopColor={colors.artwork.purple} />
        <Stop offset="100%" stopColor="#3A253F" />
      </LinearGradient>

      {/* Vehicle windows */}
      <LinearGradient
        id="vehicleGlass"
        x1="0%"
        y1="0%"
        x2="100%"
        y2="100%"
      >
        <Stop offset="0%" stopColor={colors.artwork.window} />
        <Stop offset="100%" stopColor="#47566E" />
      </LinearGradient>

      {/* Working woman's kurta */}
      <LinearGradient
        id="roseKurta"
        x1="0%"
        y1="0%"
        x2="100%"
        y2="100%"
      >
        <Stop offset="0%" stopColor={colors.artwork.rose} />
        <Stop offset="100%" stopColor="#A96D80" />
      </LinearGradient>

      {/* Student's kurta */}
      <LinearGradient
        id="sageKurta"
        x1="0%"
        y1="0%"
        x2="100%"
        y2="100%"
      >
        <Stop offset="0%" stopColor={colors.artwork.mint} />
        <Stop offset="100%" stopColor={colors.artwork.mint} />
      </LinearGradient>

      {/* Student's hijab */}
      <LinearGradient
        id="hijabFabric"
        x1="0%"
        y1="0%"
        x2="100%"
        y2="100%"
      >
        <Stop offset="0%" stopColor="#826B95" />
        <Stop offset="100%" stopColor="#544267" />
      </LinearGradient>
    </Defs>
  );
}
