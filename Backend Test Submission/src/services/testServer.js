require('dotenv').config();

const TEST_BASE = process.env.TEST_BASE || 'http://20.244.56.144/evaluation-service';

let tokenCache = { token: null, expiresAt: 0 };

async function post(url, body, headers = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.message || data?.error || res.statusText;
    throw new Error(`HTTP ${res.status}: ${msg}`);
  }
  return data;
}

/** First-time helper: fetch clientID/clientSecret (paste into .env) */
async function registerIfNeeded() {
  const { EMAIL, NAME, ROLLNO, GITHUB_USERNAME, ACCESS_CODE, CLIENT_ID, CLIENT_SECRET } = process.env;
  if (CLIENT_ID && CLIENT_SECRET) return { clientID: CLIENT_ID, clientSecret: CLIENT_SECRET };

  const body = {
    email: EMAIL,
    name: NAME,
    mobileNo: "9999999999",
    githubUsername: GITHUB_USERNAME,
    rollNo: ROLLNO,
    accessCode: ACCESS_CODE
  };
  const data = await post(`${TEST_BASE}/register`, body);
  // Expect: { accessCode, clientID, clientSecret }
  return { clientID: data.clientID, clientSecret: data.clientSecret };
}

/** Get/refresh Bearer token */
async function ensureAuth() {
  const now = Date.now();
  if (tokenCache.token && now < tokenCache.expiresAt - 5000) return tokenCache.token;

  const { EMAIL, NAME, ROLLNO, ACCESS_CODE, CLIENT_ID, CLIENT_SECRET } = process.env;
  if (!CLIENT_ID || !CLIENT_SECRET) throw new Error('CLIENT_ID/CLIENT_SECRET missing. Run register & update .env.');

  const body = {
    email: EMAIL,
    name: NAME,
    rollNo: ROLLNO,
    accessCode: ACCESS_CODE,
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET
  };

  const data = await post(`${TEST_BASE}/auth`, body);
  const ttlMs = Number(data.expires_in || 300) * 1000;
  tokenCache = { token: data.access_token, expiresAt: Date.now() + ttlMs };
  return tokenCache.token;
}

/** Fire-and-forget remote log */
async function logToServer(stack, level, pkg, message) {
  const token = await ensureAuth();
  const body = { stack, level, package: pkg, message };
  await post(`${TEST_BASE}/logs`, body, { Authorization: `Bearer ${token}` });
}

module.exports = { registerIfNeeded, ensureAuth, logToServer };
