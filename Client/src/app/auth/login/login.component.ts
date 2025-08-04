import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { CartService } from 'src/app/services/cart.service';
import { CartItem } from 'src/app/models/cart.model.js';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

   credentials = {
    email: '',
    password: ''
  };

  loading = false;
  errorMessage:string ='';

   constructor(private authService: AuthService, private cartService:CartService, private router:Router) {}

  submit() :void{
    this.loading =true;
    this.errorMessage='';
    this.authService.login(this.credentials).subscribe({
      next: (res: any) => {
        this.authService.emitLogin();
        localStorage.setItem('auth_token', res.token); // save JWT
        localStorage.setItem('user_session', JSON.stringify(res)); //  Save full user info
        // alert('Login successful');

        // Emit login state reactively
        this.authService.emitLogin(); 

        // Load guest cart from localStorage
        let guestCart:CartItem[]=[];
        try {
          const raw = localStorage.getItem('cart_guest');
          guestCart = raw ? JSON.parse(raw):[];
        } catch (error) {
          console.warn('Guest cart parsing failed:', error);
        }
        // get user's server cart
        this.cartService.getUserCartFromServer().subscribe({
          next:(serverCartResponse:{items?:CartItem[]}) => {
              const serverCart = serverCartResponse.items ?? [];
console.log('Login component:serverCart: ', serverCart);

              //Merge guest and server cart
              const merged = this.cartService.mergeCarts(serverCart, guestCart);
              console.log('login component:merged', merged);
              console.log('📦 Final cart payload:', merged);

              //sync final cart to MongoDB
              this.cartService.saveCartToServer({items:merged}).subscribe({
                next:()=>{
                  console.log("login component: reached here");
                  
                   // Clear guest cart (already merged)
                  localStorage.removeItem('cart_guest');
                  
                  // Push merged cart locally so UI updates
                  this.cartService.addToCart(merged); 

                   // Load latest cart from MongoDB and hydrate local state
                  this.cartService.loadServerCartToLocal();
                  
                  // Continue to next view
                  this.router.navigate(['/books']);
                },
                 error:(err) =>{
              console.error('Sync failed:', err);
              this.cartService.addToCart(merged); //fallback local load
              this.router.navigate(['/books']); // continue even if fetch fails
            }
              });
            },
            error:(err) =>{
              console.error('Failed to fetch server cart:', err);
              this.router.navigate(['/books']); // continue even if fetch fails
            }
        }); 
      },
      error: (err) =>{
        console.error('Login failed:', err);
        this.errorMessage = err?.error?.message || 'Invalid email or password';
        this.loading = false;        
      }
    });
  }
}
