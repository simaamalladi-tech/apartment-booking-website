import express from 'express';
import Stripe from 'stripe';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Client, Environment, OrdersController } = require('@paypal/paypal-server-sdk');
import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import Apartment from '../models/Apartment.js';
import { requireAdmin } from '../middleware/auth.js';
import { sendBookingConfirmation, sendAdminNotification, sendSmoobuSyncFailedAlert } from '../utils/emailService.js';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

// ─── PayPal client setup ───
let paypalOrdersController = null;
if (process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET) {
  const paypalClient = new Client({
    clientCredentialsAuthCredentials: {
      oAuthClientId: process.env.PAYPAL_CLIENT_ID,
      oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET,
    },
    environment: process.env.PAYPAL_MODE === 'live' ? Environment.Production : Environment.Sandbox,
  });
  paypalOrdersController = new OrdersController(paypalClient);
  console.log(`✓ PayPal initialized (${process.env.PAYPAL_MODE === 'live' ? 'Production' : 'Sandbox'})`);
} else {
  console.warn('PayPal credentials not configured, PayPal payments disabled');
}

// ─── Shared Smoobu availability + pricing check ───
// Returns { calculatedPrice, unavailableDates, minStayViolation } or throws
async function checkSmoobuAvailabilityAndPrice(apartment, checkIn, checkOut, nights) {
  const SMOOBU_API_KEY = process.env.SMOOBU_API_KEY;
  const SMOOBU_APARTMENT_ID = process.env.SMOOBU_APARTMENT_ID || '1896269';
  let calculatedPrice = nights * apartment.price; // fallback

  if (!SMOOBU_API_KEY) {
    return { calculatedPrice, unavailableDates: [], minStayViolation: null };
  }

  try {
    const startStr = checkIn.toISOString().split('T')[0];
    const endStr = checkOut.toISOString().split('T')[0];
    const ratesUrl = `https://login.smoobu.com/api/rates?apartments[]=${SMOOBU_APARTMENT_ID}&start_date=${startStr}&end_date=${endStr}`;
    const ratesRes = await fetch(ratesUrl, {
      headers: { 'Api-Key': SMOOBU_API_KEY, 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
    });

    if (!ratesRes.ok) {
      return { calculatedPrice, unavailableDates: [], minStayViolation: null };
    }

    const ratesData = await ratesRes.json();
    const apartmentRates = ratesData.data?.[SMOOBU_APARTMENT_ID] || {};

    const unavailableDates = [];
    let smoobuTotal = 0;
    let daysWithRate = 0;
    let minStayViolation = null;

    for (let d = new Date(checkIn); d < checkOut; d.setUTCDate(d.getUTCDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const rate = apartmentRates[dateStr];

      if (rate && !rate.available) {
        unavailableDates.push(dateStr);
      }
      if (rate && rate.price) {
        smoobuTotal += rate.price;
        daysWithRate++;
      } else {
        smoobuTotal += apartment.price;
      }
      // Check minimum stay on the check-in date
      if (dateStr === startStr && rate && rate.min_length_of_stay && nights < rate.min_length_of_stay) {
        minStayViolation = rate.min_length_of_stay;
      }
    }

    if (daysWithRate > 0) {
      calculatedPrice = smoobuTotal;
    }

    return { calculatedPrice, unavailableDates, minStayViolation };
  } catch (err) {
    console.error('Smoobu availability/price check failed:', err.message);
    return { calculatedPrice, unavailableDates: [], minStayViolation: null };
  }
}

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

  // Always use parsed dates from the saved booking to avoid raw client strings
  const arrivalDate = savedBooking.checkInDate
    ? savedBooking.checkInDate.toISOString().split('T')[0]
    : new Date(bookingData.checkIn).toISOString().split('T')[0];
  const departureDate = savedBooking.checkOutDate
    ? savedBooking.checkOutDate.toISOString().split('T')[0]
    : new Date(bookingData.checkOut).toISOString().split('T')[0];

  const smoobuBody = {
    arrivalDate,
    departureDate,
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

  // ── Pre-check: verify dates are still available on Smoobu ──
  // This prevents creating reservations that conflict with Airbnb, Booking.com, etc.
  try {
    const checkUrl = `https://login.smoobu.com/api/rates?apartments[]=${SMOOBU_APARTMENT_ID}&start_date=${smoobuBody.arrivalDate}&end_date=${smoobuBody.departureDate}`;
    const checkRes = await fetch(checkUrl, {
      headers: { 'Api-Key': SMOOBU_API_KEY, 'Content-Type': 'application/json' },
    });
    if (checkRes.ok) {
      const checkData = await checkRes.json();
      const rates = checkData.data?.[SMOOBU_APARTMENT_ID] || {};
      const conflicts = [];
      for (const [date, info] of Object.entries(rates)) {
        if (date >= smoobuBody.arrivalDate && date < smoobuBody.departureDate && !info.available) {
          conflicts.push(date);
        }
      }
      if (conflicts.length > 0) {
        const errMsg = `Dates blocked by another channel (Airbnb/Booking.com): ${conflicts.join(', ')}`;
        console.error(`✗ Smoobu sync aborted: ${errMsg}`);
        savedBooking.smoobuSyncError = errMsg;
        await savedBooking.save();
        // Alert admin — this is a paid booking that can't be synced due to conflict
        sendSmoobuSyncFailedAlert(savedBooking, errMsg)
          .catch(err => console.error('Alert email error:', err.message));
        return; // Don't retry — dates are occupied by another channel
      }
    }
  } catch (err) {
    console.warn('Smoobu availability pre-check failed, proceeding with sync:', err.message);
  }

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

    // Validate paymentMethodId format (Stripe payment method IDs start with 'pm_')
    if (typeof paymentMethodId !== 'string' || !paymentMethodId.startsWith('pm_') || paymentMethodId.length > 100) {
      return res.status(400).json({ success: false, message: 'Invalid payment method' });
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

    // ─── SERVER-SIDE AVAILABILITY CHECK + PRICE CALCULATION via Smoobu ───
    const { calculatedPrice: smoobuPrice, unavailableDates, minStayViolation } = 
      await checkSmoobuAvailabilityAndPrice(apartment, checkIn, checkOut, nights);
    let calculatedPrice = smoobuPrice;

    if (unavailableDates.length > 0) {
      console.warn('Booking rejected: dates unavailable on Smoobu:', unavailableDates);
      return res.status(409).json({
        success: false,
        message: `Selected dates are no longer available: ${unavailableDates.join(', ')}`,
        unavailableDates,
      });
    }

    if (minStayViolation) {
      return res.status(400).json({
        success: false,
        message: `Minimum stay for these dates is ${minStayViolation} nights`,
      });
    }

    const amountInCents = Math.round(calculatedPrice * 100);

    // Create Payment Intent with the payment method
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'eur',
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
    });

    // Check if payment succeeded
    if (paymentIntent.status === 'succeeded') {
      // Create booking with server-calculated price
      const booking = new Booking({
        apartment: apartment._id,
        user: {
          email: email.substring(0, 200),
          name: (bookingData.user?.name || 'Guest').substring(0, 100),
          phone: (bookingData.user?.phone || '').substring(0, 30)
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
        paymentProvider: 'stripe',
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
        bookingId: booking._id,
        paymentId: paymentIntent.id
      });
    } else {
      return res.json({
        success: false,
        message: paymentIntent.status === 'requires_action' 
          ? 'This card requires additional authentication. Please try a different card.'
          : 'Payment failed',
        status: paymentIntent.status
      });
    }
  } catch (error) {
    console.error('Payment error:', error);
    // Return Stripe-specific error messages for card declines
    const message = error.type === 'StripeCardError' 
      ? error.message 
      : 'Payment processing error';
    res.status(error.type === 'StripeCardError' ? 400 : 500).json({
      success: false,
      message
    });
  }
});

