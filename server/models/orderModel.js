import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  title: String,
  author: String,
  price: Number,
  quantity: { type: Number, default: 1, min: 1 },
  coverImage: String}, 
  { _id: false }
); // keep this clean like cartItem

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: {
    type: [orderItemSchema],
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['created', 'shipped', 'cancelled'],
    default: 'created'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  cancellableUntil: {
    type: Date,
    required: true
  },
  invoiceUrl: {
    type: String // optional, in case you generate PDF links later
  }
}, {
  timestamps: true // adds updatedAt for future tracking
});

export default mongoose.model('Order', orderSchema);