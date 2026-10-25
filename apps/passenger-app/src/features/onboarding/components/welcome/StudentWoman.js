
import React from "react";

import {
  Ellipse,
  G,
  Path,
} from "react-native-svg";

const C = {
  skinLight: "#DFAD8F",
};

function StudentWoman() {
  return (
    <G transform="translate(273 104)">
      {/* Ground shadow */}
      <Ellipse
        cx="37"
        cy="170"
        rx="33"
        ry="6"
        fill="#47364B"
        opacity={0.12}
      />

      {/* Backpack */}
      <Path
        d="M51 79 Q74 76 76 100
           V137 Q75 146 61 145
           L51 128Z"
        fill="#5A4A74"
      />

      <Path
        d="M57 86 Q70 97 68 123"
        stroke="#A999BE"
        strokeWidth="3"
        fill="none"
      />

      <Path
        d="M70 108 V135"
        stroke="#3D3555"
        strokeWidth="1.5"
        opacity={0.45}
      />

      {/* Trousers */}
      <Path
        d="M27 133 L24 168"
        stroke="#4B5066"
        strokeWidth="12"
        strokeLinecap="round"
      />

      <Path
        d="M47 133 L51 168"
        stroke="#4B5066"
        strokeWidth="12"
        strokeLinecap="round"
      />

      {/* Kurta */}
      <Path
        d="M24 63 Q37 57 50 65
           Q63 77 63 94
           L66 140 H9
           L12 94 Q12 75 24 63Z"
        fill="url(#sageKurta)"
      />

      {/* Fabric folds */}
      <Path
        d="M35 81 V137"
        stroke="#C2D9D0"
        strokeWidth="1.5"
        opacity={0.7}
      />

      <Path
        d="M18 102 Q23 122 17 139"
        stroke="#628E82"
        strokeWidth="1.5"
        fill="none"
        opacity={0.5}
      />

      <Path
        d="M54 104 Q50 125 58 139"
        stroke="#D4E3DC"
        strokeWidth="1.5"
        fill="none"
        opacity={0.6}
      />

      {/* Arms */}
      <Path
        d="M15 88 L8 119 L17 130"
        stroke={C.skinLight}
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      <Path
        d="M58 88 L66 113 L57 123"
        stroke={C.skinLight}
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Hijab outer layer */}
      <Path
        d="M19 30 Q18 5 37 5
           Q57 5 62 30 L65 88
           Q51 96 36 85
           Q20 96 11 86Z"
        fill="url(#hijabFabric)"
      />

      {/* Face */}
      <Path
        d="M24 26 Q37 12 52 27
           V46 Q49 62 37 63
           Q24 61 22 46Z"
        fill={C.skinLight}
      />

      {/* Hijab framing */}
      <Path
        d="M20 36 Q17 14 35 10
           Q54 8 58 29
           L55 48 Q50 39 49 25
           Q37 31 23 30
           L21 49Z"
        fill="#655076"
      />

      {/* Hijab fabric details */}
      <Path
        d="M23 21 Q36 12 49 24"
        stroke="#A18BAE"
        strokeWidth="1.8"
        opacity={0.6}
        fill="none"
      />

      {/* Neck covering */}
      <Path
        d="M22 49 Q34 72 53 50
           L61 93 Q42 100 28 82
           L12 98 L16 65Z"
        fill="#79658D"
      />

      <Path
        d="M25 63 Q39 84 52 67"
        stroke="#A691B3"
        strokeWidth="1.6"
        fill="none"
        opacity={0.55}
      />

      {/* Eyes */}
      <Path
        d="M29 39 H32 M44 39 H47"
        stroke="#60443F"
        strokeWidth="1.9"
        strokeLinecap="round"
      />

      {/* Smile */}
      <Path
        d="M32 51 Q38 55 44 50"
        stroke="#A66E62"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Shoes */}
      <Path
        d="M16 170 H31 M45 170 H61"
        stroke="#383047"
        strokeWidth="8"
        strokeLinecap="round"
      />
    </G>
  );
}

export default React.memo(StudentWoman);
