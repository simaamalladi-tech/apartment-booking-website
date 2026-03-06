# Quick Start Guide

## ⚡ Get Running in 5 Minutes

### Prerequisites
- Node.js v16+
- MongoDB (local or Atlas)
- Stripe Account (free)

### 1️⃣ Clone/Navigate to Project
```bash
cd "c:\Users\madha\OneDrive\Desktop\Lutz Project"
```

### 2️⃣ Get Stripe Keys
1. Go to https://dashboard.stripe.com
2. Get your **Secret Key** and **Public Key**
3. Copy them for the next step

### 3️⃣ Setup Backend

```bash
cd backend
npm install

# Create .env file
# Windows PowerShell (copy-paste):
echo "MONGODB_URI=mongodb://localhost:27017/apartment-booking" > .env
echo "STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE" >> .env
echo "STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE" >> .env
echo "PORT=5000" >> .env

# Or create .env file manually and add:
# MONGODB_URI=mongodb://localhost:27017/apartment-booking
# STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
# STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
# PORT=5000

npm run dev
# Backend runs on http://localhost:5000
```

### 4️⃣ Setup Frontend (new terminal)

```bash
cd frontend
npm install

# Update Stripe key in src/pages/PaymentPage.jsx
# Replace: pk_test_1234567890abcdefghijklmnop
# With your Stripe PUBLIC key

npm run dev
# Frontend runs on http://localhost:3000
```

### 5️⃣ Setup MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB Community Edition from:
# https://docs.mongodb.com/manual/installation/

# Start MongoDB service
# Windows: MongoDB service should auto-start
# Or run: mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster
4. Get connection string
5. Update `MONGODB_URI` in backend/.env

### 6️⃣ Test the Application

1. Open http://localhost:3000
2. Browse apartments
3. Click "Book Now"
4. Select dates and continue
5. Use Stripe test card: `4242 4242 4242 4242`
   - Any future date
   - Any 3-digit CVC
6. Complete payment

## 🌐 Language Switching

Click **EN** or **DE** in top-right corner to switch between:
- English
- Deutsch (German)

## 📦 Project Structure

```
├── frontend/           (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── translations/
│   └── package.json
│
├── backend/            (Node.js + Express)
│   ├── routes/
│   ├── models/
│   ├── server.js
│   └── package.json
│
└── README.md
```

## 🔑 Key Features

✅ Multi-language (EN/DE)
✅ Apartment search & browse
✅ Date-based booking
✅ Stripe payment integration
✅ Responsive design
✅ Professional UI

## 🛠️ Useful Commands

**Frontend:**
```bash
cd frontend
npm run dev      # Development server
npm run build    # Build production
```

**Backend:**
```bash
cd backend
npm run dev      # Development with auto-reload
npm start        # Production
```

## 🐛 Troubleshooting

**"Cannot find module" error:**
```bash
# Delete node_modules and reinstall
rm -r node_modules
npm install
```

**Port already in use:**
- Frontend: Change port in `vite.config.js`
- Backend: Change `PORT` in `.env`

**MongoDB connection error:**
- Check MongoDB is running
- Verify connection string in `.env`
- Try MongoDB Atlas if local fails

**Stripe errors:**
- Verify API keys are correct
- Use test keys (start with `sk_test_` and `pk_test_`)
- Check request payload in browser console

## 📱 Testing Different Devices

```bash
# Frontend already supports mobile
# Open on phone at: http://YOUR_COMPUTER_IP:3000
# (replace YOUR_COMPUTER_IP with your machine IP)
```

## 🚀 Going Live

**Frontend Deployment (Vercel):**
1. `npm run build`
2. Deploy `dist/` folder to Vercel
3. Set environment: `VITE_API_URL=https://your-backend.com`

**Backend Deployment (Railway/Heroku):**
1. Set production env variables
2. Use production Stripe keys
3. Use MongoDB Atlas

## 📖 Documentation Links

- React: https://react.dev
- Vite: https://vitejs.dev
- Express: https://expressjs.com
- MongoDB: https://docs.mongodb.com
- Stripe: https://stripe.com/docs

## ℹ️ Need Help?

Check the main README.md for:
- API endpoints
- Database schema
- Full setup instructions
- Production deployment guide

---

**Happy coding! 🎉**
