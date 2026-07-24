const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// There's no account system in Quilt Designer — Pro status lives in
// localStorage on whatever browser made the purchase. This endpoint lets
// someone recover that status on a new device/browser by looking up their
// Stripe purchase history via the email they checked out with, rather than
// requiring an account they never had to begin with.
//
// Checkout Sessions don't have their own search-by-email API, but Customers
// do (Stripe's Search API) — and even without explicitly requesting
// customer_creation, Stripe still associates a completed session with a
// "guest customer" behind the scenes, so this path works for purchases
// already made as well as future ones.
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const email = ((req.body && req.body.email) || '').trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ error: 'Missing email.' });
  }

  try {
    const customers = await stripe.customers.search({
      query: `email:"${email}"`,
      limit: 10
    });

    let hasPro = false;
    for (const customer of customers.data) {
      const sessions = await stripe.checkout.sessions.list({ customer: customer.id, limit: 100 });
      if (sessions.data.some((s) => s.payment_status === 'paid' && s.metadata && s.metadata.type === 'pro')) {
        hasPro = true;
        break;
      }
    }

    return res.status(200).json({ restored: hasPro });
  } catch (err) {
    console.error('Restore purchase error:', err);
    return res.status(500).json({ error: 'Unable to check your purchase history right now. Please try again in a moment.' });
  }
};
