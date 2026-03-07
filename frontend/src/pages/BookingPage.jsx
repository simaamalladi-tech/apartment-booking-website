import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './BookingPage.css';

function BookingPage({ apartment, onBookingComplete, onCancel }) {
  const { t } = useTranslation();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [error, setError] = useState('');

  const calculateNights = () => {
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 0;
    }
    return 0;
  };

  const totalPrice = apartment.price * calculateNights();

  const handleBook = () => {
    setError('');

    if (!checkIn || !checkOut || calculateNights() <= 0) {
      setError(t('booking.invalidDates'));
      return;
    }

    if (guests > apartment.maxGuests) {
      setError(t('booking.guestLimit', { max: apartment.maxGuests }));
      return;
    }

    onBookingComplete({
      apartment: apartment,
      checkIn: checkIn,
      checkOut: checkOut,
      guests: guests,
      nights: calculateNights(),
      totalPrice: totalPrice
    });
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  // Get the first real image or fallback
  const heroImage = apartment.images && apartment.images.length > 0
    ? apartment.images[0]
    : null;

  return (
    <div className="booking-page">
      <div className="booking-container">
        <button className="back-btn" onClick={onCancel}>← {t('common.back')}</button>

        <h1>{t('booking.title')}</h1>

        <div className="booking-grid">
          <div className="booking-details">
            <div className="apartment-summary">
              {heroImage ? (
                <img src={heroImage} alt={apartment.title} className="summary-image" />
              ) : (
                <div className="summary-image-placeholder">🏠</div>
              )}
              <h2>{apartment.title}</h2>
              <p className="city">📍 {apartment.address || apartment.city}</p>
              <p className="price-info">
                <strong>€{apartment.price}</strong> {t('apartments.price')}
              </p>
            </div>

            <form className="booking-form" onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <label>{t('booking.checkIn')}</label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => { setCheckIn(e.target.value); setError(''); }}
                  min={today}
                  required
                />
              </div>

              <div className="form-group">
                <label>{t('booking.checkOut')}</label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => { setCheckOut(e.target.value); setError(''); }}
                  min={checkIn || today}
                  required
                />
              </div>

              <div className="form-group">
                <label>{t('booking.guests')}</label>
                <input
                  type="number"
                  value={guests}
                  onChange={(e) => { setGuests(parseInt(e.target.value) || 1); setError(''); }}
                  min="1"
                  max={apartment.maxGuests}
                  required
                />
                <span className="field-hint">Max: {apartment.maxGuests}</span>
              </div>

              {error && <div className="booking-error">{error}</div>}

              <div className="booking-summary">
                <div className="summary-item">
                  <span>{t('booking.nights')}:</span>
                  <strong>{calculateNights()}</strong>
                </div>
                <div className="summary-item">
                  <span>{t('booking.pricePerNight')}:</span>
                  <strong>€{apartment.price}</strong>
                </div>
                <div className="summary-item total">
                  <span>{t('booking.totalPrice')}:</span>
                  <strong>€{totalPrice}</strong>
                </div>
              </div>

              <button
                type="button"
                className="continue-btn"
                onClick={handleBook}
                disabled={!checkIn || !checkOut || calculateNights() <= 0}
              >
                {t('booking.continueToPayment')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingPage;
