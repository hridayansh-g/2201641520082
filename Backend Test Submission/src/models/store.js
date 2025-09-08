// In-memory storage (sufficient for assignment)
const urlMap = new Map();      // shortcode -> { url, shortcode, createdAt, expiry }
const clickMap = new Map();    // shortcode -> [ { timestamp, referrer, ip, geo } ]

function hasShortcode(code) { return urlMap.has(code); }

function saveUrl(rec) {
  if (urlMap.has(rec.shortcode)) throw new Error('EXISTS');
  urlMap.set(rec.shortcode, rec);
  clickMap.set(rec.shortcode, []);
}

function getUrl(code) { return urlMap.get(code) || null; }

function addClick(code, click) {
  const arr = clickMap.get(code);
  if (arr) arr.push(click);
}

function getStats(code) {
  const meta = urlMap.get(code);
  if (!meta) return null;
  const clicks = clickMap.get(code) || [];
  return {
    shortcode: meta.shortcode,
    url: meta.url,
    createdAt: meta.createdAt,
    expiry: meta.expiry,
    totalClicks: clicks.length,
    clicks
  };
}

module.exports = { hasShortcode, saveUrl, getUrl, addClick, getStats };
