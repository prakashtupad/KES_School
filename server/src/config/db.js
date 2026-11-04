const mongoose = require('mongoose');

let isConnected = false;
// Cached in-flight connection promise (reused across serverless invocations on Vercel)
let connectionPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return true;
  if (connectionPromise) return connectionPromise;

  connectionPromise = establishConnection().then((ok) => {
    // Allow a fresh retry on the next request if this attempt failed
    if (!ok) connectionPromise = null;
    return ok;
  });
  return connectionPromise;
};

const establishConnection = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.warn('[DB] Warning: MONGODB_URI is not defined in environment variables.');
    return false;
  }

  try {
    mongoose.set('strictQuery', true);

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log(`[DB] MongoDB Connected successfully: ${conn.connection.host} (${conn.connection.name})`);

    mongoose.connection.on('error', (err) => {
      console.error(`[DB] MongoDB runtime connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.warn('[DB] MongoDB disconnected. Mongoose will attempt to reconnect automatically.');
    });

    mongoose.connection.on('reconnected', () => {
      isConnected = true;
      console.log('[DB] MongoDB reconnected.');
    });

    return true;
  } catch (error) {
    isConnected = false;
    console.error(`[DB] Initial MongoDB connection failed: ${error.message}`);
    console.warn('[DB] Server continuing in resilient fail-safe mode. Will retry or use fallback storage until MongoDB is reachable.');
    return false;
  }
};

const getDbStatus = () => {
  const readyStateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return {
    isConnected: mongoose.connection.readyState === 1 || isConnected,
    state: readyStateMap[mongoose.connection.readyState] || 'unknown',
  };
};

module.exports = { connectDB, getDbStatus };