// Confirm payment
router.post('/confirm', async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    // Validate Stripe payment intent ID format
    if (!paymentIntentId || typeof paymentIntentId !== 'string' || !paymentIntentId.startsWith('pi_')) {
      return res.status(400).json({ success: false, message: 'Invalid payment intent ID' });
    }

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

// Get payment details (admin only)
router.get('/:paymentId', requireAdmin, async (req, res) => {
  try {
    // Validate ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(req.params.paymentId)) {
      return res.status(400).json({ message: 'Invalid payment ID format' });
    }
    const payment = await Payment.findById(req.params.paymentId).populate('booking');
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payment' });
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

// Manual retry endpoint (admin only)
router.post('/retry-smoobu-sync/:bookingId', requireAdmin, async (req, res) => {
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

// ─── PAYPAL: Create Order ───
router.post('/paypal/create-order', async (req, res) => {
  try {
    if (!paypalOrdersController) {
      return res.status(503).json({ success: false, message: 'PayPal is not configured' });
    }

    const { bookingData, email } = req.body;

    if (!bookingData || !email) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address' });
    }

    // Server-side price calculation (same as Stripe flow)
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

    // Smoobu availability check + pricing
    const { calculatedPrice, unavailableDates, minStayViolation } = 
      await checkSmoobuAvailabilityAndPrice(apartment, checkIn, checkOut, nights);

    if (unavailableDates.length > 0) {
      return res.status(409).json({ success: false, message: `Selected dates are no longer available: ${unavailableDates.join(', ')}`, unavailableDates });
    }
    if (minStayViolation) {
      return res.status(400).json({ success: false, message: `Minimum stay for these dates is ${minStayViolation} nights` });
    }

    // Derive the site origin for PayPal return/cancel URLs.
    // Prefer explicit env var, then fall back to the Origin/Referer header.
    const origin =
      process.env.PAYPAL_RETURN_BASE_URL ||
      req.headers.origin ||
      req.headers.referer?.replace(/\/$/, '') ||
      'https://apartment-booking-website-production.up.railway.app';

    const response = await paypalOrdersController.createOrder({
      body: {
        intent: 'CAPTURE',
        purchaseUnits: [{
          amount: {
            currencyCode: 'EUR',
            value: calculatedPrice.toFixed(2),
          },
          description: `Booking: ${checkIn.toISOString().split('T')[0]} – ${checkOut.toISOString().split('T')[0]} (${nights} nights)`,
        }],
        applicationContext: {
          shippingPreference: 'NO_SHIPPING',
          landingPage: 'LOGIN',
          userAction: 'PAY_NOW',
          brandName: 'Alt-Berliner Eckkneipe',
          returnUrl: `${origin}/`,
          cancelUrl: `${origin}/`,
        },
      },
    });

    const order = response.result;
    res.json({
      success: true,
      orderID: order.id,
      calculatedPrice,
    });
  } catch (error) {
    console.error('PayPal create order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create PayPal order' });
  }
});

// ─── PAYPAL: Capture Order (after buyer approves) ───
router.post('/paypal/capture-order', async (req, res) => {
  try {
    if (!paypalOrdersController) {
      return res.status(503).json({ success: false, message: 'PayPal is not configured' });
    }

    const { orderID, bookingData, email } = req.body;

    if (!orderID || !bookingData || !email) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Validate orderID format (alphanumeric PayPal order ID)
    if (typeof orderID !== 'string' || !/^[A-Z0-9]{10,25}$/.test(orderID)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address' });
    }

    // Duplicate capture guard — prevent double bookings from same PayPal order
    const existingPayment = await Payment.findOne({ paypalOrderId: orderID });
    if (existingPayment) {
      const existingBooking = await Booking.findById(existingPayment.booking);
      return res.json({
        success: true,
        message: 'Payment already processed',
        bookingId: existingBooking?._id || existingPayment.booking,
        paymentId: existingPayment.paypalCaptureId || orderID,
      });
    }

    // Capture the payment
    const response = await paypalOrdersController.captureOrder({ id: orderID });
    const captureResult = response.result;

    if (captureResult.status === 'COMPLETED') {
      const captureId = captureResult.purchaseUnits?.[0]?.payments?.captures?.[0]?.id || orderID;
      const capturedAmount = parseFloat(captureResult.purchaseUnits?.[0]?.payments?.captures?.[0]?.amount?.value || 0);

      const apartment = await Apartment.findById(bookingData.apartment?._id || bookingData.apartment?.id);
      if (!apartment) {
        console.error('PayPal capture: apartment not found after payment captured');
        return res.status(404).json({ success: false, message: 'Apartment not found' });
      }

      const checkIn = new Date(bookingData.checkIn);
      const checkOut = new Date(bookingData.checkOut);
      if (isNaN(checkIn) || isNaN(checkOut) || checkOut <= checkIn) {
        console.error('PayPal capture: invalid dates after payment captured');
        return res.status(400).json({ success: false, message: 'Invalid dates' });
      }

      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

      // Verify captured amount matches expected (within €1 tolerance for rounding)
      const { calculatedPrice: expectedPrice } = 
        await checkSmoobuAvailabilityAndPrice(apartment, checkIn, checkOut, nights);
      if (Math.abs(capturedAmount - expectedPrice) > 1) {
        console.error(`PayPal price mismatch: captured €${capturedAmount}, expected €${expectedPrice}`);
        // Still save the booking since money was captured, but flag it
      }

      // Create booking
      const booking = new Booking({
        apartment: apartment._id,
        user: {
          email: email.substring(0, 200),
          name: (bookingData.user?.name || 'Guest').substring(0, 100),
          phone: (bookingData.user?.phone || '').substring(0, 30),
        },
        checkInDate: checkIn,
        checkOutDate: checkOut,
        numberOfGuests: Math.min(bookingData.guests || 1, apartment.maxGuests),
        numberOfNights: nights,
        totalPrice: capturedAmount,
        status: 'confirmed',
        paymentId: captureId,
        paymentStatus: 'completed',
      });
      await booking.save();

      // Create payment record
      const payment = new Payment({
        booking: booking._id,
        paymentProvider: 'paypal',
        paypalOrderId: orderID,
        paypalCaptureId: captureId,
        amount: Math.round(capturedAmount * 100),
        email,
        status: 'succeeded',
      });
      await payment.save();

      // Send emails (non-blocking)
      sendBookingConfirmation(booking).catch(err => console.error('Email error:', err));
      sendAdminNotification(booking, 'new').catch(err => console.error('Admin email error:', err));

      // Sync to Smoobu (non-blocking)
      syncBookingToSmoobu(bookingData, booking, email, capturedAmount)
        .catch(err => console.error('Smoobu sync error:', err));

      return res.json({
        success: true,
        message: 'Payment successful',
        bookingId: booking._id,
        paymentId: captureId,
      });
    } else {
      return res.json({ success: false, message: 'PayPal payment not completed', status: captureResult.status });
    }
  } catch (error) {
    console.error('PayPal capture error:', error);
    res.status(500).json({ success: false, message: 'Failed to capture PayPal payment' });
  }
});

// ─── STRIPE CHECKOUT SESSION (PayPal via Stripe) ───
// Creates a Stripe Checkout Session with PayPal as payment method
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { bookingData, email } = req.body;

    if (!bookingData || !email) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address' });
    }

    // Server-side price calculation (same as other flows)
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

    // Smoobu availability check + pricing
    const { calculatedPrice, unavailableDates, minStayViolation } = 
      await checkSmoobuAvailabilityAndPrice(apartment, checkIn, checkOut, nights);

    if (unavailableDates.length > 0) {
      return res.status(409).json({ success: false, message: `Selected dates are no longer available: ${unavailableDates.join(', ')}`, unavailableDates });
    }
    if (minStayViolation) {
      return res.status(400).json({ success: false, message: `Minimum stay for these dates is ${minStayViolation} nights` });
    }

    const amountInCents = Math.round(calculatedPrice * 100);

    const origin =
      process.env.PAYPAL_RETURN_BASE_URL ||
      req.headers.origin ||
      req.headers.referer?.replace(/\/$/, '') ||
      'https://apartment-booking-website-production.up.railway.app';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['paypal'],
      mode: 'payment',
      customer_email: email.substring(0, 200),
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Alt-Berliner Eckkneipe',
            description: `${checkIn.toISOString().split('T')[0]} – ${checkOut.toISOString().split('T')[0]} (${nights} ${nights === 1 ? 'night' : 'nights'})`,
          },
          unit_amount: amountInCents,
        },
        quantity: 1,
      }],
      metadata: {
        apartmentId: apartment._id.toString(),
        checkIn: checkIn.toISOString().split('T')[0],
        checkOut: checkOut.toISOString().split('T')[0],
        guests: String(Math.min(bookingData.guests || 1, apartment.maxGuests)),
        userName: (bookingData.user?.name || 'Guest').substring(0, 100),
        userPhone: (bookingData.user?.phone || '').substring(0, 30),
        userEmail: email.substring(0, 200),
        calculatedPrice: String(calculatedPrice),
        nights: String(nights),
      },
      success_url: `${origin}/?checkout_session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?checkout_cancelled=1`,
    });

    res.json({ success: true, url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Stripe Checkout Session error:', error);
    const message = error.type === 'StripeInvalidRequestError'
      ? 'PayPal is not enabled in Stripe. Please enable it in your Stripe Dashboard.'
      : 'Failed to create checkout session';
    res.status(500).json({ success: false, message });
  }
});

