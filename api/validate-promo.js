module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.body || {};
  if (!code) {
    return res.status(400).json({ error: 'Missing code.' });
  }

  // PROMO_CODES is a comma-separated list set in Vercel's environment variables,
  // e.g. "QUILT10,BLOGGER5,SUMMER2026" — never exposed to the browser.
  const validCodes = (process.env.PROMO_CODES || '')
    .split(',')
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);

  const submitted = String(code).trim().toUpperCase();
  const valid = validCodes.includes(submitted);

  return res.status(200).json({ valid });
};
