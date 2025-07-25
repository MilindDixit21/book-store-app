import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book', // optional: for population
    required: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  title: String,      // optional
  author: String,     // optional
  price: Number,      // optional
  cover: String       // optional, e.g. image URL
}, { _id: false }); // prevent nested item _id generation

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // ties to user collection
    required: true,
    unique: true // one cart per user
  },
  items: {
    type: [cartItemSchema],
    default: []
  }
}, {
  timestamps: true // adds createdAt, updatedAt
});

export default mongoose.model('Cart', cartSchema);
