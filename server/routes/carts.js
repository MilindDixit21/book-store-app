import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  getCartForUser,
  saveCartToMongo,
  addSingleItem,
  removeItemFromCart,
  updateItemQuantity
} from '../controllers/cartController.js';

const router = express.Router();

// ✅ Get full cart for logged-in user
router.get('/', authMiddleware, getCartForUser);

// ✅ Save merged cart to MongoDB (e.g. after login)
router.post('/', authMiddleware, saveCartToMongo);

// ✅ Add a single item to cart
router.post('/item', authMiddleware, addSingleItem);

// ✅ Remove an item from cart
router.delete('/item/:bookId', authMiddleware, removeItemFromCart);

// ✅ Update quantity of an item
router.patch('/item/:bookId', authMiddleware, updateItemQuantity);

export default router;