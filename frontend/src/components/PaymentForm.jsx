import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useTranslation } from 'react-i18next';
import './PaymentForm.css';

function PaymentForm({ bookingData, onSuccess }) {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'Germany'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    try {
      // Create payment method
      const { error: methodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
        billing_details: {
          email: formData.email,
          name: formData.name,
          address: {
            line1: formData.address,
            city: formData.city,
            postal_code: formData.zipCode,
            country: 'DE'
          }
        }
      });

      if (methodError) {
        setError(methodError.message);
        setLoading(false);
        return;
      }

      // Call backend to create payment intent
      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: bookingData.totalPrice * 100, // Convert to cents
          bookingData: bookingData,
          paymentMethodId: paymentMethod.id,
          email: formData.email
        })
      });

      const paymentData = await response.json();

      if (paymentData.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        setError(paymentData.message || 'Payment failed');
      }
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="payment-success">
        <div className="success-icon">✓</div>
        <h2>{t('payment.success')}</h2>
        <p>{t('payment.bookingConfirmed')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="form-section">
        <h3>{t('payment.cardInfo')}</h3>

        <div className="form-group">
          <label>{t('payment.email')}</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>{t('payment.name')}</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>{t('payment.cardInfo')}</label>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#333',
                  '::placeholder': {
                    color: '#aaa'
                  }
                },
                invalid: {
                  color: '#fa755a'
                }
              }
            }}
          />
        </div>
      </div>

      <div className="form-section">
        <h3>{t('payment.billingAddress')}</h3>

        <div className="form-group">
          <label>{t('payment.address')}</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>{t('payment.city')}</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('payment.zipCode')}</label>
            <input
              type="text"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>{t('payment.country')}</label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            disabled
          />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="pay-btn"
      >
        {loading ? t('payment.processing') : `${t('payment.pay')} €${bookingData.totalPrice}`}
      </button>
    </form>
  );
}

export default PaymentForm;
