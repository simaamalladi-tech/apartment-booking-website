import React from 'react';
import './BerlinSkyline.css';

function BerlinSkyline() {
  return (
    <div className="berlin-skyline">
      <div className="skyline-gradient" />
      <svg
        className="skyline-wave"
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,20 C240,55 480,0 720,30 C960,58 1200,5 1440,25 L1440,60 L0,60 Z"
          fill="#000"
        />
      </svg>
    </div>
  );
}

export default BerlinSkyline;
