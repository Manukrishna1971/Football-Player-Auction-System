const mongoose = require('mongoose');

let mongodInstance = null;

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (uri) {
    try {
      console.log(`[DB] Attempting connection to MongoDB URI...`);
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 3000
      });
      console.log(`[DB] Successfully connected to MongoDB at ${uri}`);
      return;
    } catch (err) {
      console.warn(`[DB] Failed to connect to configured MONGODB_URI: ${err.message}. Falling back to in-memory database...`);
    }
  } else {
    // Try standard local MongoDB default first
    try {
      console.log(`[DB] Testing local MongoDB service on mongodb://127.0.0.1:27017/football_auction...`);
      await mongoose.connect('mongodb://127.0.0.1:27017/football_auction', {
        serverSelectionTimeoutMS: 2000
      });
      console.log(`[DB] Successfully connected to local MongoDB daemon.`);
      return;
    } catch (err) {
      console.log(`[DB] Local MongoDB daemon not reachable. Launching embedded in-memory MongoDB...`);
    }
  }

  // Graceful fallback to mongodb-memory-server
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongodInstance = await MongoMemoryServer.create();
    const memoryUri = mongodInstance.getUri();
    await mongoose.connect(memoryUri);
    console.log(`[DB] Connected to embedded in-memory MongoDB at ${memoryUri}`);
  } catch (err) {
    console.error(`[DB] Fatal error initializing in-memory database:`, err);
    throw err;
  }
}

async function disconnectDB() {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
}

module.exports = { connectDB, disconnectDB };
