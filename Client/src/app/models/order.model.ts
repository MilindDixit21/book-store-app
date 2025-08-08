import { CartItem } from './cart.model';
import { Role } from './user.model';

export interface Order {
  _id: string;                            // Unique MongoDB ID for the order
  userId: string;                         // Reference to the ordering user
  items: CartItem[];                      // Array of ordered books
  total: number;                          // Final price of all items
  createdAt: string;                      // Timestamp when order was placed
  cancellableUntil: string;              // Deadline for cancellation (ISO string)
  status: 'created' | 'shipped' | 'cancelled';  // Current order status
  invoiceUrl?: string;                   // Optional link to download invoice
  isCancellable?: boolean;                // Computed client-side for display logic
}
