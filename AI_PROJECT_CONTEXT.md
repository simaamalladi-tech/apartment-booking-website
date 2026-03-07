# Alt-Berliner Eckkneipe — Apartment Booking Website

## What This Project Is

A **single-property apartment booking website** for "Alt-Berliner Eckkneipe" (a historic bar/guesthouse in Berlin-Kreuzberg, Germany). It has a React frontend, Express backend, MongoDB database, and Stripe payment integration. It supports English and German languages.

The site focuses on **one apartment listing only** (not a multi-listing platform). Users see the property showcase, pick dates, and pay via Stripe.

---

## Live Deployment

- **Live URL:** `https://apartment-booking-website-production.up.railway.app/`
- **Hosting:** Railway.app (auto-deploys from GitHub on push to `main`)
- **GitHub:** `https://github.com/simaamalladi-tech/apartment-booking-website`
- **Future domain:** `https://alt-berliner-eckkneipe.de/` (planned, not yet set up)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5, CSS3 (no Tailwind/Bootstrap) |
| Internationalization | i18next + react-i18next (EN/DE) |
| Payments | Stripe (@stripe/react-stripe-js, @stripe/stripe-js) |
| Backend | Express.js 4, Node.js (ES Modules) |
| Database | MongoDB Atlas (Mongoose 7) |
| Deployment | Railway.app (nixpacks builder), GitHub CI |

---

## Project Structure

```
Lutz Project/
├── package.json              # Root: build & start scripts
├── Procfile                  # Railway: "web: npm start"
├── railway.json              # Railway deploy config
├── .railwayignore
│
├── backend/
│   ├── package.json          # Backend deps (express, mongoose, stripe, etc.)
│   ├── server.js             # Express server, MongoDB connect, static file serving
│   ├── seed.js               # Seeds DB with apartment data (8 apartments, first is Alt-Berliner)
│   ├── models/
│   │   ├── Apartment.js      # Schema: title, city, price, beds, baths, maxGuests, amenities, images[], etc.
│   │   ├── Booking.js        # Schema: apartment ref, user{name,email}, dates, guests, nights, totalPrice, status, paymentId
│   │   └── Payment.js        # Schema: booking ref, stripePaymentId, amount, status, email
│   └── routes/
│       ├── apartments.js     # GET /api/apartments, GET /api/apartments/:id
│       ├── bookings.js       # CRUD for bookings
│       └── payments.js       # POST /api/payments/create-payment-intent (creates Stripe PaymentIntent, confirms, saves booking+payment)
│
├── frontend/
│   ├── package.json          # Frontend deps (react, vite, i18next, stripe)
│   ├── vite.config.js        # Vite config with /api proxy to localhost:5000 (dev only)
│   ├── index.html            # HTML entry point
│   ├── dist/                 # Built output (committed to git for Railway deployment)
│   └── src/
│       ├── main.jsx          # React entry: imports App + index.css + i18n
│       ├── i18n.js           # i18next setup, loads EN/DE from translations/
│       ├── translations/
│       │   ├── en.json       # English strings
│       │   └── de.json       # German strings
│       ├── App.jsx           # Main app: state-based page routing (home/booking/payment)
│       ├── App.css           # App-level CSS
│       ├── index.css         # Global reset, base styles, CSS variables
│       ├── styles/
│       │   └── globals.css   # Additional global styles (NOT imported in main.jsx, merged into index.css)
│       ├── components/
│       │   ├── Header.jsx/css        # Sticky header: logo, Home btn, Admin link, EN/DE language switcher
│       │   ├── PropertyHero.jsx/css  # Main property showcase: ImageGallery + details + booking card
│       │   ├── ImageGallery.jsx/css  # Image carousel with arrows, thumbnails, counter
│       │   ├── PaymentForm.jsx/css   # Stripe CardElement form with billing address
│       │   ├── ApartmentsList.jsx/css # (Legacy, unused — was multi-listing view)
│       │   └── ApartmentCard.jsx/css  # (Legacy, unused — was card for multi-listing)
│       └── pages/
│           ├── BookingPage.jsx/css   # Date picker, guest count, price calculation
│           └── PaymentPage.jsx/css   # Wraps Stripe Elements, shows booking summary
```

