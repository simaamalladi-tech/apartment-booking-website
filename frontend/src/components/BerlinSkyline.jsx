import React from 'react';
import './BerlinSkyline.css';

function BerlinSkyline() {
  return (
    <div className="berlin-skyline">
      {/* Gradient background from header purple to dark */}
      <div className="skyline-gradient" />

      {/* Berlin skyline silhouette */}
      <svg
        className="skyline-silhouette"
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Sky glow behind Fernsehturm */}
        <defs>
          <radialGradient id="towerglow" cx="50%" cy="30%" r="35%">
            <stop offset="0%" stopColor="rgba(102,126,234,0.15)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="1440" height="200" fill="url(#towerglow)" />

        {/* Buildings silhouette - left side */}
        <path d="
          M0,200
          L0,155
          L30,155 L30,140 L50,140 L50,155 L70,155 L70,130 L90,130 L90,155
          L110,155 L110,145 L130,145 L130,120 L150,120 L150,135 L170,135 L170,155
          L200,155 L200,110 L220,110 L220,100 L230,100 L230,110 L250,110 L250,145
          L280,145 L280,125 L300,125 L300,115 L310,115 L310,125 L330,125 L330,140
          L350,140 L350,105 L370,105 L370,95 L380,95 L380,105 L400,105 L400,130
          L420,130 L420,100 L440,100 L440,120 L460,120 L460,135
          L480,135 L480,110 L500,110 L500,90 L510,90 L510,110 L530,110 L530,130
          L550,130 L550,115 L570,115 L570,105 L590,105 L590,125
        " fill="#000" />

        {/* Fernsehturm (TV Tower) - center landmark */}
        {/* Antenna */}
        <rect x="717" y="8" width="2" height="55" fill="#000" />
        {/* Sphere */}
        <ellipse cx="718" cy="72" rx="14" ry="12" fill="#000" />
        {/* Sphere ring */}
        <rect x="704" y="70" width="28" height="3" rx="1" fill="#111" />
        {/* Shaft below sphere */}
        <rect x="715" y="84" width="6" height="40" fill="#000" />
        {/* Base taper */}
        <polygon points="710,124 726,124 722,155 714,155" fill="#000" />
        {/* Base building */}
        <rect x="708" y="155" width="20" height="45" fill="#000" />

        {/* Buildings around Fernsehturm */}
        <path d="
          M590,200 L590,125 L610,125 L610,110 L630,110 L630,130
          L650,130 L650,105 L660,105 L660,95 L670,95 L670,105 L690,105 L690,140
          L708,140 L708,155
        " fill="#000" />

        <path d="
          M728,155 L728,140
          L750,140 L750,100 L760,100 L760,90 L770,90 L770,100 L790,100 L790,120
          L810,120 L810,95 L820,95 L820,85 L830,85 L830,95 L850,95 L850,115
          L870,115 L870,130 L890,130 L890,105 L910,105 L910,120
          L930,120 L930,100 L940,100 L940,90 L950,90 L950,100 L970,100 L970,125
        " fill="#000" />

        {/* Brandenburg Gate area - right of center */}
        {/* Gate pillars */}
        <rect x="1000" y="130" width="6" height="40" fill="#000" />
        <rect x="1015" y="130" width="6" height="40" fill="#000" />
        <rect x="1030" y="130" width="6" height="40" fill="#000" />
        <rect x="1045" y="130" width="6" height="40" fill="#000" />
        <rect x="1060" y="130" width="6" height="40" fill="#000" />
        {/* Gate top beam */}
        <rect x="998" y="125" width="70" height="7" fill="#000" />
        {/* Quadriga on top */}
        <polygon points="1025,125 1033,108 1041,125" fill="#000" />
        <rect x="1028" y="105" width="10" height="5" rx="2" fill="#000" />

        {/* Buildings - right side */}
        <path d="
          M970,200 L970,125
          L990,125 L990,140 L998,140 L998,170
          L1068,170 L1068,140 L1080,140 L1080,125
          L1100,125 L1100,110 L1110,110 L1110,100 L1120,100 L1120,110 L1140,110 L1140,130
          L1160,130 L1160,115 L1180,115 L1180,135
          L1200,135 L1200,120 L1210,120 L1210,105 L1220,105 L1220,120 L1240,120 L1240,140
          L1260,140 L1260,125 L1280,125 L1280,145
          L1300,145 L1300,130 L1320,130 L1320,110 L1330,110 L1330,100 L1340,100 L1340,110 L1360,110
          L1360,135 L1380,135 L1380,150 L1400,150 L1400,140 L1420,140 L1420,155 L1440,155
          L1440,200 Z
        " fill="#000" />

        {/* Fill bottom to ensure no gap */}
        <rect x="0" y="170" width="1440" height="30" fill="#000" />

        {/* Tiny stars / window lights */}
        <circle cx="225" cy="115" r="1" fill="rgba(255,220,100,0.6)" />
        <circle cx="355" cy="110" r="1" fill="rgba(255,220,100,0.5)" />
        <circle cx="505" cy="95" r="1" fill="rgba(255,220,100,0.6)" />
        <circle cx="445" cy="105" r="1" fill="rgba(255,220,100,0.4)" />
        <circle cx="655" cy="110" r="1" fill="rgba(255,220,100,0.5)" />
        <circle cx="765" cy="95" r="1" fill="rgba(255,220,100,0.6)" />
        <circle cx="825" cy="90" r="1" fill="rgba(255,220,100,0.4)" />
        <circle cx="945" cy="95" r="1" fill="rgba(255,220,100,0.5)" />
        <circle cx="1115" cy="105" r="1" fill="rgba(255,220,100,0.6)" />
        <circle cx="1215" cy="110" r="1" fill="rgba(255,220,100,0.4)" />
        <circle cx="1335" cy="105" r="1" fill="rgba(255,220,100,0.5)" />
        <circle cx="135" cy="125" r="1" fill="rgba(255,220,100,0.5)" />
        <circle cx="1105" cy="115" r="1" fill="rgba(255,220,100,0.6)" />

        {/* Fernsehturm light at top */}
        <circle cx="718" cy="8" r="2.5" fill="rgba(255,50,50,0.8)" />
      </svg>
    </div>
  );
}

export default BerlinSkyline;
