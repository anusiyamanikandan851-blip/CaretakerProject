// Small helper to test MongoDB connection logging without starting the whole server
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

// Ensure a fallback for local development
process.env.MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/caretaker-service';

const connectDB = require('./config/db');

(async () => {
  try {
    console.log('Test: starting connectDB()');
    await connectDB();
    console.log('Test: connectDB() resolved — wait a bit to show any connection events');
    // Keep process alive briefly to allow reconnects/errors to surface
    setTimeout(() => {
      console.log('Test: exiting');
      process.exit(0);
    }, 3000);
  } catch (err) {
    console.error('Test: connectDB() failed:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();