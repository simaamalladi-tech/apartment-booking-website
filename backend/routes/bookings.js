import express from 'express';
import Booking from '../models/Booking.js';
import Apartment from '../models/Apartment.js';
import { sendBookingPending, sendAdminNotification } from '../utils/emailService.js';

const router = express.Router();

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
