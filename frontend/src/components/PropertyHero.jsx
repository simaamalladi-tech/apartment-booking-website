import React from 'react';
import { useTranslation } from 'react-i18next';
import ImageGallery from './ImageGallery';
import useScrollAnimation from '../hooks/useScrollAnimation';
import './PropertyHero.css';

function PropertyHero({ apartment, onBookNow }) {
  const { t } = useTranslation();
  useScrollAnimation();

  return (
    <div className="property-hero">
      {/* Hero Image Gallery */}
      <ImageGallery images={apartment.images} />

      {/* Property Info Section */}
      <div className="property-info-section">
        <div className="property-info-container">
          {/* Left: Details */}
          <div className="property-details">
            {/* Rating & Address Bar */}
            <div className="property-header-bar fade-in-up">
              <div className="rating-badge">
                <span className="rating-score">9.3</span>
                <span className="rating-label">{t('property.superb')}</span>
              </div>
              <div className="address-info">
                <span className="address-icon">📍</span>
                <span>{apartment.address}</span>
              </div>
            </div>

            <div className="price-section fade-in-up">
              <h2 className="price">€{apartment.price}</h2>
              <p className="price-label">{t('apartments.price')}</p>
            </div>

            {/* Quick Facts */}
            <div className="quick-facts stagger-children">
              <div className="fact">
                <span className="fact-icon">🛏️</span>
                <div>
                  <div className="fact-label">{t('apartments.beds')}</div>
                  <div className="fact-value">{apartment.beds}</div>
                </div>
              </div>
              <div className="fact">
                <span className="fact-icon">🚿</span>
                <div>
                  <div className="fact-label">{t('apartments.baths')}</div>
                  <div className="fact-value">{apartment.baths}</div>
                </div>
              </div>
              <div className="fact">
                <span className="fact-icon">👥</span>
                <div>
                  <div className="fact-label">{t('property.maxGuests')}</div>
                  <div className="fact-value">{apartment.maxGuests}</div>
                </div>
              </div>
              {apartment.size > 0 && (
                <div className="fact">
                  <span className="fact-icon">📐</span>
                  <div>
                    <div className="fact-label">{t('property.size')}</div>
                    <div className="fact-value">{apartment.size} m²</div>
                  </div>
                </div>
              )}
            </div>

            {/* Check-in / Check-out */}
            <div className="checkin-info fade-in-up">
              <div className="checkin-item">
                <span className="checkin-label">{t('property.checkIn')}</span>
                <span className="checkin-value">15:00 – 23:00</span>
              </div>
              <div className="checkin-item">
                <span className="checkin-label">{t('property.checkOut')}</span>
                <span className="checkin-value">{t('property.until')} 10:00</span>
              </div>
            </div>

            {/* Description */}
            <div className="description-section fade-in-up">
              <h3>{t('property.aboutTitle')}</h3>
              <p>{apartment.description}</p>
            </div>

            {/* Amenities */}
            <div className="amenities-section fade-in-up">
              <h3>{t('property.amenitiesTitle')}</h3>
              <ul className="amenities-list">
                {apartment.amenities.map((amenity, idx) => (
                  <li key={idx}>✓ {amenity}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: Booking Card */}
          <div className="booking-card-container fade-in-right">
            <div className="booking-card">
              <h3>{t('property.readyToBook')}</h3>
              <p className="booking-description">{t('property.bookingCta')}</p>
              
              <div className="booking-highlights">
                <div className="highlight">
                  <span>✓</span>
                  <span>{t('property.instantConfirmation')}</span>
                </div>
                <div className="highlight">
                  <span>✓</span>
                  <span>{t('property.freeCancellation')}</span>
                </div>
                <p className="highlight-sub">{t('property.freeCancellationNote')}</p>
                <div className="highlight">
                  <span>✓</span>
                  <span>{t('property.support247')}</span>
                </div>
              </div>

              <button className="book-btn" onClick={onBookNow}>
                {t('apartments.bookNow')}
              </button>

              <p className="booking-info">
                💳 {t('property.securePayment')}<br/>
                🔒 {t('property.safeProtected')}<br/>
                📧 {t('property.emailConfirmation')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyHero;
