const REPLICATE_MODEL = 'black-forest-labs/flux-2-pro';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body || {};
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt.' });
  }

  try {
    const response = await fetch(`https://api.replicate.com/v1/models/${REPLICATE_MODEL}/predictions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.REPLICATE_TOKEN}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait=0'
      },
      body: JSON.stringify({ input: { prompt } })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Replicate start error:', data);
      return res.status(500).json({ error: 'Unable to start image generation.' });
    }

    return res.status(200).json({ id: data.id, status: data.status });
  } catch (err) {
    console.error('Room preview start error:', err);
    return res.status(500).json({ error: 'Unable to start image generation.' });
  }
};
