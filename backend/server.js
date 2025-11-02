// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');

// Note: route modules are required after DB connect to avoid startup crashes
// (some route files or controllers may require DB/models). We'll import them
// inside startServer() after connectDB() so Mongo logs are visible even when
// a route file has a runtime problem.

const app = express();

// --------------------
// Environment checks
// --------------------
console.log('SERVER STARTUP: loading server.js from', __dirname);
console.log('Working directory:', process.cwd());

const envPath = path.join(__dirname, '.env');
console.log('.env path:', envPath);
console.log('.env exists:', fs.existsSync(envPath));

if (!process.env.MONGO_URI && !process.env.MONGODB_URI) {
  console.warn(
    'WARNING: MONGO_URI or MONGODB_URI not set. Falling back to mongodb://127.0.0.1:27017/caretaker-service'
  );
}

// --------------------
// Middleware
// --------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// --------------------
// Root route
// --------------------
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Caretaker Service API is running',
    version: '1.0.0',
  });
});

// Routes will be mounted after DB connection in startServer()

// --------------------
// Note: 404 and global error handlers are registered after routes are mounted
// inside startServer() so route files have a chance to attach handlers.

// --------------------
// Start server after DB connection
// --------------------
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB(); // MongoDB connection logs happen here

    // Require and mount routes after DB connects to avoid early startup failures
    try {
      // The project routes are named auth.js, admin.js, caretaker.js, booking.js
      const authRoutes = require('./routes/auth');
      const adminRoutes = require('./routes/admin');
      const caretakerRoutes = require('./routes/caretaker');
      const bookingRoutes = require('./routes/booking');

      app.use('/api/auth', authRoutes);
      app.use('/api/admin', adminRoutes);
      app.use('/api/caretakers', caretakerRoutes);
      app.use('/api/bookings', bookingRoutes);
    } catch (routeErr) {
      console.error('Warning: failed to mount some routes:', routeErr && routeErr.message ? routeErr.message : routeErr);
      if (routeErr && routeErr.stack) {
        console.error(routeErr.stack);
      }
      // Continue — server will still run and MongoDB logs will be visible
    }

    // --------------------
    // 404 handler (after routes are mounted)
    // --------------------
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: 'Route not found',
      });
    });

    // --------------------
    // Global error handler
    // --------------------
    app.use((err, req, res, next) => {
      console.error('Unhandled error:', err && err.stack ? err.stack : err);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      });
    });

    app.listen(PORT, '0.0.0.0', () => {
      console.log(
        `Server running on port ${PORT} — env: ${process.env.NODE_ENV || 'development'}`
      );
    });
  } catch (err) {
    console.error('Failed to start server:', err && err.message ? err.message : err);
    process.exit(1);
  }
}

startServer();
