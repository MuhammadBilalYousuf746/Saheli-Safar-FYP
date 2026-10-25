
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
        <Stop offset="0%" stopColor="#F7E9EF" />
        <Stop offset="100%" stopColor="#EED6E4" />
      </LinearGradient>

      {/* Saheli Safar shuttle */}
      <LinearGradient
        id="shuttleBody"
        x1="0%"
        y1="0%"
        x2="0%"
        y2="100%"
      >
        <Stop offset="0%" stopColor="#674069" />
        <Stop offset="58%" stopColor="#552D50" />
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
        <Stop offset="0%" stopColor="#E1F0F1" />
        <Stop offset="100%" stopColor="#9BB9C9" />
      </LinearGradient>

      {/* Working woman's kurta */}
      <LinearGradient
        id="roseKurta"
        x1="0%"
        y1="0%"
        x2="100%"
        y2="100%"
      >
        <Stop offset="0%" stopColor="#CB8D9D" />
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
        <Stop offset="0%" stopColor="#A2C4B9" />
        <Stop offset="100%" stopColor="#7CA498" />
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
