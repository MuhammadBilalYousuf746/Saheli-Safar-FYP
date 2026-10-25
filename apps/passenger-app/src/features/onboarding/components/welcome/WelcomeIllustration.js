
import React from "react";

import Svg, {
  Ellipse,
  Path,
} from "react-native-svg";

import IllustrationDefs from "./IllustrationDefs";
import KarachiBackdrop from "./KarachiBackdrop";
import SaheliShuttle from "./SaheliShuttle";
import WorkingWoman from "./WorkingWoman";
import StudentWoman from "./StudentWoman";

function WelcomeIllustration() {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 360 300"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Shared illustration gradients */}
      <IllustrationDefs />

      {/* Karachi-inspired buildings and trees — NOT a map */}
      <KarachiBackdrop />

      {/* Road and pavement */}
      <Ellipse
        cx="181"
        cy="269"
        rx="165"
        ry="17"
        fill="#DAD0DC"
        opacity={0.62}
      />

      <Path
        d="M24 259 Q178 246 335 259"
        stroke="#FFFFFF"
        strokeWidth="3"
        opacity={0.8}
        fill="none"
      />

      {/* Purple Saheli Safar shuttle */}
      <SaheliShuttle />

      {/* Women in foreground */}
      <WorkingWoman />
      <StudentWoman />
    </Svg>
  );
}

export default React.memo(WelcomeIllustration);
