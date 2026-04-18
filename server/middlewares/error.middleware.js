const { AppError } = require('../utils/AppError');

const normalizeError = (err) => {
  if (err instanceof AppError || err.isOperational) return err;

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors || {}).map((e) => e.message);
    return AppError.validationError(messages.join(', ') || 'Validation failed');
  }

  if (err.name === 'CastError') {
    return AppError.badRequest(`Invalid ${err.path}: ${err.value}`, 'INVALID_ID');
  }

  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue || {}).join(', ');
    return AppError.conflict(fields ? `${fields} already exists` : 'Duplicate value');
  }

  if (err.name === 'JsonWebTokenError') {
    return AppError.unauthorized('Invalid token. Please log in again.', 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    return AppError.unauthorized('Token expired. Please log in again.', 'TOKEN_EXPIRED');
  }

  return err;
};

const notFound = (req, _res, next) => {
  next(AppError.notFound(`Route not found: ${req.originalUrl}`, 'ROUTE_NOT_FOUND'));
};

const errorHandler = (err, req, res, _next) => {
  const normalized = normalizeError(err);
  const statusCode = normalized.statusCode || 500;

  if (statusCode >= 500) {
    console.error({ err, reqId: req.id, path: req.originalUrl }, 'Unhandled request error');
  } else {
    console.warn({ err: normalized, reqId: req.id, path: req.originalUrl }, 'Request failed');
  }

  if (normalized.isOperational) {
    return res.status(statusCode).json(normalized.toJSON());
  }

  return res.status(500).json({
    success: false,
    message: 'Something went wrong. Please try again later.',
    errorCode: 'INTERNAL_ERROR',
    error: {
      message: 'Something went wrong. Please try again later.',
      errorCode: 'INTERNAL_ERROR',
      statusCode: 500,
    },
  });
};

module.exports = { errorHandler, notFound };
