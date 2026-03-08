const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();

const connectDB = require('./config/db');
const authRoute = require('./routes/auth.route');
const uploadRoute = require('./routes/upload.route');
const apiRoutes = require('./routes/index');
const { AppError } = require('./utils/AppError');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Database ─────────────────────────────────────────────────────────────────
connectDB();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.options('*', cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/ping', (_req, res) => res.json({ status: 'ok', message: 'PONG 🏓' }));
app.use('/auth', authRoute);
app.use('/api', apiRoutes);
app.use('/upload', uploadRoute);

// ── Serve frontend (production) ───────────────────────────────────────────────
const frontendPath = path.join(path.resolve(), 'client', 'dist');
app.use(express.static(frontendPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ── Global Error Handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  // Operational / known errors
  if (err.isOperational) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(422).json({
      success: false,
      error: { message: messages.join(', '), errorCode: 'VALIDATION_ERROR', statusCode: 422 },
    });
  }

  // Mongoose cast error (bad ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: { message: `Invalid ${err.path}: ${err.value}`, errorCode: 'INVALID_ID', statusCode: 400 },
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: { message: 'Invalid token. Please log in again.', errorCode: 'INVALID_TOKEN', statusCode: 401 },
    });
  }

  // Fallback — do NOT expose stack trace in production
  console.error('💥 UNHANDLED ERROR:', err);
  res.status(500).json({
    success: false,
    error: { message: 'Something went wrong. Please try again later.', errorCode: 'INTERNAL_ERROR', statusCode: 500 },
  });
});

app.listen(PORT, () => console.log(`🛜  Server running on PORT: ${PORT}`));
