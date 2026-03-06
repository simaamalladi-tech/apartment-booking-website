import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './BookingPage.css';

function BookingPage({ apartment, onBookingComplete, onCancel }) {
  const { t } = useTranslation();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);

  const calculateNights = () => {
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    }
    return 0;
  };

  const totalPrice = apartment.price * calculateNights();

  const handleBook = () => {
    if (!checkIn || !checkOut || calculateNights() <= 0) {
      alert('Please select valid dates');
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

  return (
    <div className="booking-page">
      <div className="booking-container">
        <button className="back-btn" onClick={onCancel}>← {t('common.cancel')}</button>

        <h1>{t('booking.title')}</h1>

        <div className="booking-grid">
          <div className="booking-details">
            <div className="apartment-summary">
              <span className="emoji">{apartment.image || '🏠'}</span>
              <h2>{apartment.title}</h2>
              <p className="city">📍 {apartment.city}</p>
              <p className="price-info">
                <strong>€{apartment.price}</strong> {t('apartments.price')}
              </p>
            </div>

            <form className="booking-form">
              <div className="form-group">
                <label>{t('booking.checkIn')}</label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  min={today}
                  required
                />
              </div>

              <div className="form-group">
                <label>{t('booking.checkOut')}</label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  min={checkIn || today}
                  required
                />
              </div>

              <div className="form-group">
                <label>{t('booking.guests')}</label>
                <input
                  type="number"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  min="1"
                  required
                />
              </div>

              <div className="booking-summary">
                <div className="summary-item">
                  <span>Nights:</span>
                  <strong>{calculateNights()}</strong>
                </div>
                <div className="summary-item">
                  <span>Price per night:</span>
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
