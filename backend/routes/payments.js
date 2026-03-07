import express from 'express';
import Stripe from 'stripe';
import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import Apartment from '../models/Apartment.js';
import { sendBookingConfirmation, sendAdminNotification } from '../utils/emailService.js';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

// Create payment intent
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { bookingData, paymentMethodId, email } = req.body;

    if (!bookingData || !paymentMethodId || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address' });
    }

    // Server-side price calculation — never trust the client
    const apartment = await Apartment.findById(bookingData.apartment?._id || bookingData.apartment?.id);
    if (!apartment) {
      return res.status(404).json({ success: false, message: 'Apartment not found' });
    }

    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    if (isNaN(checkIn) || isNaN(checkOut) || checkOut <= checkIn) {
      return res.status(400).json({ success: false, message: 'Invalid dates' });
    }

    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const calculatedPrice = nights * apartment.price;
    const amountInCents = Math.round(calculatedPrice * 100);

    // Create Payment Intent with the payment method
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'eur',
      payment_method: paymentMethodId,
      confirm: true,
      payment_method_types: ['card']
    });

    // Check if payment succeeded
    if (paymentIntent.status === 'succeeded') {
      // Create booking with server-calculated price
      const booking = new Booking({
        apartment: apartment._id,
        user: {
          email: email.substring(0, 200),
          name: (bookingData.user?.name || 'Guest').substring(0, 100)
        },
        checkInDate: checkIn,
        checkOutDate: checkOut,
        numberOfGuests: Math.min(bookingData.guests || 1, apartment.maxGuests),
        numberOfNights: nights,
        totalPrice: calculatedPrice,
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
        amount: amountInCents,
        email: email,
        status: 'succeeded'
      });

      await payment.save();

      // Send confirmation email (non-blocking)
      sendBookingConfirmation(booking).catch(err => console.error('Email error:', err));
      sendAdminNotification(booking, 'new').catch(err => console.error('Admin email error:', err));

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
      message: 'Payment processing error'
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
    res.status(500).json({ success: false, message: 'Error confirming payment' });
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
