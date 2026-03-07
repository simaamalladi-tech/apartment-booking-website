import express from 'express';
import net from 'net';
import Booking from '../models/Booking.js';
import Apartment from '../models/Apartment.js';
import { sendBookingConfirmation, sendBookingCancellation, sendBookingPending, sendAdminNotification } from '../utils/emailService.js';

const router = express.Router();

// Diagnostic: test SMTP port connectivity
router.get('/test-smtp', async (req, res) => {
  const results = {};
  const ports = [25, 465, 587, 2525];
  
  for (const port of ports) {
    results[port] = await new Promise((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(5000);
      socket.on('connect', () => { socket.destroy(); resolve('open'); });
      socket.on('timeout', () => { socket.destroy(); resolve('timeout'); });
      socket.on('error', (e) => { socket.destroy(); resolve(`error: ${e.message}`); });
      socket.connect(port, 'smtp.gmail.com');
    });
  }
  
  res.json({ smtpConnectivity: results, nodeVersion: process.version });
});
// Get booked dates for an apartment (used by calendar to block dates)
router.get('/booked-dates/:apartmentId', async (req, res) => {
  try {
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
    res.status(500).json({ message: 'Error fetching booked dates', error: error.message });
  }
});

// Create a new booking
router.post('/', async (req, res) => {
  try {
    const { apartment, user, checkInDate, checkOutDate, numberOfGuests, numberOfNights, totalPrice } = req.body;

    // Check for date conflicts
    const conflict = await Booking.findOne({
      apartment,
      status: { $in: ['confirmed', 'pending'] },
      $or: [
        { checkInDate: { $lt: new Date(checkOutDate) }, checkOutDate: { $gt: new Date(checkInDate) } }
      ]
    });

    if (conflict) {
      return res.status(409).json({ success: false, message: 'These dates are already booked.' });
    }

    const booking = new Booking({
      apartment,
      user,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      numberOfNights,
      totalPrice,
      status: 'pending'
    });

    await booking.save();

    // Send emails (non-blocking)
    sendBookingPending(booking).catch(err => console.error('Email error:', err));
    sendAdminNotification(booking, 'new').catch(err => console.error('Admin email error:', err));

    res.status(201).json({ success: true, booking });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error creating booking', error: error.message });
  }
});

// Get all bookings
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find().populate('apartment');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
});

// Get booking by ID
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('apartment');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booking', error: error.message });
  }
});

// Get bookings by email
router.get('/email/:email', async (req, res) => {
  try {
    const bookings = await Booking.find({ 'user.email': req.params.email }).populate('apartment');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
});

// Update booking status
router.put('/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    // Send email based on new status
    if (req.body.status === 'confirmed') {
      sendBookingConfirmation(booking).catch(err => console.error('Email error:', err));
    } else if (req.body.status === 'cancelled') {
      sendBookingCancellation(booking).catch(err => console.error('Email error:', err));
    }

    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: 'Error updating booking', error: error.message });
  }
});

// Cancel booking
router.delete('/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );

    // Send cancellation email
    sendBookingCancellation(booking).catch(err => console.error('Email error:', err));

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error cancelling booking', error: error.message });
  }
});

// Resend email for a booking
router.post('/:id/send-email', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    let result;
    if (booking.status === 'confirmed') {
      result = await sendBookingConfirmation(booking);
    } else if (booking.status === 'cancelled') {
      result = await sendBookingCancellation(booking);
    } else {
      result = await sendBookingPending(booking);
    }

    res.json({ success: true, emailResult: result });
  } catch (error) {
    res.status(500).json({ message: 'Error sending email', error: error.message });
  }
});

export default router;
