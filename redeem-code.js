// Checks a submitted code against a list of valid comp/promo codes stored in the
// PROMO_CODES environment variable (comma-separated, e.g. "GUILD2026,TESTER1").
// Keeping the valid codes server-side means they never appear in the page source.
//
// Note: this does not track redemption counts or expiry — anyone with a valid code
// can redeem it any number of times, on any device. Fine for a small, trusted list;
// revoke by removing the code from PROMO_CODES if one ever leaks.

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const submitted = ((req.body && req.body.code) || '').trim().toUpperCase();
  if (!submitted) {
    return res.status(400).json({ error: 'Missing code.' });
  }

  const validCodes = (process.env.PROMO_CODES || '')
    .split(',')
    .map(c => c.trim().toUpperCase())
    .filter(Boolean);

  const valid = validCodes.includes(submitted);
  return res.status(200).json({ valid });
};
