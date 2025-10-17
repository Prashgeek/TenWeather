require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const weatherRouter = require('./routes/weather');

const app = express();

// --- Configure allowed origins from env (comma-separated) or defaults for dev ---
const rawFrontend = process.env.FRONTEND_URL || 'http://localhost:5173,http://127.0.0.1:5173';
const allowedOrigins = rawFrontend.split(',').map(s => s.trim()).filter(Boolean);

// Allow Render internal preview origins or allowlist the backend host for quick testing if needed
const corsOptions = {
  origin: function(origin, callback) {
    // allow requests with no origin (like curl, server-to-server) and dev tools
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
    // fallback: allow origin if FRONTEND_URL set to '*' 
    if (allowedOrigins.indexOf('*') !== -1) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
};
app.use(cors(corsOptions));

app.use(express.json());

// Logging middleware (from your original code)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check from second code
app.get('/_healthz', (req, res) => {
  return res.json({ status: 'ok', uptime: process.uptime() });
});

// MongoDB connection from second code (improved)
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI, {
    autoIndex: true
  }).then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err.message || err));
} else {
  console.warn('⚠️ MongoDB not configured (MONGODB_URI not set). Continuing without DB.');
}

// Use weather routes
app.use('/api', weatherRouter);

// simple health check (from your original code)
app.get('/', (req, res) => {
  res.json({ 
    ok: true, 
    message: 'Weather API backend is running!',
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      'GET /api/geocode?q=cityname',
      'GET /api/weather?lat=value&lon=value'
    ]
  });
});

// 404 handler (from your original code)
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    availableEndpoints: [
      'GET /',
      'GET /api/geocode?q=cityname',
      'GET /api/weather?lat=value&lon=value'
    ]
  });
});

// Error handler from second code (improved)
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err && err.message ? err.message : String(err)
  });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
  console.log(`📍 API endpoints:`);
  console.log(`   GET http://localhost:${PORT}/api/geocode?q=cityname`);
  console.log(`   GET http://localhost:${PORT}/api/weather?lat=value&lon=value`);
});