// ─── VERIFY STRIPE CHECKOUT SESSION ───
// Called when user returns from Stripe Checkout to verify payment and create booking
router.get('/checkout-session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Validate session ID format (starts with cs_)
    if (!sessionId || typeof sessionId !== 'string' || !sessionId.startsWith('cs_') || sessionId.length > 200) {
      return res.status(400).json({ success: false, message: 'Invalid session ID' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return res.json({ success: false, message: 'Payment not completed' });
    }

    // Check if booking already exists (may have been created by webhook)
    const existingPayment = await Payment.findOne({ stripePaymentId: session.payment_intent });
    if (existingPayment) {
      const existingBooking = await Booking.findById(existingPayment.booking);
      return res.json({
        success: true,
        bookingId: existingBooking?._id || existingPayment.booking,
        paymentId: session.payment_intent,
        booking: existingBooking,
      });
    }

    // Create booking from session metadata (webhook hasn't fired yet)
    const meta = session.metadata;
    const apartment = await Apartment.findById(meta.apartmentId);
    if (!apartment) {
      return res.status(404).json({ success: false, message: 'Apartment not found' });
    }

    const checkIn = new Date(meta.checkIn);
    const checkOut = new Date(meta.checkOut);
    const calculatedPrice = parseFloat(meta.calculatedPrice);

    let booking, payment;
    try {
      booking = new Booking({
        apartment: apartment._id,
        user: {
          email: meta.userEmail,
          name: meta.userName,
          phone: meta.userPhone || '',
        },
        checkInDate: checkIn,
        checkOutDate: checkOut,
        numberOfGuests: parseInt(meta.guests) || 1,
        numberOfNights: parseInt(meta.nights),
        totalPrice: calculatedPrice,
        status: 'confirmed',
        paymentId: session.payment_intent,
        paymentStatus: 'completed',
      });
      await booking.save();

      payment = new Payment({
        booking: booking._id,
        paymentProvider: 'stripe_paypal',
        stripePaymentId: session.payment_intent,
        amount: session.amount_total,
        email: meta.userEmail,
        status: 'succeeded',
      });
      await payment.save();
    } catch (err) {
      if (err.code === 11000) {
        // Duplicate — webhook already created this booking
        const dupPayment = await Payment.findOne({ stripePaymentId: session.payment_intent });
        const dupBooking = dupPayment ? await Booking.findById(dupPayment.booking) : null;
        return res.json({
          success: true,
          bookingId: dupBooking?._id || dupPayment?.booking,
          paymentId: session.payment_intent,
          booking: dupBooking,
        });
      }
      throw err;
    }

    // Send emails (non-blocking)
    sendBookingConfirmation(booking).catch(err => console.error('Email error:', err));
    sendAdminNotification(booking, 'new').catch(err => console.error('Admin email error:', err));

    // Sync to Smoobu (non-blocking)
    syncBookingToSmoobu({
      checkIn: meta.checkIn,
      checkOut: meta.checkOut,
      user: { name: meta.userName, email: meta.userEmail, phone: meta.userPhone },
      guests: parseInt(meta.guests) || 1,
    }, booking, meta.userEmail, calculatedPrice)
      .catch(err => console.error('Smoobu sync error:', err));

    return res.json({
      success: true,
      bookingId: booking._id,
      paymentId: session.payment_intent,
      booking,
    });
  } catch (error) {
    console.error('Checkout session verification error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify payment' });
  }
});

