import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Order } from '../models/order.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
private apiUrl = 'http://localhost:3000/api/orders';
  constructor(private http:HttpClient, private authService:AuthService) { }
  
  getOrders():Observable<Order[]>{
    return this.http.get<Order[]>(this.apiUrl, {headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`
      }}).pipe(
      map(orders => orders.map(order =>({
        ...order,
        id:order._id
      })))
    )
    }
    
  cancelOrder(orderId:string):Observable<any>{
    return this.http.post(`${this.apiUrl}/${orderId}/cancel`,{});
  }

  getOrderById(orderId: string): Observable<Order> {
  const token = this.authService.getToken(); // abstracted token retrieval
  const headers = {
    Authorization: `Bearer ${token}`
  };

  return this.http.get<Order>(`${this.apiUrl}/${orderId}`, { headers }).pipe(
    map(order => ({
      ...order,
      id: order._id
    })),
    catchError(err => {
      console.error('❌ Failed to fetch order:', err);
      return throwError(() => new Error('Could not retrieve order'));
    })
  );
}


}
