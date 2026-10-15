const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongodInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/invoiceflow';

  try {
    // Attempt connecting to the specified URI first with a 2-second timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[Database] Connected to external/local MongoDB at ${uri}`);
  } catch (err) {
    console.warn(`[Database] Could not connect to MongoDB at ${uri} (${err.message}).`);
    console.log('[Database] Initializing embedded in-memory MongoDB server for zero-setup execution...');
    try {
      mongodInstance = await MongoMemoryServer.create();
      const memoryUri = mongodInstance.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[Database] Connected successfully to in-memory MongoDB at ${memoryUri}`);
    } catch (memErr) {
      console.error('[Database] Fatal: Failed to initialize in-memory MongoDB:', memErr.message);
      process.exit(1);
    }
  }

  // Ensure database is seeded with realistic demo data
  try {
    const { autoSeedIfEmpty } = require('../seed/seeder');
    await autoSeedIfEmpty();
  } catch (seedErr) {
    console.warn('[Database] Auto-seeding check warning:', seedErr.message);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};

module.exports = { connectDB, disconnectDB };
