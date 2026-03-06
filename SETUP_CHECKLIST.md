# 🚀 Apartment Booking Website - Setup Checklist

Complete all items below to get your website live!

## ✅ Phase 1: Initial Setup (5 minutes)

- [ ] **Download Node.js**
  - Go to https://nodejs.org (v16+ recommended)
  - Install and verify: `node --version`

- [ ] **Download MongoDB**
  - Option A: Local - https://www.mongodb.com/try/download/community
  - Option B: Cloud - https://www.mongodb.com/cloud/atlas (free tier)

- [ ] **Create Stripe Account**
  - Go to https://stripe.com
  - Sign up (free account)
  - Navigate to Dashboard
  - Go to "Developers" → "API Keys"
  - Copy your **Secret Key** and **Publishable Key**

- [ ] **Install Dependencies**
  ```bash
  # Windows
  install.bat
  
  # Linux/Mac
  bash install.sh
  
  # Or manually
  cd backend && npm install
  cd ../frontend && npm install
  ```

## ✅ Phase 2: Configuration (5 minutes)

### Backend Configuration

- [ ] **Add Stripe Keys to backend/.env**
  ```
  STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
  STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
  ```
  Get these from: https://dashboard.stripe.com/apikeys

- [ ] **Configure MongoDB Connection**
  
  **Local MongoDB:**
  ```env
  MONGODB_URI=mongodb://localhost:27017/apartment-booking
  ```
  
  **MongoDB Atlas (Cloud):**
  1. Go to https://mongodb.com/cloud/atlas
  2. Create cluster
  3. Get connection string
  4. Add to .env

- [ ] **Set Node Environment**
  ```env
  NODE_ENV=development
  PORT=5000
  ```

### Frontend Configuration

- [ ] **Update Stripe Public Key**
  - File: `frontend/src/pages/PaymentPage.jsx`
  - Find: Line with `loadStripe('pk_test_'`
  - Replace with your Stripe **Publishable Key** starting with `pk_test_`

- [ ] **Update API Endpoint (if needed)**
  - File: `frontend/vite.config.js`
  - Default: `http://localhost:5000` (for development)

## ✅ Phase 3: Database Setup (3 minutes)

- [ ] **Start MongoDB Service**
  
  **Windows:**
  ```bash
  # MongoDB should auto-start if installed
  # Or manually via Services app
  ```
  
  **Linux/Mac:**
  ```bash
  brew services start mongodb-community
  ```
  
  **Cloud (Atlas):**
  - No action needed, already running

- [ ] **Seed Sample Data**
  - Automatic: Runs when backend starts for first time
  - Manual: Run this in backend folder:
    ```bash
    node seed.js
    ```

- [ ] **Verify Connection**
  ```bash
  curl http://localhost:5000/api/health
  # Should return: { "status": "Server is running", ... }
  ```

## ✅ Phase 4: Start Development Servers (2 minutes)

### Option A: Start Both Servers (from root directory)
```bash
npm run dev
```

### Option B: Start Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
```

- [ ] **Backend Running?**
  ```
  ✓ Should see:
  ╔════════════════════════════════════╗
  ║  🏠 Apartment Booking API Server   ║
  ║  Port: 5000                        ║
  ```

- [ ] **Frontend Running?**
  ```
  ✓ Check: http://localhost:3000
  ✓ Should see apartment listings
  ```

## ✅ Phase 5: Test Full Flow (5 minutes)

- [ ] **Browse Apartments**
  - Visit http://localhost:3000
  - See apartment cards
  - Search by city in search bar

- [ ] **Test Language Switching**
  - Click "EN" → See English text
  - Click "DE" → See German (Deutsch) text
  - All content should be translated

- [ ] **Complete Booking**
  1. Click "Book Now" on any apartment
  2. Select Check-in date
  3. Select Check-out date
  4. Enter number of guests
  5. See total price calculated
  6. Click "Continue to Payment"

- [ ] **Test Payment (with Stripe test card)**
  1. Fill in billing address
  2. Use Stripe test card: `4242 4242 4242 4242`
  3. Expiry: Any future date (e.g., 12/25)
  4. CVC: Any 3 digits (e.g., 123)
  5. Click "Pay"
  6. See success message

- [ ] **Verify Booking Created**
  - Backend console shows booking confirmation
  - Payment status: "succeeded"

## ✅ Phase 6: Troubleshooting

### Port Already in Use

**Error:** `Port 5000 already in use`

**Solution:**
```bash
# Find process using port 5000
netstat -ano | findstr :5000  # Windows
lsof -i :5000                  # Mac/Linux

# Kill process
taskkill /PID <PID> /F         # Windows
kill -9 <PID>                  # Mac/Linux

# Or change port in backend/.env
PORT=5001
```

### MongoDB Connection Error

**Error:** `MongoDB connection failed`

**Solution:**
- Check MongoDB is running
- Verify connection string in `.env`
- Try local: `mongodb://localhost:27017/apartment-booking`
- Or use MongoDB Atlas connection string

