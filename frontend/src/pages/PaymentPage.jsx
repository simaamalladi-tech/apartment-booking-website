import React, { useState, useEffect, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useTranslation } from 'react-i18next';
import PaymentForm from '../components/PaymentForm';
import './PaymentPage.css';

let stripePromise = null;

// Fetch config from backend
const fetchConfig = async () => {
  try {
    const res = await fetch('/api/config');
    const data = await res.json();
    const config = { stripeKey: '', paypalViaStripe: false };
    if (data.stripePublishableKey) {
      stripePromise = loadStripe(data.stripePublishableKey);
      config.stripeKey = data.stripePublishableKey;
    }
    config.paypalViaStripe = !!data.paypalViaStripe;
    return config;
  } catch (err) {
    console.error('Error fetching payment config:', err);
    return { stripeKey: '', paypalViaStripe: false };
  }
};

function PaymentPageContent({ bookingData, onPaymentSuccess, onCancel, stripe, paypalViaStripe, configLoaded }) {
  const { t } = useTranslation();
  const [error, setError] = useState(null);
  const [paypalLoading, setPaypalLoading] = useState(false);

  const hasStripe = !!stripe;

  const handlePaypalViaStripe = useCallback(async () => {
    setPaypalLoading(true);
    setError(null);
    try {
      // Save booking data so we can restore it after Stripe redirect
      sessionStorage.setItem('pendingBookingData', JSON.stringify(bookingData));

      const res = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingData,
          email: bookingData.user?.email || '',
        }),
      });
      const data = await res.json();
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.message || t('payment.error'));
        setPaypalLoading(false);
      }
    } catch (err) {
      setError(err.message);
      setPaypalLoading(false);
    }
  }, [bookingData, t]);

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

        {configLoaded && (hasStripe || paypalViaStripe) && (
          <div className="payment-grid">
            <div className="payment-form-section">
              {/* PayPal via Stripe section FIRST */}
              {paypalViaStripe && (
                <div className="paypal-section">
                  <button
                    className="paypal-stripe-btn"
                    onClick={handlePaypalViaStripe}
                    disabled={paypalLoading}
                  >
                    {paypalLoading ? (
                      <span>{t('payment.processing')}</span>
                    ) : (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c2.377-.56 3.794-2.27 4.244-5.266C26.164-1.254 23.598 0 20.534 0h-1.82l.526-3.076-.018.103z"/></svg>
                        <span>PayPal</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Divider between PayPal and credit card */}
              {hasStripe && paypalViaStripe && (
                <div className="payment-divider"><span>{t('payment.or', 'or')}</span></div>
              )}

              {/* Credit card form BELOW PayPal */}
              {hasStripe && (
                <Elements stripe={stripe}>
                  <PaymentForm 
                    bookingData={bookingData} 
                    onSuccess={onPaymentSuccess}
                  />
                </Elements>
              )}
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

        {!configLoaded && (
          <div className="loading-payment">
            {t('payment.loadingSystem')}
          </div>
        )}
      </div>
    </div>
  );
}

function PaymentPage({ bookingData, onPaymentSuccess, onCancel }) {
  const [stripe, setStripe] = useState(null);
  const [paypalViaStripe, setPaypalViaStripe] = useState(false);
  const [configLoaded, setConfigLoaded] = useState(false);

  useEffect(() => {
    fetchConfig().then(config => {
      if (config.stripeKey && stripePromise) {
        stripePromise.then(s => setStripe(s));
      }
      setPaypalViaStripe(config.paypalViaStripe);
      setConfigLoaded(true);
    });
  }, []);

  return (
    <PaymentPageContent
      bookingData={bookingData}
      onPaymentSuccess={onPaymentSuccess}
      onCancel={onCancel}
      stripe={stripe}
      paypalViaStripe={paypalViaStripe}
      configLoaded={configLoaded}
    />
  );
}

export default PaymentPage;