// Webhook endpoint for Stripe events
// Note: express.raw() is applied at the server level for this path (before express.json)
router.post('/webhook', async (req, res) => {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET not set — webhook cannot verify signatures');
    return res.status(503).json({ received: false, message: 'Webhook not configured' });
  }

  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log('Webhook: Payment succeeded:', event.data.object.id);
        break;
      case 'checkout.session.completed': {
        // Handle Stripe Checkout (PayPal via Stripe) completions
        const session = event.data.object;
        if (session.payment_status === 'paid') {
          // Check if booking already exists (may have been created by the verification endpoint)
          const existingPayment = await Payment.findOne({ stripePaymentId: session.payment_intent });
          if (!existingPayment) {
            const meta = session.metadata;
            const apartment = await Apartment.findById(meta.apartmentId);
            if (apartment) {
              const checkIn = new Date(meta.checkIn);
              const checkOut = new Date(meta.checkOut);
              const calculatedPrice = parseFloat(meta.calculatedPrice);

              try {
                const booking = new Booking({
                  apartment: apartment._id,
                  user: {
                    email: meta.userEmail,
                    name: meta.userName,
                    phone: meta.userPhone || '',
                  },
                  checkInDate: checkIn,
                  checkOutDate: checkOut,
                  numberOfGuests: parseInt(meta.guests) || 1,
                  numberOfNights: parseInt(meta.nights),
                  totalPrice: calculatedPrice,
                  status: 'confirmed',
                  paymentId: session.payment_intent,
                  paymentStatus: 'completed',
                });
                await booking.save();

                const payment = new Payment({
                  booking: booking._id,
                  paymentProvider: 'stripe_paypal',
                  stripePaymentId: session.payment_intent,
                  amount: session.amount_total,
                  email: meta.userEmail,
                  status: 'succeeded',
                });
                await payment.save();

                sendBookingConfirmation(booking).catch(err => console.error('Email error:', err));
                sendAdminNotification(booking, 'new').catch(err => console.error('Admin email error:', err));

                syncBookingToSmoobu({
                  checkIn: meta.checkIn,
                  checkOut: meta.checkOut,
                  user: { name: meta.userName, email: meta.userEmail, phone: meta.userPhone },
                  guests: parseInt(meta.guests) || 1,
                }, booking, meta.userEmail, calculatedPrice)
                .catch(err => console.error('Smoobu sync error:', err));

                console.log('Webhook: Checkout session booking created:', booking._id);
              } catch (dupErr) {
                if (dupErr.code === 11000) {
                  console.log('Webhook: Duplicate prevented — booking already created for:', session.payment_intent);
                } else {
                  throw dupErr;
                }
              }
            }
          } else {
            console.log('Webhook: Checkout session booking already exists for:', session.payment_intent);
          }
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const pi = event.data.object;
        console.warn('Webhook: Payment failed:', pi.id);
        const failedPayment = await Payment.findOne({ stripePaymentId: pi.id });
        if (failedPayment) {
          failedPayment.status = 'failed';
          await failedPayment.save();
          const failedBooking = await Booking.findById(failedPayment.booking);
          if (failedBooking) {
            failedBooking.paymentStatus = 'failed';
            failedBooking.status = 'cancelled';
            await failedBooking.save();
          }
        }
        break;
      }
      case 'charge.refunded': {
        const charge = event.data.object;
        console.log('Webhook: Charge refunded:', charge.payment_intent);
        const refundedPayment = await Payment.findOne({ stripePaymentId: charge.payment_intent });
        if (refundedPayment) {
          refundedPayment.status = 'canceled';
          await refundedPayment.save();
          const refundedBooking = await Booking.findById(refundedPayment.booking);
          if (refundedBooking) {
            refundedBooking.paymentStatus = 'failed';
            refundedBooking.status = 'cancelled';
            await refundedBooking.save();
          }
        }
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook signature verification failed');
    res.status(400).json({ received: false });
  }
});

export default router;
