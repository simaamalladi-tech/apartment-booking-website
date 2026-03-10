import express from 'express';
import dotenv from 'dotenv';
import Booking from '../models/Booking.js';
import { sendBookingCancellation, sendAdminNotification } from '../utils/emailService.js';

dotenv.config();

const router = express.Router();

const SMOOBU_API_KEY = process.env.SMOOBU_API_KEY;
const SMOOBU_APARTMENT_ID = process.env.SMOOBU_APARTMENT_ID || '1896269';
const SMOOBU_CHANNEL_ID = process.env.SMOOBU_CHANNEL_ID || '2745722';
const SMOOBU_BASE_URL = 'https://login.smoobu.com';

// Simple in-memory cache for rates (5-minute TTL)
let ratesCache = { data: null, expiry: 0 };

// Simple in-memory cache for apartment details (1-hour TTL)
let apartmentCache = { data: null, expiry: 0 };

// Helper: make authenticated request to Smoobu API
async function smoobuFetch(url, options = {}) {
  if (!SMOOBU_API_KEY) {
    throw new Error('SMOOBU_API_KEY not configured');
  }
  const res = await fetch(url, {
    ...options,
    headers: {
      'Api-Key': SMOOBU_API_KEY,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`Smoobu API error ${res.status}:`, body);
    throw new Error(`Smoobu API responded with ${res.status}`);
  }

  return res.json();
}

// ─── GET /api/smoobu/rates ───
// Returns daily rates + availability for the next 12 months
// Used by the frontend calendar
router.get('/rates', async (req, res) => {
  try {
    const now = Date.now();

    // Return cached data if still fresh (5 minutes)
    if (ratesCache.data && ratesCache.expiry > now) {
      return res.json(ratesCache.data);
    }

    const today = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 12);

    const startStr = today.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    const url = `${SMOOBU_BASE_URL}/api/rates?apartments[]=${SMOOBU_APARTMENT_ID}&start_date=${startStr}&end_date=${endStr}`;
    const data = await smoobuFetch(url);

    // Extract the apartment's rates
    const apartmentRates = data.data?.[SMOOBU_APARTMENT_ID] || {};

    // Transform into a simpler format for the frontend
    const rates = {};
    for (const [date, info] of Object.entries(apartmentRates)) {
      rates[date] = {
        price: info.price,
        available: info.available > 0,
        minStay: info.min_length_of_stay,
      };
    }

    const result = { rates, currency: 'EUR' };

    // Cache for 5 minutes
    ratesCache = { data: result, expiry: now + 5 * 60 * 1000 };

    res.json(result);
  } catch (error) {
    console.error('Error fetching Smoobu rates:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch rates' });
  }
});

// ─── POST /api/smoobu/check-availability ───
// Checks if specific dates are available for booking
router.post('/check-availability', async (req, res) => {
  try {
    const { arrivalDate, departureDate, guests } = req.body;

    if (!arrivalDate || !departureDate) {
      return res.status(400).json({ success: false, message: 'Dates required' });
    }

    // First get the Smoobu user ID
    const meData = await smoobuFetch(`${SMOOBU_BASE_URL}/api/me`);
    const customerId = meData.id;

    const body = {
      arrivalDate,
      departureDate,
      apartments: [parseInt(SMOOBU_APARTMENT_ID)],
      customerId,
    };
    if (guests) body.guests = guests;

    const data = await smoobuFetch(`${SMOOBU_BASE_URL}/booking/checkApartmentAvailability`, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    const isAvailable = data.availableApartments?.includes(parseInt(SMOOBU_APARTMENT_ID));
    const priceInfo = data.prices?.[SMOOBU_APARTMENT_ID];
    const errorInfo = data.errorMessages?.[SMOOBU_APARTMENT_ID];

    res.json({
      available: isAvailable,
      price: priceInfo?.price || null,
      currency: priceInfo?.currency || 'EUR',
      error: errorInfo || null,
    });
  } catch (error) {
    console.error('Error checking Smoobu availability:', error.message);
    res.status(500).json({ success: false, message: 'Failed to check availability' });
  }
});

// ─── GET /api/smoobu/apartment ───
// Returns apartment details from Smoobu
router.get('/apartment', async (req, res) => {
  try {
    const now = Date.now();
    // Return cached data if still fresh (1 hour)
    if (apartmentCache.data && apartmentCache.expiry > now) {
      return res.json(apartmentCache.data);
    }

    const data = await smoobuFetch(`${SMOOBU_BASE_URL}/api/apartments/${SMOOBU_APARTMENT_ID}`);

    // Cache for 1 hour
    apartmentCache = { data, expiry: now + 60 * 60 * 1000 };

    res.json(data);
  } catch (error) {
    console.error('Error fetching Smoobu apartment:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch apartment details' });
  }
});

// ─── CANCELLATION CHECK: Poll Smoobu for cancelled website bookings ───
export async function checkSmoobuCancellations() {
  const SMOOBU_API_KEY = process.env.SMOOBU_API_KEY;
  if (!SMOOBU_API_KEY) return;

  try {
    // Find all confirmed website bookings that have a smoobuBookingId
    // Only check bookings where checkout is still in the future (no need to poll past stays)
    const websiteBookings = await Booking.find({
      smoobuSynced: true,
      smoobuBookingId: { $exists: true, $ne: null },
      status: { $ne: 'cancelled' },
      checkOutDate: { $gte: new Date() },
    });

    if (websiteBookings.length === 0) return;

    console.log(`⟳ Checking ${websiteBookings.length} website booking(s) for cancellations on Smoobu...`);

    for (const booking of websiteBookings) {
      try {
        const res = await fetch(`${SMOOBU_BASE_URL}/api/reservations/${booking.smoobuBookingId}`, {
          headers: {
            'Api-Key': SMOOBU_API_KEY,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          // 404 means the reservation was deleted/cancelled in Smoobu
          if (res.status === 404) {
            console.log(`✗ Smoobu reservation ${booking.smoobuBookingId} not found — marking as cancelled`);
            booking.status = 'cancelled';
            await booking.save();

            // Send cancellation email to customer
            sendBookingCancellation(booking)
              .then(r => console.log(`📧 Cancellation email sent to ${booking.user?.email}:`, r.success))
              .catch(err => console.error('Cancellation email error:', err.message));

            // Notify admin
            sendAdminNotification(booking, 'cancelled')
              .catch(err => console.error('Admin notification error:', err.message));
          }
          continue;
        }

        const reservation = await res.json();

        // Check if Smoobu reservation status indicates cancellation
        // Smoobu uses type/status fields — cancelled reservations have type === 3 or status 'cancelled'
        // Note: do NOT check is-blocked-booking — those are owner date blocks, not cancellations
        const isCancelled =
          reservation.type === 3 ||
          reservation.status === 'cancelled';

        if (isCancelled) {
          console.log(`✗ Smoobu reservation ${booking.smoobuBookingId} is cancelled — sending email`);
          booking.status = 'cancelled';
          await booking.save();

          // Send cancellation email to customer
          sendBookingCancellation(booking)
            .then(r => console.log(`📧 Cancellation email sent to ${booking.user?.email}:`, r.success))
            .catch(err => console.error('Cancellation email error:', err.message));

          // Notify admin
          sendAdminNotification(booking, 'cancelled')
            .catch(err => console.error('Admin notification error:', err.message));
        }
      } catch (err) {
        console.error(`Error checking reservation ${booking.smoobuBookingId}:`, err.message);
      }
    }
  } catch (err) {
    console.error('checkSmoobuCancellations error:', err.message);
  }
}

export default router;