---

## How It Works

### Page Flow (no React Router — state-based)
1. **Home** (`currentPage === 'home'`): Shows `PropertyHero` with image gallery, property details, amenities, and "Book Now" button
2. **Booking** (`currentPage === 'booking'`): Shows `BookingPage` — user picks check-in/check-out dates, guest count, sees price. Clicks "Continue to Payment"
3. **Payment** (`currentPage === 'payment'`): Shows `PaymentPage` — fetches Stripe publishable key from `/api/config`, wraps `PaymentForm` in Stripe `<Elements>`. User fills card + billing info. On submit, calls `/api/payments/create-payment-intent`

### Backend Architecture
- `server.js` serves the React app from `../frontend/dist` as static files
- API routes are under `/api/*`
- Catch-all `*` route serves `index.html` for SPA
- On MongoDB connect, `seedApartments()` runs — inserts 8 apartments if DB is empty, or updates the Alt-Berliner apartment with images if missing
- `/api/config` endpoint returns `VITE_STRIPE_PUBLISHABLE_KEY` to frontend at runtime (since Vite env vars are baked at build time and unavailable on Railway)

### Stripe Payment Flow
1. Frontend fetches Stripe publishable key from `GET /api/config`
2. `loadStripe(key)` initializes Stripe.js
3. User fills `CardElement` + billing info
4. On submit: `stripe.createPaymentMethod()` → sends paymentMethodId to `POST /api/payments/create-payment-intent`
5. Backend creates PaymentIntent with `confirm: true`, saves Booking + Payment records to MongoDB

---

## Environment Variables (Railway)

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | `mongodb+srv://admin:<password>@cluster0.ftvr4zj.mongodb.net/?appName=Cluster0` |
| `STRIPE_SECRET_KEY` | `sk_test_...` (set in Railway env vars) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` (set in Railway env vars) |
| `NODE_ENV` | `production` |

- MongoDB Atlas: Free tier, cluster `cluster0.ftvr4zj.mongodb.net`, user: `admin`, IP whitelist: `0.0.0.0/0`
- Stripe: Test mode keys (not live)

---

## Build & Deploy Process

### Local Development
```bash
# Install everything
npm run install-all

# Run dev (frontend on :3000, backend on :5000, Vite proxies /api)
npm run dev
```

### Production Build + Deploy
```bash
# Build frontend
cd frontend && npm run build

# Commit & push (dist/ is committed to git)
git add -A
git add -f frontend/dist/
git commit -m "message"
git push origin main
# Railway auto-deploys from GitHub
```

### Root package.json scripts
- `"build"`: `cd frontend && npm install && npm run build && cd ../backend && npm install`
- `"start"`: `cd backend && npm start`

Railway runs `npm run build` then `npm start`.

---

## Key Design Decisions

1. **Single property focus**: App fetches `GET /api/apartments` and uses `apartments[0]`. Only the first apartment (Alt-Berliner Eckkneipe) is displayed.
2. **No React Router**: Navigation is state-based (`currentPage` state in App.jsx). Pages: `home`, `booking`, `payment`.
3. **Stripe key served from backend**: Because Vite `import.meta.env` variables are baked at build time and Railway doesn't inject them during build. So `/api/config` serves the key at runtime.
4. **dist/ is committed to git**: Railway uses the pre-built frontend from `frontend/dist/` served by Express.
5. **Legacy unused components**: `ApartmentsList.jsx`, `ApartmentCard.jsx` exist but are not imported anywhere (left over from multi-listing design).

---

## Property Data (Alt-Berliner Eckkneipe)

```javascript
{
  title: 'Alt-Berliner Eckkneipe - Feuchte Ecke',
  description: 'Historic bar and guesthouse in the heart of Berlin Kreuzberg...',
  city: 'Berlin',
  address: 'Mehringdamm 34-38, 10961 Berlin-Kreuzberg',
  price: 55,  // EUR per night
  beds: 1,
  baths: 1,
  maxGuests: 2,
  amenities: ['WiFi', 'Shared Kitchen', 'Shared Bathroom', 'Bar Access', 'Central Location', 'Heating'],
  images: [5 Unsplash URLs]
}
```

---

## What's Been Built (Completed)

- Full-stack React + Express + MongoDB app
- Single property showcase with image gallery (carousel, thumbnails, arrows)
- Booking flow: date selection → price calculation → payment
- Stripe test payment integration (PaymentIntent API)
- Multi-language support (English / German toggle)
- Responsive CSS for desktop, tablet, mobile
- Deployed and running on Railway
- MongoDB Atlas connected with seeded data

---

## What's NOT Built Yet (Planned)

1. **Admin Panel** — View/manage bookings, edit property details, dashboard with stats. Header already has an "Admin" link pointing to `/admin` (returns blank page currently).
2. **Authentication** — `jsonwebtoken` and `bcryptjs` are installed but no auth routes/middleware exist yet.
3. **Real property images** — Currently using Unsplash stock photos. Need actual photos of the apartment.
4. **Custom domain** — Future migration to `https://alt-berliner-eckkneipe.de/` on a Linux server.
5. **Email confirmations** — No email sending on booking confirmation yet.
6. **Calendar availability** — No blocking of already-booked dates.

