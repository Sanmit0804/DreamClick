const { env } = require('./env');

const isAllowedLocalhost = (origin) => {
  if (env.isProduction || !origin) return false;
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
};

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (env.frontendUrls.includes(origin) || isAllowedLocalhost(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400,
};

module.exports = corsOptions;
