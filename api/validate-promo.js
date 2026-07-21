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
  // e.g. "QUILT10,BLOGGER5,SUMMER2026" — grants 10 bonus AI preview credits only.
  // PROMO_CODES_FULL_ACCESS is a second, separate list — codes here grant a full
  // Pro unlock in addition to the credits, intended for reviewers/bloggers rather
  // than the general public. Neither list is ever exposed to the browser.
  const parseList = (envVar) =>
    (process.env[envVar] || '')
      .split(',')
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean);

  const creditCodes = parseList('PROMO_CODES');
  const fullAccessCodes = parseList('PROMO_CODES_FULL_ACCESS');

  const submitted = String(code).trim().toUpperCase();
  const grantsFullAccess = fullAccessCodes.includes(submitted);
  const valid = grantsFullAccess || creditCodes.includes(submitted);

  return res.status(200).json({ valid, grantsFullAccess });
};
