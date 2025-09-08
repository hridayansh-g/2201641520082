const express = require('express');
const path = require('path');
// import custom logging middleware from sibling folder as per submission rule
const loggingMiddleware = require('../../Logging Middleware/logger');

const urlRoutes = require('./routes/urlRoutes');
const { redirect } = require('./controllers/urlController');

const app = express();
app.set('trust proxy', true);

// Mandatory logging middleware (extensive use)
app.use(loggingMiddleware({ logDir: path.join(process.cwd(), 'logs') }));

// JSON body parser
app.use(express.json({ limit: '100kb' }));

// Routes
app.use('/', urlRoutes);
// Redirection route (must be after API routes to avoid conflict)
app.get('/:code', redirect);

// Centralized error handler (structured)
app.use((err, req, res, _next) => {
  // Do NOT console.log; if needed, use req.logEvent
  req.logEvent && req.logEvent('ERROR', { message: err.message });
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
