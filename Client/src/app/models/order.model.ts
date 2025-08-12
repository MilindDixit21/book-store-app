export interface OrderItem {
  bookId: string;
  title: string;
  author?: string;
  price: number;
  quantity: number;
  coverImage?: string;
}

export interface Order {
  _id: string; // maps to _id from MongoDB
  userId: string;
  items: OrderItem[];
  shipping:number;
  tax:number;
  discount:number;
  total: number;
  status: 'created' | 'pending' | 'shipped' | 'cancelled';
  createdAt: string; // ISO date string
  cancellableUntil: string; // ISO date string
  invoiceUrl?: string;
  updatedAt?: string;
}