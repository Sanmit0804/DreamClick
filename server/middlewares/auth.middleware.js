const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const { AppError } = require('../utils/AppError');

const readBearerToken = (req) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || typeof authHeader !== 'string') return null;
  if (!authHeader.startsWith('Bearer ')) return null;
  return authHeader.slice(7).trim();
};

const authenticate = (req, _res, next) => {
  const token = readBearerToken(req);
  if (!token) {
    return next(AppError.unauthorized('No token provided. Please log in.'));
  }

  try {
    req.user = jwt.verify(token, env.jwtSecret);
    return next();
  } catch (error) {
    return next(error);
  }
};

const optionalAuthenticate = (req, _res, next) => {
  const token = readBearerToken(req);
  if (!token) return next();

  try {
    req.user = jwt.verify(token, env.jwtSecret);
    return next();
  } catch (_error) {
    return next();
  }
};

const authorizeRoles = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(AppError.forbidden('Access denied.', 'FORBIDDEN'));
  }
  return next();
};

const requireAdmin = authorizeRoles('admin');

module.exports = {
  authenticate,
  optionalAuthenticate,
  authorizeRoles,
  requireAdmin,
};
