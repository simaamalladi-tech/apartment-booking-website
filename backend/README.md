# Apartment Booking Backend - Stripe Payment Controller

Handles all payment processing and bookings for the apartment booking system.

## Features

- Stripe payment integration
- Booking management
- Payment status tracking
- Webhook support for payment events

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with:
```
MONGODB_URI=mongodb://localhost:27017/apartment-booking
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
PORT=5000
```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### Apartments
- `GET /api/apartments` - Get all apartments
- `GET /api/apartments/:id` - Get apartment by ID
- `GET /api/apartments/search/:city` - Search apartments by city
- `POST /api/apartments` - Create apartment (admin)
- `PUT /api/apartments/:id` - Update apartment (admin)
- `DELETE /api/apartments/:id` - Delete apartment (admin)

### Bookings
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/:id` - Get booking by ID
- `GET /api/bookings/email/:email` - Get bookings by email
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

### Payments
- `POST /api/payments/create-payment-intent` - Create payment
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/:paymentId` - Get payment details
- `POST /api/payments/webhook` - Stripe webhook endpoint

## Required Environment Variables

- `MONGODB_URI` - MongoDB connection string
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `PORT` - Server port (default: 5000)
