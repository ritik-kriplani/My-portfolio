const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false // Allows loading local project Lotties/images
}));
app.use(cors({
  origin: '*', // Allow all client connections for simple local deployment
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Rate Limiting (to prevent DDoS/brute-force)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { msg: 'Too many requests, please try again later.' }
});
app.use('/api/', apiLimiter);

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB successfully connected! 🍃'))
  .catch(err => {
    console.error('MongoDB connection error details:', err.message);
    console.log('Ensure MongoDB is running locally (mongod) or configure MONGODB_URI in backend/.env');
  });

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/skills', require('./routes/skills'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/guestbook', require('./routes/guestbook'));
app.use('/api/analytics', require('./routes/analytics'));

// Basic Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date()
  });
});

// Serve static assets in production if needed (Frontend Build folder)
// If we run frontend independently via dev server or static build, we can handle it here as well.

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT} 🚀`);
});
