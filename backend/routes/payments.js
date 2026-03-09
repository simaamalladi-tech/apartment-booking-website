import express from 'express';
import Stripe from 'stripe';
import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import Apartment from '../models/Apartment.js';
import { sendBookingConfirmation, sendAdminNotification, sendSmoobuSyncFailedAlert } from '../utils/emailService.js';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

// Helper: Sync booking to Smoobu after successful payment (with retry)
async function syncBookingToSmoobu(bookingData, savedBooking, email, totalPrice, maxRetries = 3) {
  const SMOOBU_API_KEY = process.env.SMOOBU_API_KEY;
  const SMOOBU_APARTMENT_ID = process.env.SMOOBU_APARTMENT_ID || '1896269';
  const SMOOBU_CHANNEL_ID = process.env.SMOOBU_CHANNEL_ID || '2745722';

  if (!SMOOBU_API_KEY) {
    console.warn('SMOOBU_API_KEY not set, skipping Smoobu sync');
    savedBooking.smoobuSyncError = 'API key not configured';
    await savedBooking.save();
    return;
  }

  // Split name into first/last
  const fullName = bookingData.user?.name || savedBooking.user?.name || 'Guest';
  const nameParts = fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || 'Guest';
  const lastName = nameParts.slice(1).join(' ') || '';

  const smoobuBody = {
    arrivalDate: bookingData.checkIn || savedBooking.checkInDate?.toISOString().split('T')[0],
    departureDate: bookingData.checkOut || savedBooking.checkOutDate?.toISOString().split('T')[0],
    apartmentId: parseInt(SMOOBU_APARTMENT_ID),
    channelId: parseInt(SMOOBU_CHANNEL_ID),
    firstName,
    lastName,
    email: email || bookingData.user?.email || savedBooking.user?.email || '',
    phone: bookingData.user?.phone || savedBooking.user?.phone || '',
    adults: bookingData.guests || savedBooking.numberOfGuests || 1,
    price: totalPrice || savedBooking.totalPrice,
    priceStatus: 1,
    notice: `Website booking #${savedBooking._id}`,
    language: 'de',
  };

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      savedBooking.smoobuSyncAttempts = (savedBooking.smoobuSyncAttempts || 0) + 1;
      await savedBooking.save();

      const res = await fetch('https://login.smoobu.com/api/reservations', {
        method: 'POST',
        headers: {
          'Api-Key': SMOOBU_API_KEY,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify(smoobuBody),
      });

      if (res.ok) {
        const data = await res.json();
        console.log(`✓ Booking synced to Smoobu on attempt ${attempt}, ID:`, data.id);
        savedBooking.smoobuBookingId = data.id;
        savedBooking.smoobuSynced = true;
        savedBooking.smoobuSyncError = null;
        await savedBooking.save();
        return; // success
      } else {
        const errText = await res.text();
        console.error(`✗ Smoobu sync attempt ${attempt}/${maxRetries} failed:`, res.status, errText);
        savedBooking.smoobuSyncError = `HTTP ${res.status}: ${errText.substring(0, 200)}`;
        await savedBooking.save();
      }
    } catch (err) {
      console.error(`✗ Smoobu sync attempt ${attempt}/${maxRetries} error:`, err.message);
      savedBooking.smoobuSyncError = err.message.substring(0, 200);
      await savedBooking.save();
    }

    // Exponential backoff: 2s, 4s, 8s
    if (attempt < maxRetries) {
      await new Promise(r => setTimeout(r, 2000 * Math.pow(2, attempt - 1)));
    }
  }

  console.error(`✗ Smoobu sync failed after ${maxRetries} attempts for booking ${savedBooking._id}`);

  // Alert admin via email
  sendSmoobuSyncFailedAlert(savedBooking, savedBooking.smoobuSyncError)
    .then(() => console.log('✉ Admin alerted about Smoobu sync failure'))
    .catch(err => console.error('Failed to send Smoobu sync failure alert:', err.message));
}

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

    // Server-side price calculation — fetch dynamic rates from Smoobu
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

    // ─── SERVER-SIDE AVAILABILITY CHECK via Smoobu ───
    const SMOOBU_API_KEY = process.env.SMOOBU_API_KEY;
    const SMOOBU_APARTMENT_ID = process.env.SMOOBU_APARTMENT_ID || '1896269';
    if (SMOOBU_API_KEY) {
      try {
        const startStr = bookingData.checkIn;
        const endStr = bookingData.checkOut;
        const ratesUrl = `https://login.smoobu.com/api/rates?apartments[]=${SMOOBU_APARTMENT_ID}&start_date=${startStr}&end_date=${endStr}`;
        const ratesRes = await fetch(ratesUrl, {
          headers: { 'Api-Key': SMOOBU_API_KEY, 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
        });
        if (ratesRes.ok) {
          const ratesData = await ratesRes.json();
          const apartmentRates = ratesData.data?.[SMOOBU_APARTMENT_ID] || {};
          // Check every night for availability
          const unavailableDates = [];
          for (let d = new Date(checkIn); d < checkOut; d.setUTCDate(d.getUTCDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const rate = apartmentRates[dateStr];
            if (rate && !rate.available) {
              unavailableDates.push(dateStr);
            }
          }
          if (unavailableDates.length > 0) {
            console.warn('Booking rejected: dates unavailable on Smoobu:', unavailableDates);
            return res.status(409).json({
              success: false,
              message: `Selected dates are no longer available: ${unavailableDates.join(', ')}`,
              unavailableDates,
            });
          }
        }
      } catch (err) {
        console.error('Smoobu availability check failed:', err.message);
        // Continue with payment — availability check is best-effort
      }
    }

    // ─── SERVER-SIDE PRICE CALCULATION via Smoobu ───
    let calculatedPrice = nights * apartment.price; // fallback
    if (SMOOBU_API_KEY) {
      try {
        const startStr = bookingData.checkIn;
        const endStr = bookingData.checkOut;
        const ratesUrl = `https://login.smoobu.com/api/rates?apartments[]=${SMOOBU_APARTMENT_ID}&start_date=${startStr}&end_date=${endStr}`;
        const ratesRes = await fetch(ratesUrl, {
          headers: { 'Api-Key': SMOOBU_API_KEY, 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
        });
        if (ratesRes.ok) {
          const ratesData = await ratesRes.json();
          const apartmentRates = ratesData.data?.[SMOOBU_APARTMENT_ID] || {};
          let smoobuTotal = 0;
          let daysWithRate = 0;
          for (let d = new Date(checkIn); d < checkOut; d.setUTCDate(d.getUTCDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const rate = apartmentRates[dateStr];
            if (rate && rate.price) {
              smoobuTotal += rate.price;
              daysWithRate++;
            } else {
              smoobuTotal += apartment.price;
            }
          }
          if (daysWithRate > 0) {
            calculatedPrice = smoobuTotal;
            console.log(`Smoobu pricing: ${daysWithRate}/${nights} days with rate, total: €${calculatedPrice}`);
          }
        }
      } catch (err) {
        console.error('Smoobu rate fetch for payment failed, using base price:', err.message);
      }
    }

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

      // Sync booking to Smoobu (non-blocking, with retry)
      syncBookingToSmoobu(bookingData, booking, email, calculatedPrice)
        .catch(err => console.error('Smoobu sync error:', err));

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

// ─── RETRY UNSYNCED BOOKINGS TO SMOOBU ───
// Finds all confirmed bookings missing smoobuSynced and retries them
export async function retryUnsyncedBookings() {
  try {
    const unsynced = await Booking.find({
      status: 'confirmed',
      paymentStatus: 'completed',
      smoobuSynced: { $ne: true },
    }).sort({ createdAt: -1 });

    if (unsynced.length === 0) {
      console.log('✓ All bookings synced to Smoobu');
      return;
    }

    console.log(`⟳ Found ${unsynced.length} unsynced booking(s), retrying...`);
    for (const booking of unsynced) {
      const bookingData = {
        checkIn: booking.checkInDate?.toISOString().split('T')[0],
        checkOut: booking.checkOutDate?.toISOString().split('T')[0],
        user: booking.user,
        guests: booking.numberOfGuests,
      };
      await syncBookingToSmoobu(bookingData, booking, booking.user?.email, booking.totalPrice, 2);
    }
  } catch (err) {
    console.error('Retry unsynced bookings error:', err.message);
  }
}

// Manual retry endpoint
router.post('/retry-smoobu-sync/:bookingId', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.smoobuSynced) return res.json({ success: true, message: 'Already synced', smoobuBookingId: booking.smoobuBookingId });

    const bookingData = {
      checkIn: booking.checkInDate?.toISOString().split('T')[0],
      checkOut: booking.checkOutDate?.toISOString().split('T')[0],
      user: booking.user,
      guests: booking.numberOfGuests,
    };
    await syncBookingToSmoobu(bookingData, booking, booking.user?.email, booking.totalPrice, 3);

    const updated = await Booking.findById(booking._id);
    res.json({
      success: updated.smoobuSynced,
      smoobuBookingId: updated.smoobuBookingId || null,
      error: updated.smoobuSyncError || null,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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
