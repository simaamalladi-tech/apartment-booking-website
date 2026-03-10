import express from 'express';

const router = express.Router();

// All bookings go through the payment flow (/api/payments/create-payment-intent)
// which handles Stripe payment, Smoobu sync, and confirmation emails.
// No separate booking creation endpoint is needed.

export default router;
