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
        {/* Left buildings */}
        <path d="M0,200 L0,155 L30,155 L30,140 L50,140 L50,155 L70,155 L70,130 L90,130 L90,155 L110,155 L110,145 L130,145 L130,120 L150,120 L150,135 L170,135 L170,155 L200,155 L200,110 L220,110 L220,100 L230,100 L230,110 L250,110 L250,145 L280,145 L280,125 L300,125 L300,115 L310,115 L310,125 L330,125 L330,140 L350,140 L350,105 L370,105 L370,95 L380,95 L380,105 L400,105 L400,130 L420,130 L420,100 L440,100 L440,120 L460,120 L460,135 L480,135 L480,110 L500,110 L500,90 L510,90 L510,110 L530,110 L530,130 L550,130 L550,115 L570,115 L570,105 L590,105 L590,200 Z" fill="#000" />

        {/* Center-left buildings */}
        <path d="M590,200 L590,125 L610,125 L610,110 L630,110 L630,130 L650,130 L650,105 L660,105 L660,95 L670,95 L670,105 L690,105 L690,140 L700,140 L700,200 Z" fill="#000" />

        {/* Fernsehturm */}
        <rect x="717" y="12" width="2" height="50" fill="#000" />
        <ellipse cx="718" cy="70" rx="13" ry="11" fill="#000" />
        <rect x="715" y="81" width="6" height="38" fill="#000" />
        <polygon points="710,119 726,119 722,155 714,155" fill="#000" />
        <rect x="708" y="155" width="20" height="45" fill="#000" />

        {/* Center-right buildings */}
        <path d="M728,200 L728,140 L750,140 L750,100 L760,100 L760,90 L770,90 L770,100 L790,100 L790,120 L810,120 L810,95 L820,95 L820,85 L830,85 L830,95 L850,95 L850,115 L870,115 L870,130 L890,130 L890,105 L910,105 L910,120 L930,120 L930,100 L940,100 L940,90 L950,90 L950,100 L970,100 L970,200 Z" fill="#000" />

        {/* Brandenburg Gate */}
        <rect x="998" y="125" width="70" height="7" fill="#000" />
        <rect x="1000" y="130" width="6" height="40" fill="#000" />
        <rect x="1015" y="130" width="6" height="40" fill="#000" />
        <rect x="1030" y="130" width="6" height="40" fill="#000" />
        <rect x="1045" y="130" width="6" height="40" fill="#000" />
        <rect x="1060" y="130" width="6" height="40" fill="#000" />
        <polygon points="1025,125 1033,110 1041,125" fill="#000" />

        {/* Right buildings */}
        <path d="M970,200 L970,125 L990,125 L990,140 L998,140 L998,170 L1068,170 L1068,140 L1080,140 L1080,125 L1100,125 L1100,110 L1120,110 L1120,100 L1130,100 L1130,110 L1150,110 L1150,130 L1170,130 L1170,115 L1190,115 L1190,135 L1210,135 L1210,120 L1230,120 L1230,105 L1240,105 L1240,120 L1260,120 L1260,140 L1280,140 L1280,125 L1300,125 L1300,145 L1320,145 L1320,130 L1340,130 L1340,110 L1360,110 L1360,135 L1380,135 L1380,150 L1400,150 L1400,140 L1420,140 L1420,155 L1440,155 L1440,200 Z" fill="#000" />

        {/* Bottom fill */}
        <rect x="0" y="170" width="1440" height="30" fill="#000" />

        {/* TV tower red light */}
        <circle cx="718" cy="12" r="2" fill="#ff3333" />
      </svg>
    </div>
  );
}

export default BerlinSkyline;
