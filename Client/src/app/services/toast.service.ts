import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private snackbar:MatSnackBar) { }

  show(message:string, action:string ='Close', duration:number =3000):void{
    this.snackbar.open(message, action,{duration, horizontalPosition:'center',verticalPosition:'top', panelClass: ['custom-snackbar']});
  }
  success(message: string): void {
    this.show(`✅ ${message}`);
  }

  error(message: string): void {
    this.show(`❌ ${message}`, 'Dismiss', 3000);
  }

  info(message: string): void {
    this.show(`ℹ️ ${message}`);
  }

}
