const success = (res, statusCode, payload = {}) => res.status(statusCode).json(payload);

module.exports = { success };
