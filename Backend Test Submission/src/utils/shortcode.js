// Base62 shortcode generator (no external algos)
const crypto = require('crypto');
const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

function generateShortcode(len = 6) {
  // 62^6 ≈ 56B combos; retry on collision
  const bytes = crypto.randomBytes(len);
  let out = '';
  for (let i = 0; i < len; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}

function isValidShortcode(code) {
  return /^[A-Za-z0-9_-]{4,20}$/.test(code);
}

module.exports = { generateShortcode, isValidShortcode };
