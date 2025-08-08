import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CartItem } from '../models/cart.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  private items: CartItem[] = [];
  private cart$ = new BehaviorSubject<CartItem[]>([]);
  private total$ = new BehaviorSubject<number>(0);
  private estimatedTotal$ = new BehaviorSubject<number>(0);
  private restoreComplete$ = new BehaviorSubject<boolean>(false);

  private checkoutCartSnapshot: CartItem[] = [];
  
  constructor(private http: HttpClient, private authService: AuthService) {
    this.restoreCart();
  }

  // Indicates when cart is fully restored
  getRestoreComplete(): Observable<boolean> {
    return this.restoreComplete$.asObservable();
  }

  // Restore from localStorage, then merge with server cart
  private restoreCart(): void {
    const stored = localStorage.getItem(this.getCartStorageKey());
    if (stored) {
      try {
        this.items = JSON.parse(stored);
        this.updateCartState(false);
      } catch {
        localStorage.removeItem(this.getCartStorageKey());
      }
    }

    // Only fetch server cart if logged in
    if (this.authService.getToken()) {
      this.getUserCartFromServer().subscribe({
        next: (res) => {
          const serverItems = res.items || [];
          const merged = this.mergeCarts(serverItems, this.items);
          console.log('merged: ', merged);

          this.setCart(merged);
          this.restoreComplete$.next(true);
        },
        error: (err) => {
          console.warn('Cart fetch on init failed:', err);
          this.restoreComplete$.next(true); // still mark as complete
        },
      });
    } else {
      this.restoreComplete$.next(true);
    }
  }

  getCartStorageKey(): string {
    const userId = this.authService.getUserId();
    return userId ? `bookCart_${userId}` : 'cart_guest';
  }

  getCart(): Observable<CartItem[]> {
    return this.cart$.asObservable();
  }

  getTotalAmount(): Observable<number> {
    return this.total$.asObservable();
  }

  getGuestCart(): CartItem[] {
    const raw = localStorage.getItem('cart_guest');
    try {
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  }

  setCart(items: CartItem[]): void {
    this.items = [...items];
    this.updateCartState(true);
  }

  addToCart(cartOrItem: CartItem | CartItem[]): void {
    const toAdd = Array.isArray(cartOrItem) ? cartOrItem : [cartOrItem];
    toAdd.forEach((book) => {
      if (!book?._id || book.price == null) return;
      const exist = this.items.find((i) => i._id === book._id);
      if (exist) exist.quantity += book.quantity || 1;
      else this.items.push({ ...book, quantity: book.quantity || 1 });
    });
    this.updateCartState(true);

    if (this.authService.getToken()) {
      console.log('sending [this] item to cart: ', this.items);

      this.saveCartToServer({ items: this.items }).subscribe({
        error: (err) => console.warn('Sync failed on add:', err),
      });
    }
  }

  removeFromCart(bookId: string, delta: number): void {
    const idx = this.items.findIndex((i) => i._id === bookId);
    if (idx < 0) return;
    const item = this.items[idx];
    if (delta >= item.quantity) {
      this.items.splice(idx, 1);
    } else {
      item.quantity -= delta;
    }
    this.updateCartState(true);

    if (this.authService.getToken()) {
      this.deleteItemFromServer(bookId).subscribe({
        error: (err) => console.warn('Delete failed:', err),
      });
    }
  }

  adjustQuantity(bookId: string, delta: number): void {
    const item = this.items.find((i) => i._id === bookId);
    if (!item) return;
    item.quantity = Math.max(1, item.quantity + delta);
    this.updateCartState(true);

    if (this.authService.getToken()) {
      this.saveCartToServer({ items: this.items }).subscribe({
        error: (err) => console.warn('Sync failed on adjust:', err),
      });
    }
  }

  getUserCartFromServer(): Observable<{ items?: CartItem[] }> {
    const token = this.authService.getToken();
    if (!token) return throwError(() => new Error('No auth token'));
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<{ items?: CartItem[] }>(
      'http://localhost:3000/api/cart',
      { headers }
    );
  }

  // - Fetch serverCart immediately after login (or token refresh).
  // - Normalize and sync it into local cart (this.items) and update UI via cart$.
  loadServerCartToLocal(): void {
    if (!this.authService.getToken()) return;
    this.getUserCartFromServer().subscribe({
      next: (res) => {
        const serverItems = (res.items || []).map((item) =>
          this.normalizeCartItem(item)
        );
        this.items = [...serverItems];
        this.updateCartState(true); // pushes to localStorage + UI
        console.log('Cart loaded from server into local cart:', this.items);
      },
      error: (err) => {
        console.warn('Failed to load server cart into local after login:', err);
      },
    });
  }

  saveCartToServer(payload: { items: CartItem[] }): Observable<any> {
    const token = this.authService.getToken();
    if (!token) return throwError(() => new Error('No auth token'));
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post('http://localhost:3000/api/cart', payload, {
      headers,
    });
  }

  // Normalize server cart Items
  private normalizeCartItem(raw: any): CartItem {
    const book = raw.bookId || {};
    return {
      _id: book._id || raw._id,
      title: book.title || raw.title,
      author: book.author || raw.author,
      summary: book.summary || raw.summary,
      price: book.price || raw.price,
      quantity: raw.quantity,
      coverImage: book.coverImage || raw.coverImage || raw.coverImage,
    };
  }

  private hasMerged = false; // used to prevent re-merging on refresh

  mergeCarts(serverItems: CartItem[], guestItems: CartItem[]): CartItem[] {
    const mergedMap = new Map<string, CartItem>();

    // Normalize and trim IDs (if needed)
    const normalizedServer = serverItems || [];
    const normalizedGuest = guestItems || [];

    // Add serverCart items first
    normalizedServer.forEach((item) => {
      if (item && item._id) {
        mergedMap.set(item._id, { ...item });
      }
    });

    // Merge guestCart items only if:
    // - They don’t exist in serverCart
    // - Or they have a higher quantity
    normalizedGuest.forEach((guestItem) => {
      if (!guestItem || !guestItem._id) return;
      const existing = mergedMap.get(guestItem._id);

      if (!existing) {
        mergedMap.set(guestItem._id, { ...guestItem });
      } else if (guestItem.quantity > existing.quantity) {
        mergedMap.set(guestItem._id, {
          ...existing,
          quantity: guestItem.quantity,
        });
      }
    });

    return Array.from(mergedMap.values());
  }

  deleteItemFromServer(bookId: string): Observable<any> {
    const token = this.authService.getToken();
    if (!token) return throwError(() => new Error('No auth token'));

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    return this.http.delete(`http://localhost:3000/api/cart/item/${bookId}`, {
      headers,
    });
  }

  private updateCartState(writeToStorage: boolean): void {
  this.cart$.next([...this.items]);

  const subtotal = this.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = subtotal * 0.07;
  const shipping = 5.99;
  const total = subtotal + tax + shipping;

  this.total$.next(parseFloat(total.toFixed(2))); // Round to 2 decimal places

  if (writeToStorage) {
    localStorage.setItem(
      this.getCartStorageKey(),
      JSON.stringify(this.items)
    );
  }
}
//keeps (updateCartState()) encapsulation intact while allowing external components (like PaymentComponent) to refresh the cart state.
public refreshCartFromStorage(): void {
  const storedCart = localStorage.getItem(this.getCartStorageKey());
  if (storedCart) {
    this.items = JSON.parse(storedCart);
    this.updateCartState(false); // Don't rewrite storage
  }
}

  // private updateCartState(writeToStorage: boolean): void {
  //   this.cart$.next([...this.items]);
  //   this.total$.next(
  //     this.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  //   );
  //   if (writeToStorage) {
  //     localStorage.setItem(
  //       this.getCartStorageKey(),
  //       JSON.stringify(this.items)
  //     );
  //   }
  // }

  clearCart(): void {
    this.items = [];
    localStorage.removeItem(this.getCartStorageKey());
    this.updateCartState(true);
  }

  // Checkout Logic
  setCheckoutCart(items: CartItem[]): void {
    this.checkoutCartSnapshot = [...items];
  }

  getCheckoutCart(): CartItem[] {
    return [...this.checkoutCartSnapshot];
  }

  setTotalAmount(amount: number): void {
    this.estimatedTotal$.next(amount);
  }

  getTotalAmountValue(): number {
    return this.estimatedTotal$.getValue();
  }

  checkoutCart(): Observable<string> {
  const token = this.authService.getToken();
  if (!token) return throwError(() => new Error('No auth token'));
  const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
  return this.http.post<{ order: { _id: string } }>(
    'http://localhost:3000/api/orders/create',
    {}, // no body needed — backend reads cart from DB
    { headers }
  ).pipe(
    map((res) => {
      const orderId = res.order?._id;
      if (!orderId) throw new Error('Missing orderId in response');
      // Preserve snapshot for payment flow

      const validItems = this.items.map(item => ({
        ...item,
        price: Number(item.price),
        quantity: Number(item.quantity)
      }));
      this.setCheckoutCart(validItems);
      this.setTotalAmount(this.total$.getValue());
      return orderId;
    }),
    catchError((err) => {
      console.error('Checkout error:', err);
      return throwError(() => new Error('Checkout failed'));
    })
  );
}
}
