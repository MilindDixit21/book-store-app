import mongoose from "mongoose";

const orderPaymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  amount: { type: Number, required: true },
  stripeChargeId: { type: String, required: true },
  status: { type: String, default: 'succeeded' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('OrderPayment', orderPaymentSchema);