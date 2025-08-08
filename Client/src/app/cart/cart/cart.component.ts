import { Component, OnInit } from '@angular/core';
import { CartItem } from 'src/app/models/cart.model';
import { CartService } from '../../services/cart.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  totalItems = 0;
  totalAmount = 0;
  subtotal = 0;
  shipping = 5.99;
  discount = 0;
  tax = 0;
  estimatedTotal = 0;

  constructor(
    private cartService: CartService,
    private http: HttpClient,
    private router: Router,
    private toastServivce: ToastService
  ) {}

  ngOnInit(): void {
    this.cartService.getCart().subscribe((items) => {
      this.cartItems = items;
      this.updateTotals(); // Recalculate after cart updates
      this.updateItemCount();
    });
  }

  public get isCartEmpty(): boolean {
    return this.cartItems?.length === 0;
  }

  updateItemCount(): void {
    this.totalItems = this.cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
  }

  updateQuantity(event: { id: string; delta: number }): void {
    this.cartService.adjustQuantity(event.id, event.delta);
  }

  removeItem(event: { id: string; quantity: number }): void {
    const item = this.cartItems.find((i) => i._id === event.id);
    if (!item) {
      console.warn('item not found for removal:', event.id);
      return;
    }
    // console.log('remove item > event:id :', event.id);
    // console.log('remove item > event:quantity :', event.quantity);
    this.cartService.removeFromCart(event.id, event.quantity);
  }

  updateTotals(): void {
    this.subtotal = this.cartItems.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );
    this.tax = +(this.subtotal * 0.07).toFixed(2);
    this.estimatedTotal = +(
      this.subtotal +
      this.shipping +
      this.tax -
      this.discount
    ).toFixed(2);
  }

  checkoutCart(): void {
    this.cartService.checkoutCart().subscribe({
      next: (orderId: string) => {
        console.log('Order placed, ID:', orderId);
        this.router.navigate(['/payment'], {
          queryParams: { orderId },
        });
      },
      error: (err: any) => {
        console.error('Checkout failed:', err.message || err);
      },
    });
  }
}
