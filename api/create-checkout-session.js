const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// The one-time Quilt Designer Pro price, created in the Stripe Dashboard.
const PRO_PRICE_ID = 'price_1TsRCEPonndQkh7uS8gCONIo';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const origin = req.headers.origin || `https://${req.headers.host}`;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: PRO_PRICE_ID, quantity: 1 }],
      success_url: `${origin}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout session error:', err);
    return res.status(500).json({ error: 'Unable to start checkout.' });
  }
};
