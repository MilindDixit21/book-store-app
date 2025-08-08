import dotenv from "dotenv";
dotenv.config(); // Load env before Stripe init

import Stripe from "stripe";
import Order from "../models/orderModel.js";
import OrderPayment from "../models/orderPayment.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

// POST /api/payments/create
export const createPayment = async (req, res) => {
  try {
    const { orderId, stripeToken, amount } = req.body;
    const userId = req.user._id; // Extracted via authMiddleware

    console.log('Received payment request:', req.body);

    // Validation
    if (!orderId || !userId || !stripeToken) {
      return res
        .status(400)
        .json({
          error: "Missing required fields: stripeToken, orderId, or userId",
        });
    }

    // Fetch order details
    const order = await Order.findById(orderId);
    // console.log(`order: ${order}`);

// Defensive logging
if (!order) {
  console.error(`Order not found for ID: ${orderId}`);
  return res.status(404).json({ error: "Order not found" });
}

if (!order.userId) {
  console.error(`Order found but missing user field: ${JSON.stringify(order)}`);
  return res.status(400).json({ error: "Order is missing user information" });
}

if (order.userId.toString() !== userId.toString()) {
  console.error(`Unauthorized access: order.user=${order.user}, userId=${userId}`);
  return res.status(403).json({ error: "Unauthorized access to order" });
}

    if (!order || typeof order.total !== "number") {
      console.error("❌ Invalid order.total:", order?.total);
      return res.status(400).json({
        error: "Invalid order total amount",
      });
    }

const numericAmount = Number(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    console.error('Invalid amount received:', amount);
    return res.status(400).json({ error: "Invalid or zero payment amount" });
  }

const amountInCents = Math.round(numericAmount * 100); // Stripe uses cents


    // Safe conversion from ObjectId
    const safeOrderId =
      order?._id?.toString?.() || orderId?.toString?.() || "unknown";
    const safeUserId =
      order?.userId?.toString?.() || userId?.toString?.() || "unknown";

    console.log("💡 Fetched Order:", order);

    // Stripe Charge
    const charge = await stripe.charges.create({
      amount: amountInCents,
      currency: "usd",
      source: stripeToken,
      description: `Payment for Order ${safeOrderId}`,
      metadata: {
        orderId: safeOrderId,
        userId: safeUserId,
      },
    });

    // Save Payment Info to DB
    const payment = new OrderPayment({
      userId,
      orderId,
      amount: amountInCents,
      stripeChargeId: charge.id,
      status: charge.status,
    });

    await payment.save();

    res.status(201).json({
      success: true,
      charge,
      payment,
    });
  } catch (err) {
    console.error("💥 Stripe Payment Error:", err.message);
    console.error("💥 Full Stripe error:", err);
    res.status(500).json({
      error: err?.raw?.message || "Payment processing failed",
    });
  }
};
