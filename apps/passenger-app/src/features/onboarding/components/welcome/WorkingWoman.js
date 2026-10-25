
import React from "react";

import {
  Circle,
  Ellipse,
  G,
  Path,
  Rect,
} from "react-native-svg";

const C = {
  skinWarm: "#C68967",
  hair: "#30263A",
  navy: "#46506B",
};

function WorkingWoman() {
  return (
    <G transform="translate(31 91)">
      {/* Ground shadow */}
      <Ellipse
        cx="39"
        cy="183"
        rx="31"
        ry="6"
        fill="#47364B"
        opacity={0.12}
      />

      {/* Hair behind shoulders */}
      <Path
        d="M31 15 Q17 15 15 37
           L13 75 Q29 86 54 75
           L55 37 Q53 15 31 15Z"
        fill={C.hair}
      />

      {/* Neck */}
      <Rect
        x="29"
        y="57"
        width="17"
        height="17"
        rx="6"
        fill={C.skinWarm}
      />

      {/* Face */}
      <Ellipse
        cx="37"
        cy="39"
        rx="19"
        ry="25"
        fill={C.skinWarm}
      />

      {/* Subtle face lighting */}
      <Ellipse
        cx="29"
        cy="40"
        rx="5"
        ry="12"
        fill="#E7B08E"
        opacity={0.22}
      />

      {/* Hairline */}
      <Path
        d="M18 37 Q14 16 30 11
           Q47 6 57 27 L55 46
           Q49 33 44 27
           Q37 37 18 37Z"
        fill={C.hair}
      />

      <Path
        d="M24 22 Q35 13 47 21"
        stroke="#554052"
        strokeWidth="2.2"
        fill="none"
        opacity={0.55}
      />

      {/* Earrings */}
      <Circle cx="19" cy="46" r="3.8" fill={C.skinWarm} />
      <Circle cx="55" cy="46" r="3.8" fill={C.skinWarm} />
      <Circle cx="55" cy="48" r="1.7" fill="#F3C48E" />

      {/* Eyes */}
      <Path
        d="M25 43 H28 M46 43 H49"
        stroke="#51343C"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Nose */}
      <Path
        d="M38 45 L36 52 L40 52"
        stroke="#A36B54"
        strokeWidth="1.4"
        fill="none"
      />

      {/* Smile */}
      <Path
        d="M31 57 Q38 62 45 56"
        stroke="#95534B"
        strokeWidth="1.7"
        strokeLinecap="round"
        fill="none"
      />

      {/* Kurta */}
      <Path
        d="M27 70 Q38 76 48 70
           Q62 74 66 92
           L60 149 H13 L9 95
           Q12 77 27 70Z"
        fill="url(#roseKurta)"
      />

      {/* Kurta side shadows */}
      <Path
        d="M15 100 Q18 126 13 148 H22
           Q24 128 22 106Z"
        fill="#965C72"
        opacity={0.24}
      />

      <Path
        d="M53 107 Q58 130 53 149 H60
           L63 111Z"
        fill="#884F66"
        opacity={0.2}
      />

      {/* Shirt seam */}
      <Path
        d="M37 78 V114"
        stroke="#E6A8B2"
        strokeWidth="1.8"
        opacity={0.7}
      />

      <Circle cx="37" cy="90" r="1.8" fill="#F6D7D5" />
      <Circle cx="37" cy="101" r="1.8" fill="#F6D7D5" />

      {/* Dupatta */}
      <Path
        d="M20 75 Q30 82 40 76
           Q51 83 58 75
           L52 120 Q42 129 33 126
           L26 95 L18 136 L10 134Z"
        fill="#F1C5C9"
        opacity={0.88}
      />

      {/* Dupatta fabric folds */}
      <Path
        d="M19 84 Q22 108 15 130"
        stroke="#D999A9"
        strokeWidth="1.5"
        fill="none"
        opacity={0.68}
      />

      <Path
        d="M46 84 Q51 103 48 120"
        stroke="#FFFFFF"
        strokeWidth="1.6"
        fill="none"
        opacity={0.52}
      />

      {/* Arms */}
      <Path
        d="M12 88 L4 120 L19 128"
        stroke={C.skinWarm}
        strokeWidth="10"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <Path
        d="M62 89 L72 116 L62 127"
        stroke={C.skinWarm}
        strokeWidth="10"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Trousers */}
      <Path
        d="M21 148 L20 180"
        stroke={C.navy}
        strokeWidth="13"
        strokeLinecap="round"
      />

      <Path
        d="M51 148 L53 180"
        stroke={C.navy}
        strokeWidth="13"
        strokeLinecap="round"
      />

      {/* Shoes */}
      <Path
        d="M11 181 H29 M47 181 H63"
        stroke="#35293D"
        strokeWidth="8"
        strokeLinecap="round"
      />

      {/* Shoulder bag strap */}
      <Path
        d="M57 80 Q80 87 78 111"
        stroke="#563C55"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Handbag */}
      <Path
        d="M67 109 Q66 104 73 103 H87
           Q94 104 94 111 L92 140
           Q91 144 86 144 H71
           Q66 144 66 138Z"
        fill="#59415A"
      />

      <Path
        d="M71 118 H90"
        stroke="#93768F"
        strokeWidth="1.4"
        opacity={0.55}
      />

      <Rect
        x="75"
        y="112"
        width="9"
        height="3"
        rx="1.5"
        fill="#E5BBC8"
      />
    </G>
  );
}

export default React.memo(WorkingWoman);
