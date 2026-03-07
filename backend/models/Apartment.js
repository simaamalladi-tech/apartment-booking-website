import mongoose from 'mongoose';

const apartmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  city: {
    type: String,
    required: true
  },
  address: String,
  price: {
    type: Number,
    required: true
  },
  beds: {
    type: Number,
    default: 1
  },
  baths: {
    type: Number,
    default: 1
  },
  maxGuests: {
    type: Number,
    default: 4
  },
  size: {
    type: Number,
    default: 0
  },
  amenities: [String],
  image: String,
  images: {
    type: [String],
    default: []
  },
  available: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Apartment', apartmentSchema);
