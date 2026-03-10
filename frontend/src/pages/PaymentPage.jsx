import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { PayPalScriptProvider, PayPalButtons, FUNDING } from '@paypal/react-paypal-js';
import { useTranslation } from 'react-i18next';
import PaymentForm from '../components/PaymentForm';
import './PaymentPage.css';

let stripePromise = null;

// Fetch config from backend
const fetchConfig = async () => {
  try {
    const res = await fetch('/api/config');
    const data = await res.json();
    const config = { stripeKey: '', paypalClientId: '' };
    if (data.stripePublishableKey) {
      stripePromise = loadStripe(data.stripePublishableKey);
      config.stripeKey = data.stripePublishableKey;
    }
    if (data.paypalClientId) {
      config.paypalClientId = data.paypalClientId;
    }
    return config;
  } catch (err) {
    console.error('Error fetching payment config:', err);
    return { stripeKey: '', paypalClientId: '' };
  }
};

function PaymentPage({ bookingData, onPaymentSuccess, onCancel }) {
  const { t } = useTranslation();
  const [stripe, setStripe] = useState(null);
  const [paypalClientId, setPaypalClientId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [error, setError] = useState(null);
  const [paypalProcessing, setPaypalProcessing] = useState(false);
  const [paypalSuccess, setPaypalSuccess] = useState(false);
  const [configLoaded, setConfigLoaded] = useState(false);

  useEffect(() => {
    fetchConfig().then(config => {
      if (config.stripeKey && stripePromise) {
        stripePromise.then(s => setStripe(s));
      }
      if (config.paypalClientId) {
        setPaypalClientId(config.paypalClientId);
      }
      // Default to whichever is available
      if (!config.stripeKey && config.paypalClientId) {
        setPaymentMethod('paypal');
      }
      if (!config.stripeKey && !config.paypalClientId) {
        setError(t('payment.systemUnavailable'));
      }
      setConfigLoaded(true);
    });
  }, []);

  const hasStripe = !!stripe;
  const hasPaypal = !!paypalClientId;

  const handlePaypalCreateOrder = async () => {
    try {
      const res = await fetch('/api/payments/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingData,
          email: bookingData.user?.email || '',
        }),
      });
      const data = await res.json();
      if (data.success) {
        return data.orderID;
      } else {
        setError(data.message || t('payment.error'));
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const handlePaypalApprove = async (data) => {
    setPaypalProcessing(true);
    setError(null);
    try {
      const res = await fetch('/api/payments/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderID: data.orderID,
          bookingData,
          email: bookingData.user?.email || '',
        }),
      });
      const result = await res.json();
      if (result.success) {
        setPaypalSuccess(true);
        setTimeout(() => {
          onPaymentSuccess({
            bookingId: result.bookingId,
            paymentId: result.paymentId,
          });
        }, 1500);
      } else {
        setError(result.message || t('payment.error'));
      }
    } catch (err) {
      setError(err.message);
    }
    setPaypalProcessing(false);
  };

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

        {configLoaded && (hasStripe || hasPaypal) && (
          <div className="payment-grid">
            <div className="payment-form-section">
              {/* Payment method toggle */}
              {hasStripe && hasPaypal && (
                <div className="payment-method-toggle">
                  <button
                    type="button"
                    className={`method-btn ${paymentMethod === 'stripe' ? 'active' : ''}`}
                    onClick={() => { setPaymentMethod('stripe'); setError(null); }}
                  >
                    💳 {t('payment.creditCard')}
                  </button>
                  <button
                    type="button"
                    className={`method-btn ${paymentMethod === 'paypal' ? 'active' : ''}`}
                    onClick={() => { setPaymentMethod('paypal'); setError(null); }}
                  >
                    {t('payment.paypal')}
                  </button>
                </div>
              )}

              {/* Stripe form */}
              {paymentMethod === 'stripe' && hasStripe && (
                <Elements stripe={stripe}>
                  <PaymentForm 
                    bookingData={bookingData} 
                    onSuccess={onPaymentSuccess}
                  />
                </Elements>
              )}

              {/* PayPal buttons */}
              {paymentMethod === 'paypal' && hasPaypal && (
                <div className="paypal-section">
                  {paypalSuccess ? (
                    <div className="payment-success">
                      <div className="success-icon">✓</div>
                      <h2>{t('payment.success')}</h2>
                      <p>{t('payment.bookingConfirmed')}</p>
                    </div>
                  ) : (
                    <>
                      <p className="paypal-info">{t('payment.paypalInfo')}</p>
                      <PayPalScriptProvider options={{ clientId: paypalClientId, currency: 'EUR', disableFunding: 'card,credit' }}>
                        <PayPalButtons
                          fundingSource={FUNDING.PAYPAL}
                          style={{ layout: 'vertical', color: 'blue', shape: 'rect', label: 'pay' }}
                          createOrder={handlePaypalCreateOrder}
                          onApprove={handlePaypalApprove}
                          onError={(err) => { setError(t('payment.error')); console.error('PayPal error:', err); }}
                          disabled={paypalProcessing}
                        />
                      </PayPalScriptProvider>
                      {paypalProcessing && (
                        <div className="paypal-processing">
                          {t('payment.processing')}
                        </div>
                      )}
                    </>
                  )}
                </div>
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

export default PaymentPage;
