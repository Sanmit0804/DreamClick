const helmet = require('helmet');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const { env } = require('../config/env');

const sanitizeString = (value) =>
  value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\s+on\w+="[^"]*"/gi, '')
    .replace(/\s+on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');

const sanitizeValue = (value) => {
  if (typeof value === 'string') return sanitizeString(value);
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value && typeof value === 'object') {
    Object.keys(value).forEach((key) => {
      value[key] = sanitizeValue(value[key]);
    });
  }
  return value;
};

const xssSanitizer = (req, _res, next) => {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.params) req.params = sanitizeValue(req.params);
  if (req.query) sanitizeValue(req.query);
  next();
};

const rateLimitResponse = (_req, res) =>
  res.status(429).json({
    success: false,
    message: 'Too many requests. Please try again later.',
    errorCode: 'RATE_LIMITED',
    error: {
      message: 'Too many requests. Please try again later.',
      errorCode: 'RATE_LIMITED',
      statusCode: 429,
    },
  });

const apiLimiter = rateLimit({
  windowMs: env.apiRateLimitWindowMs,
  limit: env.apiRateLimitMax,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: rateLimitResponse,
});

const authLimiter = rateLimit({
  windowMs: env.authRateLimitWindowMs,
  limit: env.authRateLimitMax,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: rateLimitResponse,
});

const securityHeaders = helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: env.isProduction
    ? undefined
    : false,
});

module.exports = {
  apiLimiter,
  authLimiter,
  securityHeaders,
  mongoSanitize: mongoSanitize({ replaceWith: '_' }),
  hpp: hpp(),
  xssSanitizer,
};