### Stripe Payment Fails

**Error:** `Stripe API error`

**Solution:**
- Verify API keys are correct (start with `sk_test_` and `pk_test_`)
- Keys not mixed up (secret in backend, public in frontend)
- Using test cards correctly
- Check browser console for error details

### React/Vite Build Errors

**Error:** `Module not found` or build fails

**Solution:**
```bash
# Clear cache and reinstall
rm -r node_modules package-lock.json
npm install
npm run dev
```

### CORS Errors

**Error:** `Access to XMLHttpRequest blocked by CORS`

**Solution:**
- Backend CORS is configured for port 3000
- If using different port, update in `backend/server.js`
- Frontend API URL matches backend port

## ✅ Phase 7: Optional Enhancements

- [ ] **Add More Apartments**
  - Edit `backend/seed.js`
  - Add apartment objects to `sampleApartments` array
  - Restart backend server

- [ ] **Customize Languages**
  - Edit `frontend/src/translations/en.json`
  - Edit `frontend/src/translations/de.json`
  - Translations auto-update

- [ ] **Add More Cities**
  - Edit apartment data in `backend/seed.js`
  - Change city names
  - Search will filter by these cities

- [ ] **Configure Webhook (Advanced)**
  - Get webhook signing secret from Stripe dashboard
  - Add to `backend/.env` as `STRIPE_WEBHOOK_SECRET`
  - Handle payment events in real-time

## ✅ Phase 8: Deployment Preparation

### Before Going Live

- [ ] **Use Production Stripe Keys**
  - Get from https://dashboard.stripe.com/apikeys
  - Keys starting with `sk_live_` and `pk_live_`
  - Update in `.env` and frontend code

- [ ] **Set NODE_ENV to production**
  ```env
  NODE_ENV=production
  ```

- [ ] **Database Backup**
  - Export MongoDB data
  - Keep backup before deployment

- [ ] **Test on Multiple Browsers**
  - Chrome, Firefox, Safari, Edge
  - Mobile browsers

- [ ] **Performance Check**
  ```bash
  cd frontend
  npm run build
  # dist/ folder is production ready
  ```

### Deployment Services

**Frontend (Choose one):**
- Vercel (https://vercel.com) - FREE, easiest
- Netlify (https://netlify.com) - FREE
- GitHub Pages - FREE
- AWS S3 + CloudFront - Paid

**Backend (Choose one):**
- Railway (https://railway.app) - FREE tier available
- Heroku - Paid (free tier removed)
- DigitalOcean - Paid
- AWS/Azure - Paid

**Database:**
- MongoDB Atlas (https://mongodb.com/cloud/atlas) - FREE tier
- AWS DocumentDB - Paid

## ✅ Quick Commands Reference

```bash
# Installation
npm install                    # Root level (installs both)
cd frontend && npm install    # Frontend only
cd backend && npm install     # Backend only

# Development
npm run dev                    # Start all (from root)
npm start                      # Production server

# Building
npm run build                  # Build frontend for production

# Database
npm run seed                   # Seed sample data

# Testing
curl http://localhost:5000/api/health
curl http://localhost:5000/api/apartments
```

## 📞 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Cannot find MongoDB" | Install from mongodb.com or use MongoDB Atlas |
| Stripe test card declined | Use `4242 4242 4242 4242` exactly, not `4242-4242-4242-4242` |
| Page won't load | Check both servers running on 5000 & 3000 |
| Apartments not showing | Check backend seeding ran, verify MongoDB connection |
| Payment stuck on "Processing" | Check Stripe API keys in browser console logs |
| Language not switching | Clear browser cache (Ctrl+Shift+Del) |

## 🎯 Final Verification Checklist

- [ ] Backend running on `http://localhost:5000`
- [ ] Frontend running on `http://localhost:3000`
- [ ] Home page shows 6+ apartments
- [ ] Can search apartments by city
- [ ] Can view apartment details
- [ ] Language switching works (EN/DE)
- [ ] Can select dates for booking
- [ ] Price calculates correctly
- [ ] Can fill payment form
- [ ] Stripe test payment succeeds
- [ ] Booking confirmation appears
- [ ] No errors in browser console
- [ ] No errors in terminal

## ✅ All Done!

If all checkboxes are complete, your website is **ready to use and test**! 🎉

Next steps:
- 🌐 Visit http://localhost:3000
- 📱 Test on mobile devices
- 🔗 Share with others
- 🚀 Deploy when ready (see Phase 8)

---

## 📚 Documentation Files

- **README.md** - Full project documentation
- **QUICK_START.md** - 5-minute setup guide
- **STRUCTURE.md** - Project file structure
- **PROJECT_CHECKLIST.md** - Features overview

## 🆘 Need Help?

1. Check the error message carefully
2. Search in one of the documentation files
3. Check browser console (F12 > Console tab)
4. Check terminal output
5. Verify all steps in this checklist

---

**Good luck with your Apartment Booking Website! 🏠💚**

*Last updated: March 2026*
