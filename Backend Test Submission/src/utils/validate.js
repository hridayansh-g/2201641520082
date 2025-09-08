function isValidUrl(u) {
  try {
    const x = new URL(u);
    return !!x.protocol && !!x.host;
  } catch {
    return false;
  }
}

function toMinutesInt(v) {
  if (v === undefined || v === null || v === '') return 30; // default
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

module.exports = { isValidUrl, toMinutesInt };
