const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Live Price IDs, created in the Stripe Dashboard.
const PRICE_IDS = {
  pro: 'price_1TsRCEPonndQkh7uS8gCONIo', // Quilt Designer Pro, one-time
  credits: 'price_1TsUdfPonndQkh7uKozmCM5D' // 10 Room Preview Credits, one-time
};

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const type = (req.body && req.body.type) || 'pro';
  const priceId = PRICE_IDS[type];
  if (!priceId) {
    return res.status(400).json({ error: 'Unknown product type.' });
  }

  try {
    const origin = req.headers.origin || `https://${req.headers.host}`;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { type },
      success_url: `${origin}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout session error:', err);
    return res.status(500).json({ error: 'Unable to start checkout.' });
  }
};
