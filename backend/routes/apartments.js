import express from 'express';
import Apartment from '../models/Apartment.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all apartments
router.get('/', async (req, res) => {
  try {
    const apartments = await Apartment.find({ available: true });
    res.json(apartments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching apartments' });
  }
});

// Get apartment by ID
router.get('/:id', async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid apartment ID' });
    }
    const apartment = await Apartment.findById(req.params.id);
    if (!apartment) {
      return res.status(404).json({ message: 'Apartment not found' });
    }
    res.json(apartment);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching apartment' });
  }
});

// Search apartments by city
router.get('/search/:city', async (req, res) => {
  try {
    // Escape regex special characters to prevent ReDoS
    const safeCity = req.params.city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const apartments = await Apartment.find({
      city: { $regex: safeCity, $options: 'i' },
      available: true
    });
    res.json(apartments);
  } catch (error) {
    res.status(500).json({ message: 'Error searching apartments' });
  }
});

// Create apartment (admin only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { title, description, price, address, city, beds, baths, size, maxGuests, images, amenities } = req.body;
    const apartment = new Apartment({ title, description, price, address, city, beds, baths, size, maxGuests, images, amenities });
    await apartment.save();
    res.status(201).json(apartment);
  } catch (error) {
    res.status(400).json({ message: 'Error creating apartment' });
  }
});

// Update apartment (admin only)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid apartment ID' });
    }
    const { title, description, price, address, city, beds, baths, size, maxGuests, images, amenities, available } = req.body;
    const apartment = await Apartment.findByIdAndUpdate(
      req.params.id,
      { title, description, price, address, city, beds, baths, size, maxGuests, images, amenities, available },
      { new: true }
    );
    res.json(apartment);
  } catch (error) {
    res.status(400).json({ message: 'Error updating apartment' });
  }
});

// Delete apartment (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid apartment ID' });
    }
    await Apartment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Apartment deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting apartment' });
  }
});

export default router;
