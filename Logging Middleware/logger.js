// Custom request/response logging middleware (no console.log)
// Writes structured JSON lines to logs/access.log in the current working dir
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function loggingMiddleware(options = {}) {
  const logDir = options.logDir || path.join(process.cwd(), 'logs');
  const logFile = path.join(logDir, 'access.log');
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

  const write = (record) => {
    fs.appendFile(logFile, JSON.stringify(record) + '\n', () => {});
  };

  return function (req, res, next) {
    const start = process.hrtime.bigint();
    const rid = crypto.randomUUID();
    req.requestId = rid;

    // custom event logger available to handlers
    req.logEvent = (event, data = {}) => {
      write({
        ts: new Date().toISOString(),
        rid,
        type: 'BUSINESS',
        event,
        path: req.originalUrl,
        method: req.method,
        data
      });
    };

    res.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
      write({
        ts: new Date().toISOString(),
        rid,
        type: 'HTTP',
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        durationMs: +durationMs.toFixed(2),
        ip:
          (req.headers['x-forwarded-for'] || '')
            .toString()
            .split(',')[0]
            .trim() || req.socket.remoteAddress,
        ua: req.headers['user-agent'] || '',
        referer: req.headers['referer'] || ''
      });
    });

    next();
  };
}

module.exports = loggingMiddleware;
