import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  paymentProvider: {
    type: String,
    enum: ['stripe', 'paypal', 'stripe_paypal'],
    default: 'stripe'
  },
  stripePaymentId: {
    type: String
  },
  stripePaymentMethodId: String,
  paypalOrderId: String,
  paypalCaptureId: String,
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'EUR'
  },
  status: {
    type: String,
    enum: ['pending', 'succeeded', 'failed', 'canceled'],
    default: 'pending'
  },
  email: {
    type: String,
    required: true
  },
  billingDetails: {
    name: String,
    address: String,
    city: String,
    zipCode: String,
    country: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Payment', paymentSchema);
