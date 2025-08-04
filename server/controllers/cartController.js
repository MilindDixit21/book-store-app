import Cart from '../models/cartModel.js';

export async function getCartForUser(req, res) {
  try {
    const cart = await Cart.findOne({ userId: req.user._id }).populate('items.bookId');
    res.status(200).json(cart || { userId: req.user._id, items: [] });
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({ message: 'Failed to fetch cart', error: err.message });
  }
}

export async function saveCartToMongo(req, res) {
  console.log('✅ cartController received userId:', req.user?._id);

  const userId = req.user?._id; // decoded from jwt
  if(!userId){
    return res.status(401).json({message: 'user not authenticated'});
  }
  const items = req.body.items;
  if (!Array.isArray(items)) {
    return res.status(400).json({ message: 'Invalid items array' });
  }
  try {
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
    }
    for (const incoming of items) {
      if (!incoming._id || typeof incoming.quantity !== 'number') continue;

      const index = cart.items.findIndex(
        i => i.bookId.toString() === incoming._id
      );
      if (index !== -1) {
        // replace quantity instead of incrementing 
        // cart.items[index].quantity += incoming.quantity; // incrementing
        cart.items[index].quantity = incoming.quantity;
      } else {
        cart.items.push({ bookId: incoming._id, quantity: incoming.quantity });
      }
    }
    await cart.save();
    const updated = await cart.populate('items.bookId');
    res.status(200).json(updated);
  } catch (err) {
    console.error('Error saving cart:', err);
    res.status(500).json({ message: 'Failed to save cart', error: err.message });
  }
}

export async function addSingleItem(req, res) {
  const { bookId, quantity } = req.body;
  if (!bookId || quantity < 1) {
    return res.status(400).json({ message: 'Invalid bookId or quantity' });
  }
  try {
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [{ bookId, quantity }] });
    } else {
      const existing = cart.items.find(item => item.bookId.toString() === bookId);
      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.items.push({ bookId, quantity });
      }
    }
    await cart.save();
    const updated = await cart.populate('items.bookId');
    res.status(200).json(updated);
  } catch (err) {
    console.error('Error adding item:', err);
    res.status(500).json({ message: 'Failed to add item', error: err.message });
  }
}

export async function removeItemFromCart(req, res) {
  const bookId = req.params.bookId;
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    cart.items = cart.items.filter(item => item.bookId.toString() !== bookId);
    await cart.save();
    const updated = await cart.populate('items.bookId');
    res.status(200).json(updated);
  } catch (err) {
    console.error('Error removing item:', err);
    res.status(500).json({ message: 'Failed to remove item', error: err.message });
  }
}

export async function updateItemQuantity(req, res) {
  const bookId = req.params.bookId;
  const { quantity } = req.body;
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    const item = cart.items.find(item => item.bookId.toString() === bookId);
    if (!item) return res.status(404).json({ message: 'Item not found in cart' });
    item.quantity = Math.max(1, quantity);
    await cart.save();
    const updated = await cart.populate('items.bookId');
    res.status(200).json(updated);
  } catch (err) {
    console.error('Error updating quantity:', err);
    res.status(500).json({ message: 'Failed to update item', error: err.message });
  }
}