import { Component, OnInit } from '@angular/core';
import { CartService } from './services/cart.service';
import { CartItem } from './models/cart.model';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(private cartService:CartService, private authService:AuthService){}

   ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe((isLoggedIn) => {
      if (isLoggedIn) {
        // ✅ Retrieve server cart once user is confirmed logged in
        this.cartService.getUserCartFromServer().subscribe({
          next:(serverCartResponse:{items?:CartItem[]}) => {
              const serverCart = serverCartResponse.items ?? [];

            // 🔄 Load cart into memory & UI without triggering sync
            this.cartService.addToCart(serverCart);

            // 🧼 Remove any leftover guest cart if still hanging around
            localStorage.removeItem('cart_guest');
          },
          error: (err) => {
            console.error('❌ Failed to restore cart from server:', err);
          }
        });
      }
    });
  }

  
}
