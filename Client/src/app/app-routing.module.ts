import { NgModule } from '@angular/core';
import { RouterModule, Routes, CanActivate } from '@angular/router';
import { LoginComponent } from 'src/app//auth/login/login.component';
import { RegisterComponent } from 'src/app//auth/register/register.component';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { UserListComponent } from 'src/app//users/user-list/user-list.component';
import { UserEditComponent } from 'src/app//users/user-edit/user-edit.component';
import { BookListComponent } from 'src/app//books/book-list/book-list.component';
import { BookFormComponent } from 'src/app//books/book-form/book-form.component';
import { CartComponent } from 'src/app//cart/cart/cart.component';
import { BookDetailsComponent } from './books/book-details/book-details.component';
import { PaymentComponent } from './payment/payment.component';
import { ThankYouComponent } from './payment/thank-you/thank-you.component';
import { MyOrdersComponent } from './my-orders/my-orders.component';

const routes: Routes = [
  { path:'login', component:LoginComponent},
  { path:'register', component:RegisterComponent},
  { path:'users', component:UserListComponent, canActivate:[AuthGuard]},
  { path:'users/:id/edit', component:UserEditComponent, canActivate:[AuthGuard]},

  {path:'books', component:BookListComponent},
  {path:'', redirectTo:'/books', pathMatch:'full'},
  {path:'books/new', component:BookFormComponent, canActivate:[AuthGuard]},
  {path:'books/:id/edit', component:BookFormComponent, canActivate:[AuthGuard]},
  {path:'books/public/:id', component:BookDetailsComponent},

  {path:'user/thank-you', component:ThankYouComponent},  

  {path: 'cart', component:CartComponent},

  {path: 'payment', component: PaymentComponent},
  {path: 'payment/create', component: PaymentComponent},

  {path: 'user/my-orders', component: MyOrdersComponent},
  {path: 'user/thank-you/:id', component:ThankYouComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
