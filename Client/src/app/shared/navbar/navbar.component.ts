import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { CartService } from 'src/app/services/cart.service';
import { CartItem } from 'src/app/models/cart.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})

export class NavbarComponent implements OnInit {

  showLogin = true;
  items: CartItem[]=[];
  totalItems =0;

  ngOnInit(): void {
  this.cartService.getCart().subscribe(items => {
    this.items = items;
     this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
  })
  }

  constructor(public router: Router, private cartService: CartService, private changeDetector:ChangeDetectorRef) {
    this.router.events.subscribe(event =>{
      if(event instanceof NavigationEnd){
        this.showLogin = !this.isLoggedIn && event.urlAfterRedirects !== '/register';
      }
    });
  }
  
  get isLoggedIn(): boolean{
    return !!localStorage.getItem('auth_token');
  }

  get currentRoute(): string {
    return this.router.url;
  }
  
  get userInfo() {
  const token = localStorage.getItem('auth_token');
  if (!token) return null;
  const payload = JSON.parse(atob(token.split('.')[1]));
  return {
    username: payload.username || 'User',
    // role: payload.role || 'viewer'
    role:(payload.role || 'viewer').charAt(0).toUpperCase()+ payload.role.slice(1) // Capitalized first letter (admin >> Admin)
  };
}

  get isAdmin(): boolean {
    const token = localStorage.getItem('auth_token');
    if (!token) return false;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role === 'admin';
  }

  
  logout() {
    localStorage.removeItem('auth_token');
    this.showLogin = true;
    this.changeDetector.detectChanges();
    this.cartService.clearCart();
    this.router.navigate(['/login']);
  }

  public get showBackToBooks_old(): boolean {
  const route = this.router.url;
  return route.includes('/books/new') || route.includes('/books/') && route.includes('/edit');
}

public get showBackToBooks(): boolean {
  const route = this.router.url;

  const isEditPage = route.includes('/books/') && route.includes('/edit');
  const isNewBookPage = route.includes('/books/new');
  const isBookDetailsPage = route.startsWith('/books/public/') && route.split('/').length === 4;
  const isCartPage = route.includes('/cart');
  const isThanksPage = route.includes('/thank-you');

  return isNewBookPage || isEditPage || isBookDetailsPage || isCartPage || isThanksPage;
}


goToAccount(): void {
  this.router.navigate(['/account']);
}

goToOrders(): void {
  this.router.navigate(['/user/my-orders']);
}



}
