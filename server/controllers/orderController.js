import mongoose from 'mongoose';
import Order from '../models/orderModel.js';
import Cart from '../models/cartModel.js';

// Create a new order from user's cart
export const createOrder = async (req, res) => {
  console.log('OrderController -> Authenticated user:', req.user);
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const cart = await Cart.findOne({ userId });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty or missing' });
    }

    const total = cart.items.reduce((sum, item) => {
      console.log('OC -> Cart items received:', cart.items);
      console.log('OC -> Cart items received:price:', item.price);
      const price = parseFloat(item?.price);
      const quantity = parseInt(item?.quantity);
      if (isNaN(price) || isNaN(quantity)) {
        console.warn('Invalid item detected:', item);
        return sum;
      }     
      return sum + price * quantity;
    }, 0);

   
    const cancellableUntil = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from creation

    const newOrder = new Order({
      userId,
      items: cart.items,
      total,
      cancellableUntil
    });
    console.log('Order contents:', {
      userId,
      items: cart.items,
      total,
      cancellableUntil,
    });

    await newOrder.save();

    // Optionally clear cart after successful order
    cart.items = [];
    await cart.save();

    res.status(201).json({ message: 'Order created successfully', order: newOrder });
  } catch (err) {
     console.error('Full order creation error:', err);
    res.status(500).json({ message: 'Error creating order', error: err.message });
  }
};

// Get all orders of the logged-in user
export const getOrders = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders', error: err.message });
  }
};

// Get specific order by ID (only if owned)
export const getOrderById = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, userId });

    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching order', error: err.message });
  }
};

// Cancel an order (if still within cancellation window)
export const cancelOrder = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, userId });

    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (new Date() > order.cancellableUntil) {
      return res.status(403).json({ message: 'Cancellation period expired' });
    }

    order.status = 'cancelled';
    await order.save();

    res.status(200).json({ message: 'Order cancelled successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error cancelling order', error: err.message });
  }
};