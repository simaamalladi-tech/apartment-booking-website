import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
    const config = { stripeKey: '', paypalClientId: '', paypalMode: 'sandbox' };
    if (data.stripePublishableKey) {
      stripePromise = loadStripe(data.stripePublishableKey);
      config.stripeKey = data.stripePublishableKey;
    }
    if (data.paypalClientId) {
      config.paypalClientId = data.paypalClientId;
    }
    if (data.paypalMode) {
      config.paypalMode = data.paypalMode;
    }
    return config;
  } catch (err) {
    console.error('Error fetching payment config:', err);
    return { stripeKey: '', paypalClientId: '', paypalMode: 'sandbox' };
  }
};

function PaymentPageContent({ bookingData, onPaymentSuccess, onCancel, stripe, paypalClientId, paypalMode, configLoaded }) {
  const { t } = useTranslation();
  const [error, setError] = useState(null);
  const [paypalProcessing, setPaypalProcessing] = useState(false);
  const [paypalSuccess, setPaypalSuccess] = useState(false);

  const hasStripe = !!stripe;
  const hasPaypal = !!paypalClientId;

  const handlePaypalCreateOrder = useCallback(async () => {
    try {
      setError(null);
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
  }, [bookingData, t]);

  const handlePaypalApprove = useCallback(async (data) => {
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
  }, [bookingData, onPaymentSuccess, t]);

  const handlePaypalError = useCallback((err) => {
    setError(t('payment.error'));
    console.error('PayPal error:', err);
  }, [t]);

  const handlePaypalCancel = useCallback(() => {
    setPaypalProcessing(false);
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

        {configLoaded && (hasStripe || hasPaypal) && (
          <div className="payment-grid">
            <div className="payment-form-section">
              {/* PayPal section FIRST — above credit card */}
              {hasPaypal && (
                <div className="paypal-section">
                  {paypalMode !== 'live' && (
                    <div className="paypal-sandbox-note">
                      {t(
                        'payment.paypalSandboxHint',
                        'Sandbox mode: please log in with a PayPal Sandbox Personal (buyer) account. Using a real email or business account may show card checkout only.'
                      )}
                    </div>
                  )}
                  {paypalSuccess ? (
                    <div className="payment-success">
                      <div className="success-icon">✓</div>
                      <h2>{t('payment.success')}</h2>
                      <p>{t('payment.bookingConfirmed')}</p>
                    </div>
                  ) : (
                    <>
                      <PayPalButtons
                        fundingSource={FUNDING.PAYPAL}
                        style={{ layout: 'vertical', color: 'blue', shape: 'rect', label: 'pay' }}
                        createOrder={handlePaypalCreateOrder}
                        onApprove={handlePaypalApprove}
                        onError={handlePaypalError}
                        onCancel={handlePaypalCancel}
                        disabled={paypalProcessing}
                        forceReRender={[bookingData.totalPrice]}
                      />
                      {paypalProcessing && (
                        <div className="paypal-processing">
                          {t('payment.processing')}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Divider between PayPal and credit card */}
              {hasStripe && hasPaypal && (
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
  const [paypalClientId, setPaypalClientId] = useState('');
  const [paypalMode, setPaypalMode] = useState('sandbox');
  const [configLoaded, setConfigLoaded] = useState(false);

  useEffect(() => {
    fetchConfig().then(config => {
      if (config.stripeKey && stripePromise) {
        stripePromise.then(s => setStripe(s));
      }
      if (config.paypalClientId) {
        setPaypalClientId(config.paypalClientId);
      }
      setPaypalMode(config.paypalMode || 'sandbox');
      setConfigLoaded(true);
    });
  }, []);

  const contentProps = {
    bookingData,
    onPaymentSuccess,
    onCancel,
    stripe,
    paypalClientId,
    paypalMode,
    configLoaded,
  };

  const paypalOptions = useMemo(() => ({
    clientId: paypalClientId,
    currency: 'EUR',
    intent: 'capture',
    components: 'buttons',
    disableFunding: 'card,credit',
  }), [paypalClientId]);

  // Wrap in PayPalScriptProvider once clientId is available — never unmounts
  if (paypalClientId) {
    return (
      <PayPalScriptProvider options={paypalOptions}>
        <PaymentPageContent {...contentProps} />
      </PayPalScriptProvider>
    );
  }

  return <PaymentPageContent {...contentProps} />;
}

export default PaymentPage;
