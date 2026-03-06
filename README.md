# Apartment Booking Website - Complete Setup Guide

A modern apartment booking platform for Germany with multi-language support (German & English) and Stripe payment integration.

## Project Structure

```
├── frontend/              # React + Vite frontend application
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page components
│   │   ├── translations/  # i18n language files (EN, DE)
│   │   ├── App.jsx
│   │   └── i18n.js        # i18n configuration
│   ├── package.json
│   └── vite.config.js
│
├── backend/               # Node.js + Express backend
│   ├── routes/            # API route handlers
│   ├── models/            # MongoDB schemas
│   ├── controllers/       # Business logic
│   ├── server.js
│   └── package.json
│
└── README.md              # This file
```

## Features

✅ **Multi-Language Support**
- German (Deutsch)
- English

✅ **Apartment Management**
- Browse available apartments
- Filter by city
- Detailed apartment information

✅ **Booking System**
- Select check-in/check-out dates
- Calculate total price
- Guest management

✅ **Payment Integration**
- Stripe payment processing
- Secure card handling
- Billing address collection

✅ **Responsive Design**
- Mobile-friendly UI
- Modern gradient design
- Smooth animations

## Prerequisites

- Node.js (v16+)
- MongoDB (local or cloud)
- Stripe account (https://stripe.com)
- npm or yarn

## Installation

### 1. Frontend Setup

```bash
cd frontend
npm install
```

### 2. Backend Setup

```bash
cd backend
npm install
```

## Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/apartment-booking

# Stripe Keys (get from https://dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Server
PORT=5000
NODE_ENV=development
```

### Frontend Configuration

Update Stripe public key in `frontend/src/pages/PaymentPage.jsx`:

```javascript
// Change this line with your Stripe public key
const stripePromise = loadStripe('pk_test_YOUR_PUBLIC_KEY_HERE');
```

## Running the Application

### 1. Start MongoDB

```bash
# If running locally
mongod
```

### 2. Start Backend Server

```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

### 3. Start Frontend Development Server

```bash
cd frontend
npm run dev
# Application runs on http://localhost:3000
```

### 4. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## Available Scripts

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Backend
```bash
npm start        # Start production server
npm run dev      # Start with nodemon (auto-reload)
```

## API Endpoints

### Apartments
- `GET /api/apartments` - Get all available apartments
- `GET /api/apartments/:id` - Get specific apartment
- `GET /api/apartments/search/:city` - Search by city
- `POST /api/apartments` - Create apartment (admin)
- `PUT /api/apartments/:id` - Update apartment (admin)
- `DELETE /api/apartments/:id` - Delete apartment (admin)

### Bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/:id` - Get booking details
- `GET /api/bookings/email/:email` - Get user's bookings
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

### Payments
- `POST /api/payments/create-payment-intent` - Create Stripe payment
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/:paymentId` - Get payment details

## Testing the Booking Flow

1. **Browse Apartments**: View all available apartments on the homepage
2. **Select Apartment**: Click "Book Now" on any apartment card
3. **Set Dates**: Choose check-in and check-out dates
4. **Review**: See the total price calculation
5. **Payment**: Enter payment details (use Stripe test cards)
6. **Confirmation**: Booking is confirmed upon successful payment

### Stripe Test Cards

For testing payments, use these test card numbers:

**Success:**
- Card Number: `4242 4242 4242 4242`
- Exp: Any future date
- CVC: Any 3 digits

**Decline:**
- Card Number: `4000 0000 0000 0002`

## Languages

Switch between languages in the top-right corner:
- **EN**: English
- **DE**: Deutsch (German)

All content is translated including:
- Navigation
- Forms
- Labels
- Messages

## Database Schema

### Apartments Collection
```javascript
{
  title: String,
  description: String,
  city: String,
  address: String,
  price: Number (per night),
  beds: Number,
  baths: Number,
  maxGuests: Number,
  amenities: [String],
  image: String,
  available: Boolean
}
```

### Bookings Collection
```javascript
{
  apartment: ObjectId (ref: Apartment),
  user: {
    name: String,
    email: String,
    phone: String
  },
  checkInDate: Date,
  checkOutDate: Date,
  numberOfGuests: Number,
  numberOfNights: Number,
  totalPrice: Number,
  status: String (pending/confirmed/cancelled),
  paymentStatus: String (pending/completed/failed)
}
```

### Payments Collection
```javascript
{
  booking: ObjectId (ref: Booking),
  stripePaymentId: String,
  amount: Number,
  currency: String (EUR),
  status: String (pending/succeeded/failed),
  email: String,
  billingDetails: {
    name: String,
    address: String,
    city: String,
    zipCode: String,
    country: String
  }
}
```

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify database name is correct

### Stripe Payment Failed
- Verify API keys in `.env`
- Check Stripe account is in test mode
- Use valid test card numbers
- Check request payload format

### CORS Errors
- Backend CORS is configured for frontend port 3000
- Modify in `server.js` if using different port

### Port Already in Use
- Frontend: Change port in `vite.config.js`
- Backend: Change `PORT` in `.env`

## Production Deployment

### Frontend
```bash
npm run build
# Deploy the 'dist' folder to your hosting provider
```

### Backend
1. Set `NODE_ENV=production` in `.env`
2. Use production Stripe keys
3. Set up proper MongoDB hosting
4. Deploy using services like Heroku, Railway, or DigitalOcean

## Support & Documentation

- **Stripe API**: https://stripe.com/docs/api
- **React**: https://react.dev
- **Express**: https://expressjs.com
- **Mongoose**: https://mongoosejs.com
- **i18next**: https://www.i18next.com

## License

This project is provided as-is for educational and commercial purposes.

## Contact

For issues or questions, ensure all environment variables are properly configured and MongoDB/Stripe services are active.

---

**Happy Booking! 🏠**
