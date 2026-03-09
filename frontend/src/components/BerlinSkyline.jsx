import React from 'react';
import './BerlinSkyline.css';

function BerlinSkyline() {
  return (
    <div className="berlin-skyline">
      <div className="skyline-gradient" />
      <svg
        className="skyline-silhouette"
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ====== STARS ====== */}
        <g className="stars">
          <circle cx="45" cy="18" r="1" fill="#fff" />
          <circle cx="120" cy="10" r="1.2" fill="#fff" />
          <circle cx="210" cy="28" r="0.8" fill="#fff" />
          <circle cx="315" cy="8" r="1" fill="#fff" />
          <circle cx="390" cy="22" r="1.1" fill="#fff" />
          <circle cx="460" cy="12" r="0.7" fill="#fff" />
          <circle cx="570" cy="20" r="1" fill="#fff" />
          <circle cx="650" cy="8" r="0.9" fill="#fff" />
          <circle cx="790" cy="15" r="1.2" fill="#fff" />
          <circle cx="870" cy="25" r="0.8" fill="#fff" />
          <circle cx="960" cy="10" r="1" fill="#fff" />
          <circle cx="1060" cy="22" r="0.7" fill="#fff" />
          <circle cx="1150" cy="6" r="1.1" fill="#fff" />
          <circle cx="1250" cy="18" r="0.9" fill="#fff" />
          <circle cx="1350" cy="12" r="1" fill="#fff" />
          <circle cx="1420" cy="28" r="0.8" fill="#fff" />
          <circle cx="160" cy="38" r="0.6" fill="#fff" />
          <circle cx="500" cy="35" r="0.7" fill="#fff" />
          <circle cx="830" cy="32" r="0.6" fill="#fff" />
          <circle cx="1100" cy="38" r="0.7" fill="#fff" />
        </g>

        {/* ====== BACKGROUND LAYER - distant buildings ====== */}
        <path
          d="M0,200 L0,148 L25,148 L25,140 L45,140 L45,145 L70,145 L70,136 L90,136 L90,142 L115,142 L115,134 L135,134 L135,140 L160,140 L160,132 L180,132 L180,138 L205,138 L205,130 L225,130 L225,136 L250,136 L250,128 L270,128 L270,134 L300,134 L300,126 L320,126 L320,132 L345,132 L345,125 L365,125 L365,130 L390,130 L390,124 L410,124 L410,128 L440,128 L440,122 L460,122 L460,126 L490,126 L490,120 L510,120 L510,124 L540,124 L540,118 L560,118 L560,122 L585,122 L585,116 L605,116 L605,122 L635,122 L635,118 L655,118 L655,124 L680,124 L680,118 L700,118 L700,114 L735,114 L735,118 L755,118 L755,124 L780,124 L780,118 L800,118 L800,122 L825,122 L825,116 L845,116 L845,122 L870,122 L870,118 L895,118 L895,124 L920,124 L920,120 L945,120 L945,126 L970,126 L970,122 L995,122 L995,128 L1020,128 L1020,124 L1050,124 L1050,130 L1075,130 L1075,126 L1100,126 L1100,132 L1130,132 L1130,128 L1155,128 L1155,134 L1185,134 L1185,130 L1210,130 L1210,136 L1240,136 L1240,132 L1270,132 L1270,138 L1300,138 L1300,134 L1330,134 L1330,140 L1360,140 L1360,136 L1385,136 L1385,142 L1410,142 L1410,148 L1440,148 L1440,200 Z"
          fill="#0d0d12"
        />

        {/* ====== FRONT LAYER - main skyline ====== */}

        {/* Left buildings (x=0 → x=455) */}
        <path
          d="M0,200 L0,152 L14,152 L14,138 L24,138 L24,132 L30,128 L36,132 L36,138 L48,138 L48,150 L58,150 L58,128 L68,128 L68,118 L76,118 L76,110 L80,106 L84,110 L84,118 L94,118 L94,132 L104,132 L104,148 L116,148 L116,130 L124,130 L124,118 L130,118 L130,110 L134,106 L138,110 L138,118 L146,118 L146,132 L156,132 L156,145 L166,145 L166,120 L172,120 L172,108 L176,100 L180,108 L180,120 L188,120 L188,142 L198,142 L198,130 L208,130 L208,120 L218,120 L218,112 L224,108 L230,112 L230,120 L240,120 L240,132 L250,132 L250,145 L262,145 L262,132 L272,132 L272,120 L282,120 L282,112 L286,108 L290,112 L290,120 L300,120 L300,138 L312,138 L312,150 L326,150 L326,132 L336,132 L336,118 L344,118 L344,105 L350,98 L356,92 L362,98 L368,105 L368,118 L374,118 L374,130 L382,130 L382,142 L394,142 L394,128 L404,128 L404,115 L414,115 L414,108 L420,108 L420,100 L424,94 L428,100 L428,108 L434,108 L434,118 L444,118 L444,128 L455,128 L455,200 Z"
          fill="#000"
        />

        {/* Berliner Dom (x=455 → x=555) with curved dome */}
        <path
          d="M455,200 L455,128 L462,128 L462,112 L468,112 L468,102 L472,102 L472,92 Q505,52 538,92 L538,102 L542,102 L542,112 L548,112 L548,128 L555,128 L555,200 Z"
          fill="#000"
        />
        {/* Dom cross */}
        <rect x="503" y="47" width="2.5" height="10" fill="#000" />
        <rect x="500" y="50" width="8" height="2" fill="#000" />
        {/* Dom side turrets */}
        <path d="M462,112 L462,100 L465,94 L468,100 L468,112 Z" fill="#000" />
        <path d="M542,112 L542,100 L545,94 L548,100 L548,112 Z" fill="#000" />

        {/* Buildings between Dom and Fernsehturm (x=555 → x=698) */}
        <path
          d="M555,200 L555,128 L565,128 L565,112 L575,112 L575,102 L585,102 L585,95 L590,92 L595,95 L595,102 L605,102 L605,115 L615,115 L615,108 L625,108 L625,98 L630,95 L635,98 L635,108 L645,108 L645,120 L655,120 L655,132 L662,132 L662,118 L672,118 L672,108 L678,108 L678,130 L688,130 L688,142 L698,142 L698,200 Z"
          fill="#000"
        />

        {/* ====== FERNSEHTURM (TV Tower) ====== */}
        {/* Antenna mast */}
        <rect x="718.5" y="6" width="3" height="44" fill="#000" />
        {/* Antenna crossbars */}
        <rect x="716" y="22" width="8" height="1.5" fill="#000" />
        <rect x="716.5" y="32" width="7" height="1.2" fill="#000" />
        {/* Main observation sphere */}
        <ellipse cx="720" cy="60" rx="16" ry="14" fill="#000" />
        {/* Lower sphere bulge (restaurant level) */}
        <ellipse cx="720" cy="66" rx="14" ry="5" fill="#000" />
        {/* Shaft below sphere — tapers downward */}
        <polygon points="713,74 727,74 723,135 717,135" fill="#000" />
        {/* Mid-shaft ring detail */}
        <ellipse cx="720" cy="88" rx="10" ry="2.5" fill="#000" />
        {/* Lower shaft */}
        <rect x="717" y="135" width="6" height="30" fill="#000" />
        {/* Base structure — widens to ground */}
        <polygon points="710,165 730,165 742,200 698,200" fill="#000" />

        {/* Buildings between Fernsehturm and Brandenburg Gate (x=742 → x=958) */}
        <path
          d="M742,200 L742,148 L752,148 L752,132 L762,132 L762,120 L772,120 L772,112 L776,108 L780,112 L780,120 L790,120 L790,105 L800,105 L800,95 L810,95 L810,88 L814,84 L818,88 L818,95 L828,95 L828,108 L838,108 L838,100 L848,100 L848,92 L852,88 L856,92 L856,100 L866,100 L866,115 L876,115 L876,128 L886,128 L886,118 L896,118 L896,105 L906,105 L906,95 L916,95 L916,105 L926,105 L926,118 L936,118 L936,132 L948,132 L948,145 L958,145 L958,200 Z"
          fill="#000"
        />

        {/* ====== BRANDENBURG GATE ====== */}
        {/* Entablature (top beam) */}
        <rect x="960" y="118" width="80" height="5" fill="#000" />
        {/* Attic section */}
        <rect x="963" y="112" width="74" height="6" fill="#000" />
        {/* Quadriga silhouette (horses + chariot on top) */}
        <path d="M988,112 L992,102 L996,106 L1000,98 L1004,106 L1008,102 L1012,112 Z" fill="#000" />
        <rect x="996" y="94" width="8" height="5" fill="#000" />
        <polygon points="998,94 1000,86 1002,94" fill="#000" />
        {/* 6 Doric columns */}
        <rect x="964" y="123" width="5" height="42" fill="#000" />
        <rect x="977" y="123" width="5" height="42" fill="#000" />
        <rect x="990" y="123" width="5" height="42" fill="#000" />
        <rect x="1003" y="123" width="5" height="42" fill="#000" />
        <rect x="1016" y="123" width="5" height="42" fill="#000" />
        <rect x="1029" y="123" width="5" height="42" fill="#000" />
        {/* Base / steps */}
        <rect x="958" y="165" width="84" height="35" fill="#000" />

        {/* Right buildings (x=1042 → x=1440) */}
        <path
          d="M1042,200 L1042,145 L1052,145 L1052,130 L1062,130 L1062,118 L1072,118 L1072,106 L1082,106 L1082,95 L1092,95 L1092,86 L1096,82 L1100,86 L1100,95 L1110,95 L1110,108 L1120,108 L1120,98 L1130,98 L1130,90 L1140,90 L1140,98 L1150,98 L1150,110 L1162,110 L1162,122 L1175,122 L1175,108 L1185,108 L1185,98 L1190,95 L1195,98 L1195,108 L1205,108 L1205,122 L1218,122 L1218,135 L1228,135 L1228,125 L1238,125 L1238,112 L1248,112 L1248,125 L1260,125 L1260,138 L1272,138 L1272,128 L1282,128 L1282,118 L1286,114 L1290,118 L1290,128 L1302,128 L1302,140 L1318,140 L1318,132 L1328,132 L1328,142 L1342,142 L1342,136 L1352,136 L1352,145 L1368,145 L1368,138 L1378,138 L1378,148 L1392,148 L1392,142 L1402,142 L1402,150 L1415,150 L1415,145 L1425,145 L1425,152 L1435,152 L1435,158 L1440,158 L1440,200 Z"
          fill="#000"
        />

        {/* ====== WINDOW LIGHTS ====== */}
        <g className="windows">
          {/* Left section */}
          <rect x="66" y="120" width="4" height="4" fill="#ffc864" opacity="0.7" />
          <rect x="73" y="120" width="4" height="4" fill="#ffc864" opacity="0.5" />
          <rect x="66" y="127" width="4" height="4" fill="#ffc864" opacity="0.6" />
          <rect x="122" y="122" width="4" height="4" fill="#ffc864" opacity="0.7" />
          <rect x="129" y="122" width="4" height="4" fill="#ffc864" opacity="0.5" />
          <rect x="129" y="129" width="4" height="4" fill="#ffc864" opacity="0.6" />
          <rect x="170" y="112" width="4" height="4" fill="#ffc864" opacity="0.7" />
          <rect x="220" y="114" width="4" height="4" fill="#ffc864" opacity="0.6" />
          <rect x="227" y="114" width="4" height="4" fill="#ffc864" opacity="0.5" />
          <rect x="220" y="121" width="4" height="4" fill="#ffc864" opacity="0.7" />
          <rect x="274" y="123" width="4" height="4" fill="#ffc864" opacity="0.6" />
          <rect x="281" y="123" width="4" height="4" fill="#ffc864" opacity="0.7" />
          <rect x="338" y="124" width="4" height="4" fill="#ffc864" opacity="0.5" />
          <rect x="345" y="124" width="4" height="4" fill="#ffc864" opacity="0.6" />
          <rect x="350" y="100" width="3" height="3" fill="#ffc864" opacity="0.7" />
          <rect x="416" y="102" width="4" height="4" fill="#ffc864" opacity="0.6" />
          <rect x="423" y="102" width="4" height="4" fill="#ffc864" opacity="0.5" />
          <rect x="416" y="109" width="4" height="4" fill="#ffc864" opacity="0.7" />
          {/* Center section */}
          <rect x="569" y="106" width="4" height="4" fill="#ffc864" opacity="0.6" />
          <rect x="589" y="96" width="3" height="3" fill="#ffc864" opacity="0.7" />
          <rect x="629" y="102" width="4" height="4" fill="#ffc864" opacity="0.5" />
          <rect x="665" y="122" width="4" height="4" fill="#ffc864" opacity="0.6" />
          {/* TV tower sphere observation lights */}
          <circle cx="708" cy="58" r="1.5" fill="#ffc864" opacity="0.5" />
          <circle cx="712" cy="54" r="1.5" fill="#ffc864" opacity="0.4" />
          <circle cx="720" cy="51" r="1.5" fill="#ffc864" opacity="0.6" />
          <circle cx="728" cy="54" r="1.5" fill="#ffc864" opacity="0.4" />
          <circle cx="732" cy="58" r="1.5" fill="#ffc864" opacity="0.5" />
          {/* Right of tower */}
          <rect x="802" y="98" width="4" height="4" fill="#ffc864" opacity="0.6" />
          <rect x="809" y="98" width="4" height="4" fill="#ffc864" opacity="0.7" />
          <rect x="842" y="94" width="4" height="4" fill="#ffc864" opacity="0.5" />
          <rect x="849" y="94" width="4" height="4" fill="#ffc864" opacity="0.6" />
          <rect x="899" y="108" width="4" height="4" fill="#ffc864" opacity="0.7" />
          <rect x="909" y="98" width="4" height="4" fill="#ffc864" opacity="0.6" />
          {/* Far right */}
          <rect x="1085" y="98" width="4" height="4" fill="#ffc864" opacity="0.7" />
          <rect x="1092" y="98" width="4" height="4" fill="#ffc864" opacity="0.5" />
          <rect x="1133" y="94" width="4" height="4" fill="#ffc864" opacity="0.6" />
          <rect x="1140" y="94" width="4" height="4" fill="#ffc864" opacity="0.7" />
          <rect x="1178" y="112" width="4" height="4" fill="#ffc864" opacity="0.5" />
          <rect x="1242" y="118" width="4" height="4" fill="#ffc864" opacity="0.6" />
          <rect x="1286" y="122" width="4" height="4" fill="#ffc864" opacity="0.7" />
        </g>

        {/* ====== TV TOWER RED LIGHT ====== */}
        <circle cx="720" cy="6" r="3" fill="#ff2200" className="tower-light" />
        <circle cx="720" cy="6" r="8" fill="#ff2200" className="tower-glow" opacity="0.15" />

        {/* Bottom fill — no gap to next section */}
        <rect x="0" y="192" width="1440" height="8" fill="#000" />
      </svg>
    </div>
  );
}

export default BerlinSkyline;
