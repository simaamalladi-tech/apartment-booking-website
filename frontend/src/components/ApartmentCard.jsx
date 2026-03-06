import React from 'react';
import { useTranslation } from 'react-i18next';
import './ApartmentCard.css';

function ApartmentCard({ apartment, onBook }) {
  const { t } = useTranslation();

  return (
    <div className="apartment-card">
      <div className="card-image">
        <span className="emoji-image">{apartment.image || '🏠'}</span>
      </div>

      <div className="card-content">
        <h3>{apartment.title}</h3>
        
        <p className="description">{apartment.description}</p>

        <p className="location">📍 {apartment.city}</p>

        <div className="amenities">
          <span className="amenity">🛏️ {apartment.beds} {t('apartments.beds')}</span>
          <span className="amenity">🚿 {apartment.baths} {t('apartments.baths')}</span>
        </div>

        <div className="card-footer">
          <div className="price">
            <strong>€{apartment.price}</strong>
            <span className="price-label">{t('apartments.price')}</span>
          </div>
          <button className="book-btn" onClick={onBook}>
            {t('apartments.bookNow')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ApartmentCard;
