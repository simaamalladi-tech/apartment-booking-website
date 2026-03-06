import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, Elements, useStripe, useElements } from '@stripe/react-stripe-js';
import { useTranslation } from 'react-i18next';
import PaymentForm from '../components/PaymentForm';
import './PaymentPage.css';

const stripePromise = loadStripe('pk_test_51234567890abcdefghijklmnop'); // Replace with your Stripe key

function PaymentPage({ bookingData, onPaymentSuccess, onCancel }) {
  const { t } = useTranslation();

  return (
    <div className="payment-page">
      <div className="payment-container">
        <button className="back-btn" onClick={onCancel}>← {t('common.cancel')}</button>

        <h1>{t('payment.title')}</h1>

        <div className="payment-grid">
          <div className="payment-form-section">
            <Elements stripe={stripePromise}>
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
      </div>
    </div>
  );
}

export default PaymentPage;
