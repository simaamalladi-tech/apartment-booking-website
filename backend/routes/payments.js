import express from 'express';
import Stripe from 'stripe';
import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

// Create payment intent
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, bookingData, paymentMethodId, email } = req.body;

    if (!amount || !paymentMethodId || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Create Payment Intent with the payment method
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount in cents
      currency: 'eur',
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: {
        enabled: false,
        allow_redirects: 'never'
      }
    });

    // Check if payment succeeded
    if (paymentIntent.status === 'succeeded') {
      // Create booking
      const booking = new Booking({
        apartment: bookingData.apartment._id || bookingData.apartment.id,
        user: {
          email: email,
          name: bookingData.user?.name || 'Guest'
        },
        checkInDate: bookingData.checkIn,
        checkOutDate: bookingData.checkOut,
        numberOfGuests: bookingData.guests,
        numberOfNights: bookingData.nights,
        totalPrice: bookingData.totalPrice,
        status: 'confirmed',
        paymentId: paymentIntent.id,
        paymentStatus: 'completed'
      });

      await booking.save();

      // Create payment record
      const payment = new Payment({
        booking: booking._id,
        stripePaymentId: paymentIntent.id,
        stripePaymentMethodId: paymentMethodId,
        amount: amount,
        email: email,
        status: 'succeeded'
      });

      await payment.save();

      return res.json({
        success: true,
        message: 'Payment successful',
        clientSecret: paymentIntent.client_secret,
        bookingId: booking._id,
        paymentId: paymentIntent.id
      });
    } else {
      return res.json({
        success: false,
        message: 'Payment failed',
        status: paymentIntent.status
      });
    }
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment processing error',
      error: error.message
    });
  }
});

// Confirm payment
router.post('/confirm', async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      res.json({ success: true, message: 'Payment confirmed' });
    } else {
      res.json({ success: false, message: 'Payment not completed' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error confirming payment', error: error.message });
  }
});

// Get payment details
router.get('/:paymentId', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId).populate('booking');
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payment', error: error.message });
  }
});

// Webhook endpoint for Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log('Payment succeeded:', event.data.object.id);
        break;
      case 'payment_intent.payment_failed':
        console.log('Payment failed:', event.data.object.id);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

export default router;
