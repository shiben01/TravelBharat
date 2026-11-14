const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const stateRoutes = require('./routes/stateRoutes');
const cityRoutes = require('./routes/cityRoutes');
const placeRoutes = require('./routes/placeRoutes');
const { getCategories, getStats } = require('./controllers/placeController');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security HTTP headers
app.use(helmet());

// Logging middleware in dev
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// CORS configuration for cookies
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error('CORS not allowed for this origin'));
    },
    credentials: true,
  })
);

// Body and cookie parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'TravelBharat Express API',
  });
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
