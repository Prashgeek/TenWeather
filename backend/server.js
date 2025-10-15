require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const weatherRouter = require('./routes/weather');

const app = express();

// CORS configuration for development
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Vite dev server URLs
  credentials: true
}));

app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// optional MongoDB (for storing recent searches/favorites). If you don't want DB simply omit MONGODB_URI.
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB error', err));
} else {
  console.log('MongoDB not configured (MONGODB_URI not set)');
}

// Use weather routes
app.use('/api', weatherRouter);

// simple health check
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

// 404 handler
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

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
  console.log(`📍 API endpoints:`);
  console.log(`   GET http://localhost:${PORT}/api/geocode?q=cityname`);
  console.log(`   GET http://localhost:${PORT}/api/weather?lat=value&lon=value`);
});