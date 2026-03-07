import React from 'react';
import { useTranslation } from 'react-i18next';
import './ConfirmationPage.css';

function ConfirmationPage({ bookingData, onGoHome }) {
  const { t, i18n } = useTranslation();

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const locale = i18n.language === 'de' ? 'de-DE' : 'en-US';
    return new Date(dateStr).toLocaleDateString(locale, {
      weekday: 'short', day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  return (
    <div className="confirmation-page">
      <div className="confirmation-container">
        {/* Success header */}
        <div className="confirmation-header">
          <div className="success-checkmark">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="11" stroke="#10b981" strokeWidth="2" fill="#ecfdf5" />
              <polyline points="7 12 10.5 15.5 17 9" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1>{t('confirmation.title')}</h1>
          <p className="confirmation-subtitle">{t('confirmation.subtitle')}</p>
          {bookingData?.bookingId && (
            <div className="booking-ref">
              <span className="ref-label">{t('confirmation.bookingRef')}</span>
              <span className="ref-value">{bookingData.bookingId}</span>
            </div>
          )}
        </div>

        {/* Booking details card */}
        <div className="confirmation-card">
          <div className="card-section">
            <h3>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              {t('confirmation.propertyDetails')}
            </h3>
            <div className="detail-row">
              <span className="detail-label">{t('payment.property')}</span>
              <span className="detail-value">{bookingData?.apartment?.title || 'Alt-Berliner Eckkneipe'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">{t('confirmation.address')}</span>
              <span className="detail-value">{bookingData?.apartment?.address || '146A Gustav-Adolf-Straße, Berlin'}</span>
            </div>
          </div>

          <div className="card-divider"></div>

          <div className="card-section">
            <h3>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {t('confirmation.stayDetails')}
            </h3>
            <div className="detail-grid">
              <div className="detail-block">
                <span className="detail-label">{t('booking.checkIn')}</span>
                <span className="detail-value highlight">{formatDate(bookingData?.checkIn)}</span>
              </div>
              <div className="detail-block">
                <span className="detail-label">{t('booking.checkOut')}</span>
                <span className="detail-value highlight">{formatDate(bookingData?.checkOut)}</span>
              </div>
              <div className="detail-block">
                <span className="detail-label">{t('booking.nights')}</span>
                <span className="detail-value">{bookingData?.nights || '—'}</span>
              </div>
              <div className="detail-block">
                <span className="detail-label">{t('booking.guests')}</span>
                <span className="detail-value">{bookingData?.guests || '—'}</span>
              </div>
            </div>
          </div>

          <div className="card-divider"></div>

          <div className="card-section">
            <h3>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              {t('confirmation.paymentSummary')}
            </h3>
            <div className="detail-row">
              <span className="detail-label">€{bookingData?.apartment?.price || '—'} × {bookingData?.nights || '—'} {t('booking.nights').toLowerCase()}</span>
              <span className="detail-value">€{bookingData?.totalPrice || '—'}</span>
            </div>
            <div className="detail-row total-row">
              <span className="detail-label">{t('booking.totalPrice')}</span>
              <span className="detail-value total-price">€{bookingData?.totalPrice || '—'}</span>
            </div>
            {bookingData?.paymentId && (
              <div className="detail-row">
                <span className="detail-label">{t('confirmation.transactionId')}</span>
                <span className="detail-value mono">{bookingData.paymentId}</span>
              </div>
            )}
          </div>

          {bookingData?.user && (
            <>
              <div className="card-divider"></div>
              <div className="card-section">
                <h3>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  {t('confirmation.guestDetails')}
                </h3>
                <div className="detail-row">
                  <span className="detail-label">{t('payment.name')}</span>
                  <span className="detail-value">{bookingData.user.name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{t('payment.email')}</span>
                  <span className="detail-value">{bookingData.user.email}</span>
                </div>
                {bookingData.user.phone && (
                  <div className="detail-row">
                    <span className="detail-label">{t('booking.phone')}</span>
                    <span className="detail-value">{bookingData.user.phone}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Email notice */}
        <div className="email-notice">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          <p>{t('confirmation.emailNotice')}</p>
        </div>

        {/* Action buttons */}
        <div className="confirmation-actions">
          <button className="home-btn" onClick={onGoHome}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            {t('confirmation.backToHome')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationPage;
