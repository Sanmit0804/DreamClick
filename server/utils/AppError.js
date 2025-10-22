class AppError extends Error {
  constructor(message, statusCode, errorCode = null, details = null) {
    super(message);
    
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.isOperational = true; // Mark as operational error (trusted errors)
    
    // Capture stack trace (excluding constructor call from the trace)
    Error.captureStackTrace(this, this.constructor);
  }

  // Static factory methods for common error types
  static badRequest(message = 'Bad Request', errorCode = 'BAD_REQUEST', details = null) {
    return new AppError(message, 400, errorCode, details);
  }

  static unauthorized(message = 'Unauthorized', errorCode = 'UNAUTHORIZED', details = null) {
    return new AppError(message, 401, errorCode, details);
  }

  static forbidden(message = 'Forbidden', errorCode = 'FORBIDDEN', details = null) {
    return new AppError(message, 403, errorCode, details);
  }

  static notFound(message = 'Resource not found', errorCode = 'NOT_FOUND', details = null) {
    return new AppError(message, 404, errorCode, details);
  }

  static conflict(message = 'Conflict', errorCode = 'CONFLICT', details = null) {
    return new AppError(message, 409, errorCode, details);
  }

  static validationError(message = 'Validation failed', errorCode = 'VALIDATION_ERROR', details = null) {
    return new AppError(message, 422, errorCode, details);
  }

  static internalError(message = 'Internal server error', errorCode = 'INTERNAL_ERROR', details = null) {
    return new AppError(message, 500, errorCode, details);
  }

  static serviceUnavailable(message = 'Service unavailable', errorCode = 'SERVICE_UNAVAILABLE', details = null) {
    return new AppError(message, 503, errorCode, details);
  }

  // Convert to JSON for API response
  toJSON() {
    return {
      success: false,
      error: {
        message: this.message,
        errorCode: this.errorCode,
        statusCode: this.statusCode,
        details: this.details,
        timestamp: this.timestamp
      }
    };
  }

  // Convert to plain object (for logging or other purposes)
  toObject() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      errorCode: this.errorCode,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
}

// Specific error types for common use cases
class ValidationError extends AppError {
  constructor(message = 'Validation failed', details = null) {
    super(message, 422, 'VALIDATION_ERROR', details);
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed', details = null) {
    super(message, 401, 'AUTHENTICATION_ERROR', details);
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Access denied', details = null) {
    super(message, 403, 'AUTHORIZATION_ERROR', details);
  }
}

class ResourceNotFoundError extends AppError {
  constructor(resource = 'Resource', details = null) {
    super(`${resource} not found`, 404, 'RESOURCE_NOT_FOUND', details);
  }
}

class DatabaseError extends AppError {
  constructor(message = 'Database operation failed', details = null) {
    super(message, 500, 'DATABASE_ERROR', details);
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  ResourceNotFoundError,
  DatabaseError
};