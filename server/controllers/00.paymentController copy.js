import dotenv from 'dotenv';
dotenv.config(); // Load env before Stripe init

import Stripe from 'stripe';

// Ensure secret key is available
const stripeSecret = process.env.STRIPE_SECRET_KEY;
if (!stripeSecret) {
  throw new Error('Stripe secret key not found in environment variables');
}

// Initialize Stripe with versioning
const stripe = new Stripe(stripeSecret, {
  apiVersion: '2024-06-20',
});

export const chargePayment = async (req, res) => {
  try {
    const { amount, token } = req.body;

    // Validate payload
    if (!amount || !token) {
      return res.status(400).json({ error: 'Amount and token are required' });
    }

    // Stripe expects amount in cents (e.g., $10 → 1000)
    const charge = await stripe.charges.create({
      amount,
      currency: 'usd',
      source: token,
      description: 'Book Store Payment',
    });

    res.status(200).json({ success: true, charge });
  } catch (error) {
    console.error('Stripe Charge Error:', error.message);

    // Provide Stripe-specific feedback if available
    res.status(500).json({
      error: error.raw?.message || 'Payment failed. Please try again.',
    });
  }
};

export const createOrderPayment = async (req, res) => {
  try {
    const { amount, token, orderId, userId } = req.body;

    if (!amount || !token || !orderId || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Stripe charge
    const charge = await stripe.charges.create({
      amount,
      currency: 'usd',
      source: token,
      description: `Payment for Order ${orderId}`,
      metadata: { orderId, userId },
    });

    // Save payment info in DB
    const paymentRecord = new OrderPayment({
      userId: new mongoose.Types.ObjectId(userId),
      orderId: new mongoose.Types.ObjectId(orderId),
      amount,
      stripeChargeId: charge.id,
      status: charge.status,
      createdAt: new Date(),
    });

    await paymentRecord.save();

    res.status(201).json({ success: true, charge, paymentRecord });
  } catch (error) {
    console.error('❌ createOrderPayment Error:', error.message);
    res.status(500).json({
      error: error.raw?.message || 'Failed to create payment',
    });
  }
};

