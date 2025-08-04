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

    //useful to trigger any future logic when login state changes
    this.authService.isLoggedIn$.subscribe((isLoggedIn) => {
       if (isLoggedIn) {
        console.log('✅ User is logged in. Cart already restored via CartService.');
      } else {
        console.log('👤 Guest mode active. Using localStorage-based cart.');
      }

    });
  }  
}
