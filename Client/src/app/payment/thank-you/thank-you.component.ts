import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Order } from 'src/app/models/order.model';
import { AuthService } from 'src/app/services/auth.service';
import { OrderService } from 'src/app/services/order.service';

@Component({
  selector: 'app-thank-you',
  templateUrl: './thank-you.component.html',
  styleUrls: ['./thank-you.component.scss']
})
export class ThankYouComponent implements OnInit{

   orderId: string = '';
   order:Order |null = null;
   userName:string |null =null;

   constructor(private route: ActivatedRoute,
    private orderService:OrderService,
    private authService:AuthService
   ){}

   ngOnInit(): void {
    this.orderId = this.route.snapshot.queryParamMap.get('orderId') ?? '';
    if (this.orderId) {
      this.orderService.getOrderById(this.orderId).subscribe({
        next: (order) => {
          this.order = order;
        },
        error: (err) => {
          console.error('❌ Failed to fetch order:', err);
        }
      });
    }
    this.userName= this.authService.getUserName();
  }

  printInvoice(): void {
    const invoiceContent = document.getElementById('invoice-content');
    if (!invoiceContent) return;

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .invoice-box { border: 1px solid #ccc; padding: 20px; }
            .header { font-size: 24px; margin-bottom: 20px; }
            .item-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .total { font-weight: bold; margin-top: 20px; }
          </style>
        </head>
        <body>
          ${invoiceContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }
}

