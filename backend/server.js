import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apartmentRoutes from './routes/apartments.js';
import bookingRoutes from './routes/bookings.js';
import paymentRoutes from './routes/payments.js';
import seedApartments from './seed.js';

dotenv.config();

const app = express();

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.use(express.static(frontendPath));

// Serve React app for all other routes (SPA fallback)
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API endpoint not found' });
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('✗ Error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: err.message 
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
