import express from 'express';
import Booking from '../models/Booking.js';
import Apartment from '../models/Apartment.js';
import { sendBookingConfirmation, sendBookingCancellation, sendBookingPending, sendAdminNotification } from '../utils/emailService.js';

const router = express.Router();
// Get booked dates for an apartment (public - needed for calendar)
router.get('/booked-dates/:apartmentId', async (req, res) => {
  try {
    // Validate ObjectId format
    if (!req.params.apartmentId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid apartment ID' });
    }

    const bookings = await Booking.find({
      apartment: req.params.apartmentId,
      status: { $in: ['confirmed', 'pending'] }
    }).select('checkInDate checkOutDate');

    // Build array of all booked date strings (YYYY-MM-DD)
    const bookedDates = [];
    bookings.forEach(b => {
      const start = new Date(b.checkInDate);
      const end = new Date(b.checkOutDate);
      for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        bookedDates.push(d.toISOString().split('T')[0]);
      }
    });

    res.json([...new Set(bookedDates)]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booked dates' });
  }
});

// Create a new booking
router.post('/', async (req, res) => {
  try {
    const { apartment, user, checkInDate, checkOutDate, numberOfGuests, numberOfNights } = req.body;

    // Validate required fields
    if (!apartment || !user?.email || !checkInDate || !checkOutDate || !numberOfGuests || !numberOfNights) {
      return res.status(400).json({ success: false, message: 'Missing required booking fields' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address' });
    }

    // Validate dates
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    if (isNaN(checkIn) || isNaN(checkOut) || checkOut <= checkIn) {
      return res.status(400).json({ success: false, message: 'Invalid date range' });
    }

    // Don't allow bookings in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (checkIn < today) {
      return res.status(400).json({ success: false, message: 'Cannot book dates in the past' });
    }

    // Server-side price calculation
    const apartmentDoc = await Apartment.findById(apartment);
    if (!apartmentDoc) {
      return res.status(404).json({ success: false, message: 'Apartment not found' });
    }

    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const calculatedPrice = nights * apartmentDoc.price;

    // Validate guest count
    if (numberOfGuests < 1 || numberOfGuests > apartmentDoc.maxGuests) {
      return res.status(400).json({ success: false, message: `Maximum ${apartmentDoc.maxGuests} guests allowed` });
    }

    // Check for date conflicts
    const conflict = await Booking.findOne({
      apartment,
      status: { $in: ['confirmed', 'pending'] },
      $or: [
        { checkInDate: { $lt: checkOut }, checkOutDate: { $gt: checkIn } }
      ]
    });

    if (conflict) {
      return res.status(409).json({ success: false, message: 'These dates are already booked.' });
    }

    const booking = new Booking({
      apartment,
      user: { name: (user.name || 'Guest').substring(0, 100), email: user.email.substring(0, 200) },
      checkInDate: checkIn,
      checkOutDate: checkOut,
      numberOfGuests,
      numberOfNights: nights,
      totalPrice: calculatedPrice,
      status: 'pending'
    });

    await booking.save();

    // Send emails (non-blocking)
    sendBookingPending(booking).catch(err => console.error('Email error:', err));
    sendAdminNotification(booking, 'new').catch(err => console.error('Admin email error:', err));

    res.status(201).json({ success: true, booking });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error creating booking' });
  }
});

export default router;
