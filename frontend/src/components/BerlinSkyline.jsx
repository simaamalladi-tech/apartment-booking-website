import React from 'react';
import './BerlinSkyline.css';

function BerlinSkyline() {
  return (
    <div className="berlin-skyline">
      <div className="skyline-photo-container">
        <img
          src="/images/berlin-skyline.jpg"
          alt="Berlin skyline at night"
          className="skyline-photo"
          loading="eager"
        />
        <div className="skyline-overlay" />
      </div>
    </div>
  );
}

export default BerlinSkyline;
