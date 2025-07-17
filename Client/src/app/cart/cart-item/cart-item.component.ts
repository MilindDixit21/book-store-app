import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CartItem } from 'src/app/models/cart.model';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-cart-item',
  templateUrl: './cart-item.component.html',
  styleUrls: ['./cart-item.component.scss']
})
export class CartItemComponent {

  @Input() item!: CartItem;
@Output() adjust = new EventEmitter<{ id: string; delta: number }>();
@Output() remove = new EventEmitter<{id:string, quantity:number}>();

constructor(private cartService: CartService){}

adjustQuantity(delta: number): void {

  if (this.item.quantity === 1 && delta === -1) {
    this.remove.emit({id:this.item._id, quantity:this.item.quantity}); // Remove item instead of adjusting
  } else {
    this.adjust.emit({ id: this.item._id, delta });
  }
}

removeItem(): void {
  console.log('removed clicked');
    this.remove.emit({id:this.item._id, quantity:this.item.quantity}); // Explicit delete from link
    
}

}
