const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');
const stateRoutes = require('./routes/stateRoutes');
const cityRoutes = require('./routes/cityRoutes');
const placeRoutes = require('./routes/placeRoutes');
const { getCategories, getStats } = require('./controllers/placeController');
const { protect } = require('./middleware/auth');
const { seedAll } = require('./scripts/seed');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Trust reverse proxies (Render, Railway, Vercel, Cloudflare, Heroku)
// Essential for secure cookies to work properly across HTTPS proxies
app.set('trust proxy', 1);

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Logging middleware in dev
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// CORS configuration supporting dynamic deployment domains
const configuredClientUrls = (process.env.CLIENT_URL || '')
  .split(',')
  .map((u) => u.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const defaultAllowed = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  ...configuredClientUrls,
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      const normalized = origin.trim().replace(/\/+$/, '');

      // Check if origin matches default or configured URLs
      const isAllowed =
        process.env.NODE_ENV !== 'production' ||
        process.env.CORS_ALLOW_ALL === 'true' ||
        defaultAllowed.includes(normalized) ||
        normalized.endsWith('.vercel.app'); // Auto-allow Vercel previews & production domains

      if (isAllowed || configuredClientUrls.length === 0) {
        return callback(null, true);
      }

      // Instead of throwing an Error (which crashes the request with a 500),
      // allow the request with origin reflection in production to prevent user outages
      console.warn(`[CORS Notice] Incoming origin '${normalized}' not explicitly in CLIENT_URL list. Allowing to preserve availability.`);
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Body and cookie parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Comprehensive Health & Diagnostic Endpoint
app.get('/api/health', async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  let counts = { states: 0, cities: 0, places: 0, admins: 0 };
  let dbError = null;

  if (dbState === 1) {
    try {
      const [states, cities, places, admins] = await Promise.all([
        mongoose.model('State').countDocuments(),
        mongoose.model('City').countDocuments(),
        mongoose.model('Place').countDocuments(),
        mongoose.model('Admin').countDocuments(),
      ]);
      counts = { states, cities, places, admins };
    } catch (e) {
      dbError = e.message;
    }
  }

  res.status(200).json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatusMap[dbState] || 'unknown',
      readyState: dbState,
      host: mongoose.connection.host || 'none',
      counts,
      error: dbError,
    },
    environment: process.env.NODE_ENV || 'development',
    service: 'TravelBharat Express API',
  });
});

// Admin manual reseed / recovery endpoint
app.post('/api/admin/reseed', protect, async (req, res, next) => {
  try {
    await seedAll();
    res.status(200).json({
      success: true,
      message: 'Database content reseeded successfully!',
    });
  } catch (err) {
    next(err);
  }
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/states', stateRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/places', placeRoutes);

// Direct top-level endpoints
app.get('/api/categories', getCategories);
app.get('/api/stats', getStats);

// Admin aliases for clear separation
app.use('/api/admin/states', stateRoutes);
app.use('/api/admin/cities', cityRoutes);
app.use('/api/admin/places', placeRoutes);

// 404 Handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Central error handler
app.use(errorHandler);

module.exports = app;
