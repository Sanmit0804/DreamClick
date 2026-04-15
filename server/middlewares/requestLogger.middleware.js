const pinoHttp = require('pino-http');
const { randomUUID } = require('crypto');
const logger = require('../config/logger');
const { env } = require('../config/env');

module.exports = pinoHttp({
  logger,
  genReqId: (req) => req.headers['x-request-id'] || randomUUID(),
  autoLogging: {
    ignore: (req) => req.url === '/ping',
  },
  serializers: {
    req(req) {
      return {
        id: req.id,
        method: req.method,
        url: req.url,
        remoteAddress: req.remoteAddress,
      };
    },
    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
  customLogLevel(_req, res, err) {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return env.isProduction ? 'info' : 'debug';
  },
});
