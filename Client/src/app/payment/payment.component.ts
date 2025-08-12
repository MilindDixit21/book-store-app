import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CartItem } from 'src/app/models/cart.model';
import { CartService } from 'src/app/services/cart.service';
import { PaymentService } from 'src/app/services/payment.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
})
export class PaymentComponent implements OnInit {
  cartItems: CartItem[] = [];
  totalAmount: number = 0;
  estimatedAmount: number = 0;
  orderId: string = '';
  userId: string = '';

  months: string[] = [
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    '11',
    '12',
  ];

  years: string[] = [];

  formData = {
    firstName: '',
    lastName: '',
    cardNumber: '',
    cvv: '',
    validMonth: '',
    validYear: '',
    token: '', // ✅ Added token field
  };

  constructor(
    private paymentService: PaymentService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private router: Router
  ) {}
  isUserIdReady = false;

  ngOnInit(): void {
    this.cartItems = this.cartService.getCheckoutCart();
    this.totalAmount = this.cartService.getTotalAmountValue();
    this.estimatedAmount = this.cartService.getTotalAmountValue();
    this.orderId = this.route.snapshot.queryParamMap.get('orderId') ?? '';
    setTimeout(() => {
      const token = localStorage.getItem('auth_token');
      const payload = token ? JSON.parse(atob(token.split('.')[1])) : null;
      const userId = payload?._id; // ✅ This matches the token
      this.userId = userId;
      this.isUserIdReady = !!this.userId;
    }, 5000);

    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 10 }, (_, i) =>
      (currentYear + i).toString()
    );

    // 👇 Inject Stripe test token for now, until card tokenization is implemented
    this.formData.token = 'tok_visa'; // Replace with dynamic token if using Stripe Elements
  }

cancel(): void {
  this.cartService.refreshCartFromStorage();
  this.router.navigate(['/cart']);
}

  submitPayment(form: NgForm): void {
    console.log(this.isUserIdReady);
    console.log(form.valid);
    console.log(this.cartItems);
    console.log(this.orderId);
    if (
      !form.valid ||
      !this.isUserIdReady ||
      this.cartItems.length === 0 ||
      !this.orderId
    ) {
      console.warn('Payment form is invalid or missing data');
      return;
    }
    const stripeToken = this.formData.token;
    // 🔗 Unified payment creation call
    this.paymentService
      .createPayment({
        stripeToken,
        orderId: this.orderId,
        amount: this.estimatedAmount,
      })
      .subscribe({
        next: (res) => {
          console.log('✅ Payment successful:', res);
          // Clear cart after successful payment
        this.cartService.clearCart();
        const orderId = this.orderId;
          this.router.navigate(['/user/thank-you'],{
            queryParams: { orderId},
          });
        },
        error: (err) => {
          console.error('💥 Payment failed:', err);
        },
      });
  }
}
