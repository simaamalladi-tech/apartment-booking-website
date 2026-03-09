import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useTranslation } from 'react-i18next';
import PaymentForm from '../components/PaymentForm';
import './PaymentPage.css';

let stripePromise = null;

// Fetch Stripe key from backend
const fetchStripeKey = async () => {
  try {
    const res = await fetch('/api/config');
    const data = await res.json();
    if (data.stripePublishableKey) {
      console.log('Stripe key loaded from backend');
      stripePromise = loadStripe(data.stripePublishableKey);
      return stripePromise;
    } else {
      console.warn('Stripe publishable key not configured');
      return null;
    }
  } catch (err) {
    console.error('Error fetching Stripe config:', err);
    return null;
  }
};

// Initialize on first load
const initStripe = () => {
  if (!stripePromise) {
    return fetchStripeKey();
  }
  return Promise.resolve(stripePromise);
};

function PaymentPage({ bookingData, onPaymentSuccess, onCancel }) {
  const { t } = useTranslation();
  const [stripe, setStripe] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    initStripe().then(stripeInstance => {
      if (stripeInstance) {
        setStripe(stripeInstance);
      } else {
        setError(t('payment.systemUnavailable'));
      }
    });
  }, []);

  return (
    <div className="payment-page">
      <div className="payment-container">
        <button className="back-btn" onClick={onCancel}>
          ← {t('common.back')}
        </button>

        <h1>{t('payment.title')}</h1>

        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        {stripe && (
          <div className="payment-grid">
            <div className="payment-form-section">
              <Elements stripe={stripe}>
                <PaymentForm 
                  bookingData={bookingData} 
                  onSuccess={onPaymentSuccess}
                />
              </Elements>
            </div>

            <div className="booking-summary-section">
              <div className="summary-card">
                <h3>{t('payment.bookingSummary')}</h3>

                <div className="summary-item">
                  <label>{t('payment.property')}:</label>
                  <span>{t('property.title')}</span>
                </div>

                <div className="summary-item">
                  <label>{t('booking.checkIn')}:</label>
                  <span>{bookingData.checkIn}</span>
                </div>

                <div className="summary-item">
                  <label>{t('booking.checkOut')}:</label>
                  <span>{bookingData.checkOut}</span>
                </div>

                <div className="summary-item">
                  <label>{t('booking.nights')}:</label>
                  <span>{bookingData.nights}</span>
                </div>

                <div className="summary-item">
                  <label>{t('payment.guestsLabel')}:</label>
                  <span>{bookingData.guests}</span>
                </div>

                <hr />

                <div className="summary-item total">
                  <label>{t('payment.totalLabel')}:</label>
                  <span>€{bookingData.totalPrice}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {!stripe && !error && (
          <div className="loading-payment">
            {t('payment.loadingSystem')}
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentPage;
