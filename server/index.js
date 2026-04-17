const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const corsOptions = require('./config/cors');
const { env, assertRequiredEnv } = require('./config/env');
const authRoute = require('./routes/auth.route');
const uploadRoute = require('./routes/upload.route');
const apiRoutes = require('./routes/index');
const youtubeRoute = require('./routes/youtube.route');
const requestLogger = require('./middlewares/requestLogger.middleware');
const {
  apiLimiter,
  authLimiter,
  securityHeaders,
  mongoSanitize,
  hpp,
  xssSanitizer,
} = require('./middlewares/security.middleware');
const { errorHandler, notFound } = require('./middlewares/error.middleware');

assertRequiredEnv();
connectDB();

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(requestLogger);
app.use(securityHeaders);
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(mongoSanitize);
app.use(hpp);
app.use(xssSanitizer);

app.get('/ping', (_req, res) => res.json({ status: 'ok', message: 'PONG' }));

const uploadsPath = path.resolve(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

app.use('/auth', authLimiter, authRoute);
app.use('/api', apiLimiter, apiRoutes);
app.use('/upload', apiLimiter, uploadRoute);
app.use('/youtube', apiLimiter, youtubeRoute);

app.use(['/auth', '/api', '/upload', '/youtube'], notFound);
app.use(errorHandler);

const frontendPath = path.resolve(__dirname, '..', 'client', 'dist');
app.use(express.static(frontendPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

const server = app.listen(env.port, () => {
  console.log(`🛜  Server running on PORT: ${env.port}`);
});

const shutdown = (signal) => {
  console.log({ signal }, 'Shutdown signal received');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

module.exports = app;
