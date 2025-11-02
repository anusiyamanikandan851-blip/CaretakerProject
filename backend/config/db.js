const mongoose = require('mongoose');
const url = require('url');

function maskUri(uri) {
  try {
    const parsed = url.parse(uri);
    if (!parsed.auth) return uri;
    // Keep host and path, mask password
    const [user, pass] = parsed.auth.split(':');
    return uri.replace(`${user}:${pass}@`, `${user}:*****@`);
  } catch (e) {
    return uri;
  }
}

module.exports = async function connectDB() {
  // Support both MONGO_URI and MONGODB_URI (some projects use the latter)
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGO_URI or MONGODB_URI missing in environment. Ensure .env exists and contains one of them.');
  }

  // Optional: enable mongoose debug logging for queries
  if (process.env.MONGO_DEBUG === 'true') {
    mongoose.set('debug', true);
    console.log('Mongoose debug enabled');
  }

  // Register connection event listeners so lifecycle logs always appear
  const conn = mongoose.connection;

  conn.on('connecting', () => console.log('Mongoose connecting to MongoDB...'));
  conn.on('connected', () => console.log('Mongoose connected to MongoDB'));
  conn.on('open', () => console.log('Mongoose connection open'));
  conn.on('error', (err) => console.error('Mongoose connection error:', err && err.message ? err.message : err));
  conn.on('disconnected', () => console.warn('Mongoose disconnected'));
  conn.on('reconnected', () => console.log('Mongoose reconnected to MongoDB'));

  try {
    console.log(`Attempting MongoDB connection to ${maskUri(uri)}`);
    // Mongoose 6+ sets recommended defaults; avoid deprecated option warnings
    await mongoose.connect(uri, {});
    // At this point, connection events above will fire (connected/open)
  } catch (err) {
    console.error('MongoDB initial connection error:', err && err.message ? err.message : err);
    throw err;
  }

  // Gracefully handle app termination
  process.on('SIGINT', async () => {
    try {
      await mongoose.disconnect();
      console.log('Mongoose disconnected through app termination (SIGINT)');
      process.exit(0);
    } catch (e) {
      console.error('Error during mongoose disconnect on SIGINT:', e && e.message ? e.message : e);
      process.exit(1);
    }
  });
};