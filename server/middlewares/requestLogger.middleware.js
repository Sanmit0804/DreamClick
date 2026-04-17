const { randomUUID } = require('crypto');

module.exports = (req, res, next) => {
  if (req.url === '/ping') return next();

  req.id = req.headers['x-request-id'] || randomUUID();
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const msg = `[${req.method}] ${req.url} - ${res.statusCode} - ${duration}ms`;

    if (res.statusCode >= 500) {
      console.error(msg);
    } else if (res.statusCode >= 400) {
      console.warn(msg);
    } else {
      console.log(msg);
    }
  });

  next();
};
