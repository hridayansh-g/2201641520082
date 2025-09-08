(async () => {
  const { registerIfNeeded } = require('./src/services/testServer');
  try {
    const out = await registerIfNeeded();
    console.log('clientID:', out.clientID);
    console.log('clientSecret:', out.clientSecret);
  } catch (e) {
    console.error('Register failed:', e.message);
  }
})();
