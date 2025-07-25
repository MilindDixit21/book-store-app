import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CartItem } from '../models/cart.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private items: CartItem[] = [];
  private cart$ = new BehaviorSubject<CartItem[]>([]);
  private total$ = new BehaviorSubject<number>(0);

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // on init, pull from localStorage (guest or user)
    const stored = localStorage.getItem(this.getCartStorageKey());
    if (stored) {
      try {
        this.items = JSON.parse(stored);
        this.updateCartState(false);
      } catch {
        localStorage.removeItem(this.getCartStorageKey());
      }
    }
  }

  // Returns 'cart_guest' or 'bookCart_{userId}'
  getCartStorageKey(): string {
    const userId = this.authService.getUserId();
    return userId ? `bookCart_${userId}` : 'cart_guest';
  }

  // Expose streams
  getCart(): Observable<CartItem[]> { return this.cart$.asObservable(); }
  getTotalAmount(): Observable<number> { return this.total$.asObservable(); }

  // Grab guest cart snapshot
  getGuestCart(): CartItem[] {
    const raw = localStorage.getItem('cart_guest');
    try {
      return raw ? JSON.parse(raw) as CartItem[] : [];
    } catch {
      return [];
    }
  }

  // Replace current cart in memory + storage + UI
  setCart(items: CartItem[]): void {
    this.items = [...items];
    this.updateCartState(true);
  }

  // add single or array of items
  addToCart(cartOrItem: CartItem | CartItem[]): void {
    const toAdd = Array.isArray(cartOrItem) ? cartOrItem : [cartOrItem];
    toAdd.forEach(book => {
      if (!book?._id || book.price == null) return;
      const exist = this.items.find(i => i._id === book._id);
      if (exist) exist.quantity += book.quantity || 1;
      else this.items.push({ ...book, quantity: book.quantity || 1 });
    });
    this.updateCartState(true);

    // if logged in, push to server
    if (this.authService.getToken()) {
      this.saveCartToServer({ items: this.items }).subscribe({
        error: err => console.warn('Sync failed on add:', err)
      });
    }
  }

  removeFromCart(bookId: string, delta: number): void {
    const idx = this.items.findIndex(i => i._id === bookId);
    if (idx < 0) return;
    const item = this.items[idx];
    if (delta >= item.quantity) {
      this.items.splice(idx, 1);
    } else {
      item.quantity -= delta;
    }
    this.updateCartState(true);
    if (this.authService.getToken()) {
      this.saveCartToServer({ items: this.items }).subscribe({
        error: err => console.warn('Sync failed on remove:', err)
      });
    }
  }

  adjustQuantity(bookId: string, delta: number): void {
    const item = this.items.find(i => i._id === bookId);
    if (!item) return;
    item.quantity = Math.max(1, item.quantity + delta);
    this.updateCartState(true);
    if (this.authService.getToken()) {
      this.saveCartToServer({ items: this.items }).subscribe({
        error: err => console.warn('Sync failed on adjust:', err)
      });
    }
  }

  // Pull the user’s cart from Mongo
  getUserCartFromServer(): Observable<{ items?: CartItem[] }> {
    const token = this.authService.getToken();
    if (!token) return throwError(() => new Error('No auth token'));
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<{ items?: CartItem[] }>(
      'http://localhost:3000/api/cart',
      { headers }
    );
  }

  // Overwrite server cart
  saveCartToServer(payload: { items: CartItem[] }): Observable<any> {
    const token = this.authService.getToken();
    if (!token) return throwError(() => new Error('No auth token'));
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post('http://localhost:3000/api/cart', payload, { headers });
  }

  // Pure merge: dedupe by _id and sum quantities
  mergeCarts(serverCart: CartItem[], guestCart: CartItem[]): CartItem[] {
    const map = new Map<string, CartItem>();
    [...serverCart, ...guestCart].forEach(item => {
      if (!item || !item._id) return;
      const existing = map.get(item._id);
      if (existing) existing.quantity += item.quantity;
      else map.set(item._id, { ...item });
    });
    return Array.from(map.values());
  }

  // internal: push to BehaviorSubject and storage
  private updateCartState(writeToStorage: boolean): void {
    this.cart$.next([...this.items]);
    this.total$.next(
      this.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    );
    if (writeToStorage) {
      localStorage.setItem(
        this.getCartStorageKey(),
        JSON.stringify(this.items)
      );
    }
  }

  // clear completely (invoked e.g. on logout)
  clearCart(): void {
    this.items = [];
    localStorage.removeItem(this.getCartStorageKey());
    this.updateCartState(false);
  }
}