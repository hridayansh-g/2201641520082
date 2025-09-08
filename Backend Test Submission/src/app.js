const express = require('express');
const path = require('path');
const loggingMiddleware = require('../../Logging Middleware/logger');

const { logToServer, ensureAuth } = require('../services/testServer');

const urlRoutes = require('./routes/urlRoutes');
const { redirect } = require('./controllers/urlController');

const app = express();
app.set('trust proxy', true);

ensureAuth().catch(()=>{});

app.use(
  loggingMiddleware({
    logDir: path.join(process.cwd(), 'logs'),
    forward: async (stack, level, pkg, message) => {
      try { await logToServer(stack, level, pkg, message); } catch {}
    },
  })
);

app.use(express.json({ limit: '100kb' }));

app.use('/', urlRoutes);
app.get('/:code', redirect);

app.use((err, req, res, _next) => {
  req.logEvent && req.logEvent('ERROR', { message: err.message });
  logToServer('backend', 'fatal', 'handler', err.message).catch(()=>{});
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
