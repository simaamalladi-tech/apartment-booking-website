import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import ImageGallery from './ImageGallery';
import useScrollAnimation from '../hooks/useScrollAnimation';
import './PropertyHero.css';

const TOTAL_REVIEWS = 6;
const VISIBLE = 2;
const PAGES = Math.ceil(TOTAL_REVIEWS / VISIBLE); // 3 pages

function ReviewsCarousel({ t }) {
  const [page, setPage] = useState(0);
  const [fading, setFading] = useState(false);

  const goTo = useCallback((next) => {
    setFading(true);
    setTimeout(() => {
      setPage(next);
      setFading(false);
    }, 250);
  }, []);

  // Auto-advance every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      goTo((page + 1) % PAGES);
    }, 6000);
    return () => clearInterval(timer);
  }, [page, goTo]);

  const start = page * VISIBLE;
  const reviewNums = Array.from({ length: VISIBLE }, (_, i) => start + i + 1)
    .filter(n => n <= TOTAL_REVIEWS);

  return (
    <div className="sidebar-card reviews-card fade-in-up">
      <h3>⭐ {t('property.reviewsTitle')}</h3>
      <div className={`reviews-carousel-inner ${fading ? 'fade-out' : 'fade-in'}`}>
        {reviewNums.map(n => (
          <div className="review" key={n}>
            <div className="review-header">
              <span className="review-rating-badge">{t(`property.review${n}Rating`)}</span>
            </div>
            <p className="review-text">"{t(`property.review${n}Text`)}"</p>
            <p className="review-author">— {t(`property.review${n}Author`)}</p>
          </div>
        ))}
      </div>
      <div className="reviews-carousel-nav">
        <button
          className="carousel-arrow"
          onClick={() => goTo((page - 1 + PAGES) % PAGES)}
          aria-label="Previous reviews"
        >‹</button>
        <div className="carousel-dots">
          {Array.from({ length: PAGES }, (_, i) => (
            <button
              key={i}
              className={`carousel-dot ${i === page ? 'active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Page ${i + 1}`}
            />
          ))}
        </div>
        <button
          className="carousel-arrow"
          onClick={() => goTo((page + 1) % PAGES)}
          aria-label="Next reviews"
        >›</button>
      </div>
    </div>
  );
}

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

            {/* Neighborhood Highlights */}
            <div className="sidebar-card neighborhood-card fade-in-up">
              <h3>📍 {t('property.neighborhoodTitle')}</h3>
              <ul className="neighborhood-list">
                <li>
                  <span className="poi-icon">🚇</span>
                  <div>
                    <span className="poi-name">{t('property.poi1Name')}</span>
                    <span className="poi-distance">{t('property.poi1Dist')}</span>
                  </div>
                </li>
                <li>
                  <span className="poi-icon">🏛️</span>
                  <div>
                    <span className="poi-name">{t('property.poi2Name')}</span>
                    <span className="poi-distance">{t('property.poi2Dist')}</span>
                  </div>
                </li>
                <li>
                  <span className="poi-icon">🛍️</span>
                  <div>
                    <span className="poi-name">{t('property.poi3Name')}</span>
                    <span className="poi-distance">{t('property.poi3Dist')}</span>
                  </div>
                </li>
                <li>
                  <span className="poi-icon">🌳</span>
                  <div>
                    <span className="poi-name">{t('property.poi4Name')}</span>
                    <span className="poi-distance">{t('property.poi4Dist')}</span>
                  </div>
                </li>
                <li>
                  <span className="poi-icon">✈️</span>
                  <div>
                    <span className="poi-name">{t('property.poi5Name')}</span>
                    <span className="poi-distance">{t('property.poi5Dist')}</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* House Rules */}
            <div className="sidebar-card rules-card fade-in-up">
              <h3>📋 {t('property.houseRulesTitle')}</h3>
              <ul className="rules-list">
                <li><span className="rule-icon">🚭</span> {t('property.rule1')}</li>
                <li><span className="rule-icon">🐾</span> {t('property.rule2')}</li>
                <li><span className="rule-icon">🎉</span> {t('property.rule3')}</li>
                <li><span className="rule-icon">🤫</span> {t('property.rule4')}</li>
              </ul>
            </div>

            {/* Guest Scores */}
            <div className="sidebar-card scores-card fade-in-up">
              <h3>📊 {t('property.scoreTitle')}</h3>
              <div className="score-overall">
                <span className="score-badge">9.3</span>
                <span className="score-overall-label">{t('property.superb')}</span>
              </div>
              <div className="score-bars">
                {[
                  { key: 'scoreStaff', val: 9.7 },
                  { key: 'scoreComfort', val: 9.3 },
                  { key: 'scoreLocation', val: 8.9 },
                  { key: 'scoreFacilities', val: 9.4 },
                  { key: 'scoreCleanliness', val: 9.1 },
                  { key: 'scoreValue', val: 9.3 },
                  { key: 'scoreWifi', val: 10.0 },
                ].map(({ key, val }) => (
                  <div className="score-row" key={key}>
                    <span className="score-label">{t(`property.${key}`)}</span>
                    <div className="score-bar-track">
                      <div className="score-bar-fill" style={{ width: `${val * 10}%` }}></div>
                    </div>
                    <span className="score-val">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Guest Reviews Carousel */}
            <ReviewsCarousel t={t} />

            {/* Nearby Dining */}
            <div className="sidebar-card dining-card fade-in-up">
              <h3>🍽️ {t('property.nearbyTitle')}</h3>
              <ul className="neighborhood-list">
                <li>
                  <span className="poi-icon">🍔</span>
                  <div>
                    <span className="poi-name">{t('property.restaurant1')}</span>
                    <span className="poi-distance">{t('property.restaurant1Dist')}</span>
                  </div>
                </li>
                <li>
                  <span className="poi-icon">🍽️</span>
                  <div>
                    <span className="poi-name">{t('property.restaurant2')}</span>
                    <span className="poi-distance">{t('property.restaurant2Dist')}</span>
                  </div>
                </li>
                <li>
                  <span className="poi-icon">☕</span>
                  <div>
                    <span className="poi-name">{t('property.restaurant3')}</span>
                    <span className="poi-distance">{t('property.restaurant3Dist')}</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyHero;
