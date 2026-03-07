import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, Elements, useStripe, useElements } from '@stripe/react-stripe-js';
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
      console.log('🔑 Stripe key loaded from backend');
      stripePromise = loadStripe(data.stripePublishableKey);
      return stripePromise;
    } else {
      console.warn('⚠️ Stripe publishable key not configured');
      return null;
    }
  } catch (err) {
    console.error('❌ Error fetching Stripe config:', err);
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
        setError('Payment system not available. Please try again later.');
      }
    });
  }, []);

  return (
    <div className="payment-page">
      <div className="payment-container">
        <button className="back-btn" onClick={onCancel}>← {t('common.cancel')}</button>

        <h1>{t('payment.title')}</h1>

        {error && (
          <div className="error-banner" style={{ padding: '15px', background: '#fee', color: '#c00', borderRadius: '4px', marginBottom: '20px' }}>
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
              <h3>Booking Summary</h3>

              <div className="summary-item">
                <span>{bookingData.apartment.title}</span>
                <span>{bookingData.apartment.image}</span>
              </div>

              <div className="summary-item">
                <label>Check-in:</label>
                <span>{bookingData.checkIn}</span>
              </div>

              <div className="summary-item">
                <label>Check-out:</label>
                <span>{bookingData.checkOut}</span>
              </div>

              <div className="summary-item">
                <label>Nights:</label>
                <span>{bookingData.nights}</span>
              </div>

              <div className="summary-item">
                <label>Guests:</label>
                <span>{bookingData.guests}</span>
              </div>

              <hr />

              <div className="summary-item total">
                <label>Total Price:</label>
                <span>€{bookingData.totalPrice}</span>
              </div>
            </div>
          </div>
        </div>
        )}

        {!stripe && !error && (
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            Loading payment system...
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentPage;
