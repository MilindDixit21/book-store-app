import { Injectable } from '@angular/core';
import { CartItem } from '../models/cart.model';
import { BehaviorSubject } from 'rxjs';

const CART_KEY = 'book-dashboard.cart';

@Injectable({
  providedIn: 'root'
})

//This service manages state via BehaviorSubject — so updates reflect in real time across components.

export class CartService {

  private items: CartItem[]=[];
  private cart$ = new BehaviorSubject<CartItem[]>([]);
  private total$ = new BehaviorSubject<number>(0);

  constructor() { 
    const stored = localStorage.getItem(CART_KEY);
    if(stored){
      try {
        this.items = JSON.parse(stored);
        this.updateCartState(false); //Avoid double save during load
      } catch {
        console.warn('Failed to parse stored cart. Restting');
        localStorage.removeItem(CART_KEY);
      }
    }
  }

  getCart(){
    return this.cart$.asObservable();
  }

  getTotalAmount(){
    return this.total$.asObservable();
  }

  addToCart(book:CartItem):void {
    //error handling code
    if(!book || !book._id || book.price === undefined){
      console.warn('invalid book item. Cannot add to cart', book);
      return;      
    }

    const existing = this.items.find(item => item._id === book._id);
    if(existing){
      existing.quantity+=1;
    }else{
      this.items.push({...book, quantity:1});
    }
    this.updateCartState();
  }

  removeFromCart(bookId: string, delta: number): void {
  if (!bookId || typeof delta !== 'number') {
    console.warn('🚫 Invalid parameters:', { bookId, delta });
    return;
  }

  const item = this.items.find(i => i._id === bookId);

  if (!item) {
    console.warn(`❓ Book with ID ${bookId} not found in cart.`);
    return;
  }

  if (delta >= item.quantity || delta < 0) {
    // Remove completely if delta exceeds or matches quantity, or forced removal
    this.items = this.items.filter(i => i._id !== bookId);
    console.log(`🗑️ Removed item from cart: ${bookId}`);
  } else {
    // Reduce quantity
    item.quantity -= delta;
    console.log(`🔧 Reduced quantity by ${delta} for item: ${bookId}`);
  }

  this.updateCartState();
}

  adjustQuantity(bookId:string, delta:number):void{
    const item = this.items.find(i => i._id === bookId);
    if(item){
      item.quantity = Math.max(1, item.quantity + delta);
    }
    this.updateCartState();
  }

  private updateCartState(save = true):void {
    this.cart$.next([...this.items]);
    this.total$.next(this.items.reduce((sum, item) => sum +item.price * item.quantity, 0));
    if(save){
      localStorage.setItem(CART_KEY, JSON.stringify(this.items));
    }
  }

  clearCart(): void {
  this.items = [];
  localStorage.removeItem(CART_KEY);
  this.updateCartState();
}



}
