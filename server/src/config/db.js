const mongoose = require('mongoose');
let mongoServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/travelbharat';
  
  // Set mongoose options for cloud resilience
  mongoose.set('strictQuery', false);

  try {
    console.log(`[Database] Connecting to MongoDB at ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}...`);
    
    // Increased timeout from 3s to 30s to handle cloud cold starts (e.g. Render / Atlas M0)
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });

    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error(`[Database] Direct MongoDB connection failed: ${err.message}`);
    
    if (process.env.MONGODB_URI) {
      console.error(`
======================================================================
[Database Connection Warning]
If you are using MongoDB Atlas, check the following common issues:
1. IP Access List: In MongoDB Atlas -> Network Access, ensure you have
   added '0.0.0.0/0' (Allow access from anywhere). Cloud hosts like
   Render and Railway change their outbound IPs frequently.
2. Credentials: Make sure your database user password has no unencoded
   special characters (e.g. @, :, /).
======================================================================
      `);
    }

    // Always provide in-memory fallback so the deployment never crashes or stays down
    console.log('[Database] Starting in-memory MongoDB server fallback...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      if (!mongoServer) {
        mongoServer = await MongoMemoryServer.create();
      }
      const memoryUri = mongoServer.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[Database] Connected to fallback in-memory MongoDB at ${memoryUri}`);
      return conn;
    } catch (memErr) {
      console.error('[Database] Failed to start in-memory MongoDB:', memErr.message);
      throw memErr;
    }
  }
};

// Listen to connection events
mongoose.connection.on('disconnected', () => {
  console.warn('[Database] MongoDB connection lost. Mongoose will attempt to reconnect automatically.');
});

mongoose.connection.on('reconnected', () => {
  console.log('[Database] MongoDB reconnected successfully.');
});

mongoose.connection.on('error', (err) => {
  console.error('[Database] MongoDB runtime error:', err.message);
});

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
      mongoServer = null;
    }
    console.log('[Database] MongoDB disconnected cleanly.');
  } catch (err) {
    console.error('[Database] Error during disconnect:', err.message);
  }
};

module.exports = { connectDB, disconnectDB };
