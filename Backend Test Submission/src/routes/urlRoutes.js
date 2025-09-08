const express = require('express');
const { createShortUrl, getStats } = require('../controllers/urlController');
const router = express.Router();

// API endpoints
router.post('/shorturls', createShortUrl);
router.get('/shorturls/:shortcode', getStats);

module.exports = router;
