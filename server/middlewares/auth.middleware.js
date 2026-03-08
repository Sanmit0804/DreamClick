const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/AppError');

/**
 * Middleware to verify JWT and attach user info to req.user
 */
const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(AppError.unauthorized('No token provided. Please log in.'));
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, iat, exp }
        next();
    } catch (error) {
        return next(AppError.unauthorized('Invalid or expired token. Please log in again.'));
    }
};

/**
 * Middleware to restrict routes to admin users only.
 * Must be used AFTER authenticate.
 */
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return next(AppError.forbidden('Access denied. Admins only.'));
    }
    next();
};

module.exports = { authenticate, requireAdmin };
