import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PaymentPayload } from '../models/payment.model';


@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://localhost:3000/api/payments';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Missing auth token');
    }
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  /** 💸 Submit payment for the order */
  processPayment(payload: PaymentPayload): Observable<{ message: string }> {
    const headers = this.getAuthHeaders();
    return this.http.post<{ message: string }>(`${this.apiUrl}/charge`, payload, { headers }).pipe(
      catchError(err => {
        console.error('❌ Payment failed:', err);
        return throwError(() => new Error('Payment processing failed'));
      })
    );
  }

createPayment(payload: { stripeToken : string; orderId: string; amount:number }): Observable<{ success: boolean; message: string }> {
  console.log('Creating payment with:', payload);

  const headers = this.getAuthHeaders(); 
  return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/create`,
    { 
      stripeToken: payload.stripeToken,
      orderId: payload.orderId,
      amount:payload.amount
    },
    { headers }
  );
}
// createOrder(token: string, amount: number, orderId: string, userId: string): Observable<PaymentResponse> {
//   const headers = this.getAuthHeaders();
//   const body = { token, amount, orderId, userId };
//   return this.http.post<PaymentResponse>(`${this.apiUrl}/create`, body, { headers });
// }


//   createOrder(cartItems: CartItem[], orderId: string): Observable<PaymentResponse> {
//   const headers = this.getAuthHeaders();
//   return this.http.post<PaymentResponse>(`${this.apiUrl}/create`, { cartItems, orderId }, { headers });
// }



}