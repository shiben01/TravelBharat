require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');
const State = require('./models/State');
const Place = require('./models/Place');
const Admin = require('./models/Admin');
const { seedAll } = require('./scripts/seed');

const PORT = process.env.PORT || 5000;

const ensureDatabaseSeeded = async () => {
  try {
    const [stateCount, placeCount, adminCount] = await Promise.all([
      State.countDocuments(),
      Place.countDocuments(),
      Admin.countDocuments(),
    ]);

    console.log(`[Database Status] States: ${stateCount}, Places: ${placeCount}, Admins: ${adminCount}`);

    // If states or places or admin is missing, run auto-seed
    if (stateCount === 0 || placeCount === 0 || adminCount === 0) {
      console.log('[Startup] Database missing key records. Running initial auto-seed...');
      await seedAll();
    }
  } catch (err) {
    console.error('[Startup] Error checking/seeding database records:', err.message);
  }
};

const startServer = async () => {
  // 1. Start Express HTTP Server FIRST so cloud health checks pass immediately
  const server = app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(` TravelBharat API Server running on port ${PORT}`);
    console.log(` Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(` Health check: http://localhost:${PORT}/api/health`);
    console.log(`===============================================`);
  });

  // 2. Connect to Database with resilience
  try {
    await connectDB();
    await ensureDatabaseSeeded();
  } catch (err) {
    console.error('[Server] Initial database connection encountered an error:', err.message);
    console.log('[Server] Server will stay alive while retrying database connection in background...');

    // Retry connection every 10 seconds in the background
    const retryInterval = setInterval(async () => {
      try {
        console.log('[Server] Retrying MongoDB connection...');
        await connectDB();
        await ensureDatabaseSeeded();
        clearInterval(retryInterval);
      } catch (retryErr) {
        console.error('[Server] Retry failed:', retryErr.message);
      }
    }, 10000);
  }

  // Graceful shutdown handling
  const shutdown = () => {
    console.log('\n[Server] Gracefully shutting down...');
    server.close(() => {
      console.log('[Server] HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

startServer();
