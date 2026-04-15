const pino = require('pino');
const { env } = require('./env');

const logger = pino({
  level: process.env.LOG_LEVEL || (env.isProduction ? 'info' : 'debug'),
  base: env.isProduction ? undefined : { service: 'dreamclick-api' },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      '*.password',
      'token',
      '*.token',
      'accessToken',
      'refreshToken',
      '*.accessToken',
      '*.refreshToken',
    ],
    remove: true,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

module.exports = logger;
