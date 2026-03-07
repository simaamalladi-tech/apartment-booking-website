import React from 'react';
import './BerlinSkyline.css';

function BerlinSkyline() {
  return (
    <div className="berlin-skyline">
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        className="skyline-svg"
      >
        {/* Sky gradient background */}
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#667eea" />
            <stop offset="100%" stopColor="#764ba2" />
          </linearGradient>
        </defs>
        <rect width="1440" height="120" fill="url(#skyGrad)" />

        {/* Berlin skyline silhouette */}
        <g fill="#1a1a2e">
          {/* Far left buildings */}
          <rect x="0" y="75" width="30" height="45" />
          <rect x="35" y="65" width="25" height="55" />
          <rect x="65" y="70" width="20" height="50" />

          {/* Residential block left */}
          <rect x="95" y="60" width="40" height="60" />
          <rect x="100" y="63" width="6" height="8" fill="#667eea" opacity="0.4" />
          <rect x="110" y="63" width="6" height="8" fill="#667eea" opacity="0.3" />
          <rect x="120" y="63" width="6" height="8" fill="#667eea" opacity="0.5" />
          <rect x="100" y="75" width="6" height="8" fill="#667eea" opacity="0.3" />
          <rect x="110" y="75" width="6" height="8" fill="#667eea" opacity="0.4" />
          <rect x="120" y="75" width="6" height="8" fill="#667eea" opacity="0.2" />

          <rect x="140" y="72" width="25" height="48" />
          <rect x="170" y="80" width="20" height="40" />

          {/* Church/tower left */}
          <rect x="200" y="45" width="15" height="75" />
          <polygon points="200,45 207.5,25 215,45" />
          <rect x="220" y="68" width="35" height="52" />

          {/* Buildings approaching Fernsehturm */}
          <rect x="260" y="55" width="30" height="65" />
          <rect x="265" y="58" width="5" height="7" fill="#667eea" opacity="0.3" />
          <rect x="275" y="58" width="5" height="7" fill="#667eea" opacity="0.5" />
          <rect x="265" y="69" width="5" height="7" fill="#667eea" opacity="0.4" />
          <rect x="275" y="69" width="5" height="7" fill="#667eea" opacity="0.2" />

          <rect x="295" y="60" width="25" height="60" />
          <rect x="325" y="50" width="35" height="70" />

          {/* Tall modern building */}
          <rect x="365" y="35" width="22" height="85" />
          <rect x="370" y="38" width="4" height="6" fill="#667eea" opacity="0.3" />
          <rect x="377" y="38" width="4" height="6" fill="#667eea" opacity="0.5" />
          <rect x="370" y="48" width="4" height="6" fill="#667eea" opacity="0.4" />
          <rect x="377" y="48" width="4" height="6" fill="#667eea" opacity="0.3" />
          <rect x="370" y="58" width="4" height="6" fill="#667eea" opacity="0.2" />
          <rect x="377" y="58" width="4" height="6" fill="#667eea" opacity="0.4" />

          <rect x="392" y="65" width="28" height="55" />

          {/* Berliner Dom (Cathedral) */}
          <rect x="430" y="50" width="55" height="70" />
          <ellipse cx="457" cy="50" rx="27" ry="20" />
          <rect x="452" y="28" width="10" height="22" />
          <polygon points="452,28 457,18 462,28" />
          {/* Small dome towers */}
          <rect x="433" y="42" width="8" height="15" />
          <ellipse cx="437" cy="42" rx="5" ry="4" />
          <rect x="474" y="42" width="8" height="15" />
          <ellipse cx="478" cy="42" rx="5" ry="4" />

          <rect x="490" y="62" width="30" height="58" />

          {/* Fernsehturm (TV Tower) - center landmark */}
          <rect x="555" y="70" width="30" height="50" />
          <rect x="567" y="10" width="6" height="60" />
          <ellipse cx="570" cy="42" rx="14" ry="10" />
          <line x1="570" y1="0" x2="570" y2="10" stroke="#1a1a2e" strokeWidth="3" />
          <rect x="563" y="38" width="14" height="3" fill="#667eea" opacity="0.4" />

          {/* Buildings right of Fernsehturm */}
          <rect x="590" y="58" width="35" height="62" />
          <rect x="595" y="61" width="5" height="7" fill="#667eea" opacity="0.3" />
          <rect x="605" y="61" width="5" height="7" fill="#667eea" opacity="0.5" />
          <rect x="615" y="61" width="5" height="7" fill="#667eea" opacity="0.2" />

          <rect x="630" y="65" width="25" height="55" />
          <rect x="660" y="55" width="30" height="65" />

          {/* Rotes Rathaus (Red City Hall) area */}
          <rect x="695" y="50" width="50" height="70" />
          <rect x="710" y="35" width="10" height="15" />
          <polygon points="710,35 715,22 720,35" />
          <rect x="700" y="53" width="6" height="8" fill="#667eea" opacity="0.3" />
          <rect x="710" y="53" width="6" height="8" fill="#667eea" opacity="0.4" />
          <rect x="720" y="53" width="6" height="8" fill="#667eea" opacity="0.2" />
          <rect x="730" y="53" width="6" height="8" fill="#667eea" opacity="0.5" />

          <rect x="750" y="68" width="25" height="52" />
          <rect x="780" y="60" width="20" height="60" />

          {/* Brandenburg Gate area */}
          <rect x="810" y="55" width="60" height="65" />
          {/* Gate columns */}
          <rect x="815" y="55" width="5" height="40" />
          <rect x="825" y="55" width="5" height="40" />
          <rect x="835" y="55" width="5" height="40" />
          <rect x="845" y="55" width="5" height="40" />
          <rect x="855" y="55" width="5" height="40" />
          <rect x="810" y="52" width="60" height="5" />
          {/* Quadriga on top */}
          <rect x="830" y="42" width="15" height="10" />
          <polygon points="833,42 837,35 841,42" />

          <rect x="875" y="62" width="30" height="58" />
          <rect x="910" y="70" width="25" height="50" />

          {/* Siegessäule (Victory Column) area */}
          <rect x="945" y="72" width="20" height="48" />
          <rect x="970" y="65" width="8" height="55" />
          <rect x="966" y="60" width="16" height="8" />
          <circle cx="974" cy="52" r="6" />
          <line x1="974" y1="46" x2="974" y2="40" stroke="#1a1a2e" strokeWidth="2" />

          <rect x="985" y="68" width="30" height="52" />
          <rect x="990" y="71" width="5" height="7" fill="#667eea" opacity="0.3" />
          <rect x="1000" y="71" width="5" height="7" fill="#667eea" opacity="0.4" />

          {/* Modern buildings - Potsdamer Platz area */}
          <rect x="1020" y="45" width="25" height="75" />
          <rect x="1025" y="48" width="4" height="6" fill="#667eea" opacity="0.4" />
          <rect x="1033" y="48" width="4" height="6" fill="#667eea" opacity="0.3" />
          <rect x="1025" y="58" width="4" height="6" fill="#667eea" opacity="0.2" />
          <rect x="1033" y="58" width="4" height="6" fill="#667eea" opacity="0.5" />

          <rect x="1050" y="40" width="20" height="80" />
          <polygon points="1050,40 1060,30 1070,40" />

          <rect x="1075" y="50" width="30" height="70" />
          <rect x="1110" y="55" width="25" height="65" />

          {/* Oberbaum Bridge towers area */}
          <rect x="1140" y="60" width="12" height="60" />
          <polygon points="1140,60 1146,48 1152,60" />
          <rect x="1155" y="72" width="30" height="48" />
          <rect x="1190" y="60" width="12" height="60" />
          <polygon points="1190,60 1196,48 1202,60" />

          {/* Right side buildings */}
          <rect x="1210" y="65" width="30" height="55" />
          <rect x="1215" y="68" width="5" height="7" fill="#667eea" opacity="0.3" />
          <rect x="1225" y="68" width="5" height="7" fill="#667eea" opacity="0.4" />
          <rect x="1245" y="58" width="25" height="62" />
          <rect x="1275" y="70" width="20" height="50" />

          {/* Far right */}
          <rect x="1300" y="62" width="35" height="58" />
          <rect x="1340" y="68" width="25" height="52" />
          <rect x="1370" y="72" width="30" height="48" />
          <rect x="1405" y="65" width="35" height="55" />
        </g>

        {/* Ground line */}
        <rect x="0" y="118" width="1440" height="2" fill="#1a1a2e" />
      </svg>
    </div>
  );
}

export default BerlinSkyline;
