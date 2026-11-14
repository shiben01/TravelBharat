require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');
const State = require('./models/State');
const { seedAll } = require('./scripts/seed');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Auto-seed if database is currently empty
    const stateCount = await State.countDocuments();
    if (stateCount === 0) {
      console.log('[Startup] Database is empty. Running initial auto-seed...');
      await seedAll();
    }

    // 3. Start Express HTTP Server
    const server = app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(` TravelBharat API Server running on port ${PORT}`);
      console.log(` Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log(` Health check: http://localhost:${PORT}/api/health`);
      console.log(`===============================================`);
    });

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
  } catch (err) {
    console.error('[Server] Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
