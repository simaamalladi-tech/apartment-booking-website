import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const SMOOBU_API_KEY = process.env.SMOOBU_API_KEY;
const SMOOBU_APARTMENT_ID = process.env.SMOOBU_APARTMENT_ID || '1896269';
const SMOOBU_CHANNEL_ID = process.env.SMOOBU_CHANNEL_ID || '2745722';
const SMOOBU_BASE_URL = 'https://login.smoobu.com';

// Simple in-memory cache for rates (5-minute TTL)
let ratesCache = { data: null, expiry: 0 };

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

// ─── POST /api/smoobu/create-booking ───
// Creates a reservation in Smoobu (called internally after successful payment)
router.post('/create-booking', async (req, res) => {
  try {
    const {
      arrivalDate,
      departureDate,
      firstName,
      lastName,
      email,
      phone,
      adults,
      children,
      price,
      notice,
    } = req.body;

    if (!arrivalDate || !departureDate) {
      return res.status(400).json({ success: false, message: 'Dates required' });
    }

    const bookingData = {
      arrivalDate,
      departureDate,
      apartmentId: parseInt(SMOOBU_APARTMENT_ID),
      channelId: parseInt(SMOOBU_CHANNEL_ID),
      firstName: firstName || '',
      lastName: lastName || '',
      email: email || '',
      phone: phone || '',
      adults: adults || 1,
      children: children || 0,
      price: price || 0,
      priceStatus: 1, // paid
      notice: notice || 'Booking via Alt-Berliner Eckkneipe website',
      language: 'de',
    };

    const data = await smoobuFetch(`${SMOOBU_BASE_URL}/api/reservations`, {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });

    // Invalidate rates cache
    ratesCache = { data: null, expiry: 0 };

    res.json({
      success: true,
      smoobuBookingId: data.id,
    });
  } catch (error) {
    console.error('Error creating Smoobu booking:', error.message);
    // Don't fail the whole booking if Smoobu sync fails
    res.status(500).json({ success: false, message: 'Failed to sync with Smoobu' });
  }
});

// ─── GET /api/smoobu/apartment ───
// Returns apartment details from Smoobu
router.get('/apartment', async (req, res) => {
  try {
    const data = await smoobuFetch(`${SMOOBU_BASE_URL}/api/apartments/${SMOOBU_APARTMENT_ID}`);
    res.json(data);
  } catch (error) {
    console.error('Error fetching Smoobu apartment:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch apartment details' });
  }
});

export default router;
