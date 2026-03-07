import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DateRangePicker from '../components/DateRangePicker';
import './BookingPage.css';

function BookingPage({ apartment, onBookingComplete, onCancel }) {
  const { t } = useTranslation();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
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

  const handleDateChange = (newCheckIn, newCheckOut) => {
    setCheckIn(newCheckIn);
    setCheckOut(newCheckOut);
    setError('');
  };

  const handleBook = () => {
    setError('');
    if (!name.trim()) {
      setError(t('booking.nameRequired'));
      return;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError(t('booking.emailRequired'));
      return;
    }
    if (!checkIn || !checkOut || calculateNights() <= 0) {
      setError(t('booking.invalidDates'));
      return;
    }
    if (guests > apartment.maxGuests) {
      setError(t('booking.guestLimit', { max: apartment.maxGuests }));
      return;
    }
    onBookingComplete({
      apartment, checkIn, checkOut, guests,
      nights: calculateNights(), totalPrice,
      user: { name: name.trim(), email: email.trim(), phone: phone.trim() }
    });
  };

  const heroImage = apartment.images && apartment.images.length > 0
    ? apartment.images[0] : null;

  const nights = calculateNights();

  return (
    <div className="booking-page">
      <div className="booking-container">
        <button className="back-btn" onClick={onCancel}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          {t('common.back')}
        </button>

        <h1>{t('booking.title')}</h1>

        <div className="booking-layout">
          {/* Left: Form */}
          <div className="booking-form-section">
            {/* Property card */}
            <div className="apartment-summary">
              {heroImage ? (
                <img src={heroImage} alt={apartment.title} className="summary-image" />
              ) : (
                <div className="summary-image-placeholder">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                </div>
              )}
              <div className="summary-text">
                <h2>{apartment.title}</h2>
                <p className="city">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {apartment.address || apartment.city}
                </p>
                <p className="price-info">
                  <strong>€{apartment.price}</strong> {t('apartments.price')}
                </p>
              </div>
            </div>

            {/* Calendar */}
            <div className="form-section-title">{t('booking.selectDates')}</div>
            <DateRangePicker
              apartmentId={apartment._id || apartment.id}
              checkIn={checkIn}
              checkOut={checkOut}
              onChange={handleDateChange}
            />

            {/* Guest info */}
            <div className="form-section-title">{t('booking.guestDetails')}</div>
            <form className="booking-form" onSubmit={(e) => e.preventDefault()}>
              <div className="form-row-2">
                <div className="form-group">
                  <label>{t('payment.name')} *</label>
                  <input type="text" value={name} onChange={(e) => { setName(e.target.value); setError(''); }} required placeholder={t('contact.nameField')} />
                </div>
                <div className="form-group">
                  <label>{t('payment.email')} *</label>
                  <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} required placeholder={t('contact.emailField')} />
                </div>
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label>{t('booking.phone')}</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+49 30 ..." />
                </div>
                <div className="form-group">
                  <label>{t('booking.guests')}</label>
                  <input type="number" value={guests} onChange={(e) => { setGuests(parseInt(e.target.value) || 1); setError(''); }} min="1" max={apartment.maxGuests} required />
                  <span className="field-hint">{t('booking.maxGuests', { max: apartment.maxGuests })}</span>
                </div>
              </div>
            </form>
          </div>

          {/* Right: Summary */}
          <div className="booking-summary-side">
            <div className="booking-summary-card">
              <h3>{t('payment.bookingSummary')}</h3>

              <div className="summary-detail">
                <span>{t('booking.checkIn')}</span>
                <strong>{checkIn || '—'}</strong>
              </div>
              <div className="summary-detail">
                <span>{t('booking.checkOut')}</span>
                <strong>{checkOut || '—'}</strong>
              </div>
              <div className="summary-detail">
                <span>{t('booking.nights')}</span>
                <strong>{nights}</strong>
              </div>
              <div className="summary-detail">
                <span>{t('booking.guests')}</span>
                <strong>{guests}</strong>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-detail">
                <span>{t('booking.pricePerNight')}</span>
                <strong>€{apartment.price}</strong>
              </div>
              {nights > 0 && (
                <div className="summary-detail summary-calc">
                  <span>€{apartment.price} × {nights} {t('booking.nights').toLowerCase()}</span>
                  <strong>€{totalPrice}</strong>
                </div>
              )}

              <div className="summary-total">
                <span>{t('booking.totalPrice')}</span>
                <strong>€{totalPrice}</strong>
              </div>

              {error && <div className="booking-error">{error}</div>}

              <button
                type="button"
                className="continue-btn"
                onClick={handleBook}
                disabled={!checkIn || !checkOut || nights <= 0 || !name.trim() || !email.trim()}
              >
                {t('booking.continueToPayment')}
              </button>

              <div className="booking-guarantees">
                <div className="guarantee-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>{t('property.instantConfirmation')}</span>
                </div>
                <div className="guarantee-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>{t('property.freeCancellation')}</span>
                </div>
                <div className="guarantee-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>{t('property.securePayment')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingPage;
