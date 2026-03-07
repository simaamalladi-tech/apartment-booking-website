import React from 'react';
import { useTranslation } from 'react-i18next';
import ImageGallery from './ImageGallery';
import './PropertyHero.css';

function PropertyHero({ apartment, onBookNow }) {
  const { t } = useTranslation();

  return (
    <div className="property-hero">
      {/* Hero Image Gallery */}
      <ImageGallery images={apartment.images} />

      {/* Property Info Section */}
      <div className="property-info-section">
        <div className="property-info-container">
          {/* Left: Details */}
          <div className="property-details">
            <div className="price-section">
              <h2 className="price">€{apartment.price}</h2>
              <p className="price-label">per night</p>
            </div>

            {/* Quick Facts */}
            <div className="quick-facts">
              <div className="fact">
                <span className="fact-icon">🛏️</span>
                <div>
                  <div className="fact-label">Bedrooms</div>
                  <div className="fact-value">{apartment.beds + 1}</div>
                </div>
              </div>
              <div className="fact">
                <span className="fact-icon">🚿</span>
                <div>
                  <div className="fact-label">Bathrooms</div>
                  <div className="fact-value">{apartment.baths}</div>
                </div>
              </div>
              <div className="fact">
                <span className="fact-icon">👥</span>
                <div>
                  <div className="fact-label">Max Guests</div>
                  <div className="fact-value">{apartment.maxGuests}</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="description-section">
              <h3>About this property</h3>
              <p>{apartment.description}</p>
            </div>

            {/* Amenities */}
            <div className="amenities-section">
              <h3>Amenities</h3>
              <ul className="amenities-list">
                {apartment.amenities.map((amenity, idx) => (
                  <li key={idx}>✓ {amenity}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: Booking Card */}
          <div className="booking-card-container">
            <div className="booking-card">
              <h3>Ready to book?</h3>
              <p className="booking-description">Select your dates and book this amazing property</p>
              
              <div className="booking-highlights">
                <div className="highlight">
                  <span>✓</span>
                  <span>Instant Confirmation</span>
                </div>
                <div className="highlight">
                  <span>✓</span>
                  <span>Free Cancellation</span>
                </div>
                <div className="highlight">
                  <span>✓</span>
                  <span>24/7 Support</span>
                </div>
              </div>

              <button className="book-btn" onClick={onBookNow}>
                Book Now
              </button>

              <p className="booking-info">
                💳 Secure payment<br/>
                🔒 Safe & Protected<br/>
                📧 Confirmation via email
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyHero;
