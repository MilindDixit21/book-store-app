import { Component, OnInit } from '@angular/core';
import { OrderService } from '../services/order.service';
import { Order } from '../models/order.model';

@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.scss']
})
export class MyOrdersComponent implements OnInit {

  orders:Order[] =[];
  constructor(private orderService:OrderService){}

  ngOnInit(): void {
      this.getOrders();
  }

  getOrders():void{
    this.orderService.getOrders().subscribe(data =>{
      this.orders = data;
      console.log(this.orders);
      
    })
  }
  
  isCancellable(order:Order):boolean{
    const now = new Date();
    return new Date(order.cancellableUntil) > now;
  }

  cancel(order:Order):void{
    if(!confirm(`Cancel order #${order._id}?`)) return;

    this.orderService.cancelOrder(order._id).subscribe(()=>{
      order.status ='cancelled'
    });
  }

}

