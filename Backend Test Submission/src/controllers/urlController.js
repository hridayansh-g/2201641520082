const { isValidUrl, toMinutesInt } = require('../utils/validate');
const { generateShortcode, isValidShortcode } = require('../utils/shortcode');
const store = require('../models/store');

function baseUrl(req) {
  return process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
}

function createShortUrl(req, res, next) {
  try {
    const { url, validity, shortcode } = req.body || {};

    if (!url || !isValidUrl(url)) {
      return res.status(400).json({ error: 'Invalid or missing "url".' });
    }

    const mins = toMinutesInt(validity);
    if (mins === null) {
      return res.status(400).json({ error: '"validity" must be a positive integer (minutes).' });
    }

    let code = shortcode;
    if (code !== undefined) {
      if (!isValidShortcode(code)) {
        return res.status(400).json({ error: 'Invalid "shortcode". Use 4-20 chars [A-Za-z0-9_-].' });
      }
      if (store.hasShortcode(code)) {
        return res.status(409).json({ error: 'Shortcode already in use.' });
      }
    } else {
      do { code = generateShortcode(6); } while (store.hasShortcode(code));
    }

    const now = new Date();
    const expiry = new Date(now.getTime() + mins * 60 * 1000);

    const record = {
      url,
      shortcode: code,
      createdAt: now.toISOString(),
      expiry: expiry.toISOString()
    };

    store.saveUrl(record);
    req.logEvent && req.logEvent('CREATE_SHORT_URL', { shortcode: code, validityMins: mins });

    return res.status(201).json({
      shortLink: `${baseUrl(req)}/${code}`,
      expiry: record.expiry
    });
  } catch (err) {
    next(err);
  }
}

function redirect(req, res) {
  const code = req.params.code;
  const record = store.getUrl(code);
  if (!record) return res.status(404).json({ error: 'Shortcode not found.' });

  const now = Date.now();
  const exp = Date.parse(record.expiry);
  if (isFinite(exp) && now > exp) {
    return res.status(410).json({ error: 'Link expired.' }); 
  }

  const ip =
    (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim() ||
    req.socket.remoteAddress;
  const click = {
    timestamp: new Date().toISOString(),
    referrer: req.headers['referer'] || null,
    ip,
    geo: ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('172.16.')
      ? 'private'
      : 'unknown' 
  };
  store.addClick(code, click);
  req.logEvent && req.logEvent('REDIRECT', { shortcode: code });

  return res.redirect(302, record.url);
}

function getStats(req, res) {
  const code = req.params.shortcode;
  const stats = store.getStats(code);
  if (!stats) return res.status(404).json({ error: 'Shortcode not found.' });
  return res.json(stats);
}

module.exports = { createShortUrl, redirect, getStats };
