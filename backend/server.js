import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import apartmentRoutes from './routes/apartments.js';
import bookingRoutes from './routes/bookings.js';
import paymentRoutes from './routes/payments.js';
import { sendContactMessage } from './utils/emailService.js';
import { generateAdminToken, verifyAdminPassword } from './middleware/auth.js';
import seedApartments from './seed.js';

dotenv.config();

const app = express();

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── SECURITY MIDDLEWARE ───

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for SPA compatibility
  crossOriginEmbedderPolicy: false
}));

// CORS - restrict to known origins
const allowedOrigins = [
  'https://apartment-booking-website-production.up.railway.app',
  'https://alt-berliner-eckkneipe.de',
  'http://localhost:5173',
  'http://localhost:5000'
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (same-origin, mobile apps, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Still allow but log
    }
  },
  credentials: true
}));

// NoSQL injection prevention
app.use(mongoSanitize());

// Body parsing with size limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── RATE LIMITERS ───

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

// Strict limiter for contact form
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { success: false, message: 'Too many messages sent. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Auth rate limiter (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, message: 'Too many login attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply general limiter to all API routes
app.use('/api/', apiLimiter);

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/apartment-booking')
  .then(() => {
    console.log('✓ Connected to MongoDB');
    // Seed apartments on connection
    seedApartments();
  })
  .catch(err => console.log('✗ MongoDB connection error:', err));

// Routes
app.use('/api/apartments', apartmentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);

// ─── ADMIN AUTH ───
app.post('/api/admin/login', authLimiter, (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ success: false, message: 'Password required' });
  }
  if (verifyAdminPassword(password)) {
    const token = generateAdminToken();
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, message: 'Invalid password' });
  }
});

// ─── CONTACT FORM (with honeypot CAPTCHA + validation) ───
app.post('/api/contact', contactLimiter, async (req, res) => {
  try {
    const { name, email, subject, message, website, _timestamp } = req.body;

    // Honeypot check — bots fill the hidden 'website' field
    if (website) {
      // Silently accept but don't send (fool the bot)
      return res.json({ success: true, message: 'Message sent successfully' });
    }

    // Time-based check — form must take at least 3 seconds to fill
    if (_timestamp && (Date.now() - _timestamp) < 3000) {
      return res.json({ success: true, message: 'Message sent successfully' });
    }

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address' });
    }

    // Length limits
    if (name.length > 100 || email.length > 200 || (subject && subject.length > 200) || message.length > 5000) {
      return res.status(400).json({ success: false, message: 'Input too long' });
    }

    const result = await sendContactMessage({
      name: name.trim(),
      email: email.trim(),
      subject: (subject || 'General Inquiry').trim(),
      message: message.trim()
    });
    res.json({ success: result.success, message: result.success ? 'Message sent successfully' : result.message });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
});

// Config endpoint - return Stripe publishable key
app.get('/api/config', (req, res) => {
  res.json({
    stripePublishableKey: process.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server is running', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Root API endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Apartment Booking API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      apartments: '/api/apartments',
      bookings: '/api/bookings',
      payments: '/api/payments'
    }
  });
});

// Serve static files from React build (frontend/dist folder)
const frontendPath = path.join(__dirname, '../frontend/dist');
console.log('📁 Frontend path:', frontendPath);
console.log('📁 Frontend dist exists:', fs.existsSync(frontendPath));

// List files in dist folder for debugging
try {
  const distFiles = fs.readdirSync(frontendPath);
  console.log('📁 Files in dist:', distFiles);
  if (fs.existsSync(path.join(frontendPath, 'assets'))) {
    console.log('📁 Assets:', fs.readdirSync(path.join(frontendPath, 'assets')));
  }
} catch(err) {
  console.log('❌ Error reading dist folder:', err.message);
}

// Hashed assets (JS/CSS) can be cached forever; index.html must not be cached
app.use('/assets', express.static(path.join(frontendPath, 'assets'), {
  maxAge: '1y',
  immutable: true
}));
app.use(express.static(frontendPath, {
  maxAge: 0,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// Serve React app for all other routes (SPA fallback)
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API endpoint not found' });
  }
  const indexPath = path.join(frontendPath, 'index.html');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(indexPath);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('✗ Error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  🏠 Apartment Booking Server           ║
║  Port: ${PORT}                          ║
║  Environment: ${process.env.NODE_ENV || 'development'}     ║
╚════════════════════════════════════════╝

📡 Website: http://localhost:${PORT}
📱 API: http://localhost:${PORT}/api
🏥 Health: http://localhost:${PORT}/api/health

Press Ctrl+C to stop the server
  `);
});