---

## Common Issues & Fixes (History)

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| Layout not full-width, dark background | `index.css` had Vite defaults: `body { display: flex; place-items: center; background: #242424 }` | Replaced with proper light-theme full-width CSS |
| Gallery images not loading from DB | Apartment model had `image: String` but seed used `images: [Array]` — Mongoose silently dropped it | Added `images: [String]` to schema |
| Payment button always grayed out | `import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY` was undefined at runtime on Railway | Created `/api/config` endpoint to serve key from backend |
| API calls failing in production | Hardcoded `http://localhost:5000/api/...` | Changed to relative `/api/...` |
| Railway build failing | `frontend/dist` was in `.gitignore` and `.railwayignore` | Removed those exclusions |

---

## GitHub Credentials

- Account: `simaamalladi-tech`
- Repo: `apartment-booking-website`

---

## File-by-File Quick Reference

### Backend
- **server.js**: Express setup, MongoDB connect, seeds DB, `/api/config` for Stripe key, serves `frontend/dist`, SPA fallback
- **seed.js**: 8 sample apartments, auto-updates Alt-Berliner with images if missing
- **models/Apartment.js**: `{ title, description, city, address, price, beds, baths, maxGuests, amenities, image, images[], available }`
- **models/Booking.js**: `{ apartment(ref), user{name,email}, checkInDate, checkOutDate, numberOfGuests, numberOfNights, totalPrice, status, paymentId, paymentStatus }`
- **models/Payment.js**: `{ booking(ref), stripePaymentId, stripePaymentMethodId, amount, currency, status, email, billingDetails }`
- **routes/payments.js**: `POST /create-payment-intent` — creates Stripe payment, confirms it, saves booking + payment to DB

### Frontend
- **App.jsx**: State-based routing (`home`/`booking`/`payment`), fetches first apartment on mount
- **Header.jsx**: Logo "Alt-Berliner Eckkneipe", Home button, Admin link (`/admin`), EN/DE language switcher
- **PropertyHero.jsx**: Image gallery + property details (price, beds, baths, guests, description, amenities) + sticky booking card with "Book Now"
- **ImageGallery.jsx**: Carousel with prev/next arrows, thumbnails strip, image counter. Uses `images` prop or falls back to 5 Unsplash defaults
- **BookingPage.jsx**: Date inputs (check-in/check-out), guest counter, calculates nights & total price, "Continue to Payment" button
- **PaymentPage.jsx**: Fetches Stripe key from `/api/config`, loads Stripe, wraps `PaymentForm` in `<Elements>`, shows booking summary sidebar
- **PaymentForm.jsx**: Stripe `CardElement`, billing fields (email, name, address, city, zip), creates payment method, calls backend API
