const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  const sessionId = req.query.session_id;
  if (!sessionId) {
    return res.status(400).json({ error: 'Missing session_id.' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return res.status(200).json({ paid: session.payment_status === 'paid' });
  } catch (err) {
    console.error('Stripe session verification error:', err);
    return res.status(500).json({ error: 'Unable to verify session.' });
  }
};
