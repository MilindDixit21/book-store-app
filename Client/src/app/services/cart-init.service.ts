// src/app/services/cart-init.service.ts
import { Injectable } from '@angular/core';
import { filter, switchMap, tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { AuthService } from './auth.service';
import { CartService } from './cart.service';

@Injectable({ providedIn: 'root' })
export class CartInitService {
  constructor(
    private auth: AuthService,
    private cart: CartService
  ) {
    this.auth.isLoggedIn$
      .pipe(
        filter(loggedIn => loggedIn),
        switchMap(() => this.initializeCart())
      )
      .subscribe();
  }

  private initializeCart() {
    const guestItems = this.cart.getGuestCart();
    return this.cart.getUserCartFromServer().pipe(
      tap(resp => {
        const serverItems = resp.items || [];
        const merged = this.cart.mergeCarts(serverItems, guestItems);

        this.cart.saveCartToServer({ items: merged })
          .pipe(
            tap(() => {
              localStorage.removeItem('cart_guest');
              this.cart.setCart(merged);
            }),
            catchError(() => {
              this.cart.setCart(merged);
              return of(null);
            })
          )
          .subscribe();
      }),
      catchError(() => {
        this.cart.setCart(guestItems);
        return of(null);
      })
    );
  }
}