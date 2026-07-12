module.exports = async function handler(req, res) {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Missing prediction id.' });
  }

  try {
    const response = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: { 'Authorization': `Bearer ${process.env.REPLICATE_TOKEN}` }
    });
    const data = await response.json();
    if (!response.ok) {
      console.error('Replicate status error:', data);
      return res.status(500).json({ error: 'Unable to check status.' });
    }
    return res.status(200).json({ status: data.status, output: data.output, error: data.error });
  } catch (err) {
    console.error('Room preview status error:', err);
    return res.status(500).json({ error: 'Unable to check status.' });
  }
};
