import express from 'express';
import Apartment from '../models/Apartment.js';

const router = express.Router();

// Get all apartments
router.get('/', async (req, res) => {
  try {
    const apartments = await Apartment.find({ available: true });
    res.json(apartments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching apartments', error: error.message });
  }
});

// Get apartment by ID
router.get('/:id', async (req, res) => {
  try {
    const apartment = await Apartment.findById(req.params.id);
    if (!apartment) {
      return res.status(404).json({ message: 'Apartment not found' });
    }
    res.json(apartment);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching apartment', error: error.message });
  }
});

// Search apartments by city
router.get('/search/:city', async (req, res) => {
  try {
    const apartments = await Apartment.find({
      city: { $regex: req.params.city, $options: 'i' },
      available: true
    });
    res.json(apartments);
  } catch (error) {
    res.status(500).json({ message: 'Error searching apartments', error: error.message });
  }
});

// Create apartment (admin)
router.post('/', async (req, res) => {
  try {
    const apartment = new Apartment(req.body);
    await apartment.save();
    res.status(201).json(apartment);
  } catch (error) {
    res.status(400).json({ message: 'Error creating apartment', error: error.message });
  }
});

// Update apartment (admin)
router.put('/:id', async (req, res) => {
  try {
    const apartment = await Apartment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(apartment);
  } catch (error) {
    res.status(400).json({ message: 'Error updating apartment', error: error.message });
  }
});

// Delete apartment (admin)
router.delete('/:id', async (req, res) => {
  try {
    await Apartment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Apartment deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting apartment', error: error.message });
  }
});

export default router;
