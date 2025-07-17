import { NgModule } from '@angular/core';
import { RouterModule, Routes, CanActivate } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AuthGuard } from './guards/auth.guard';
import { UserListComponent } from './users/user-list/user-list.component';
import { UserEditComponent } from './users/user-edit/user-edit.component';
import { BookListComponent } from './books/book-list/book-list.component';
import { BookFormComponent } from './books/book-form/book-form.component';
import { CartComponent } from './cart/cart/cart.component';

const routes: Routes = [
  { path:'login', component:LoginComponent},
  { path:'register', component:RegisterComponent},
  { path:'users', component:UserListComponent, canActivate:[AuthGuard]},
  {path:'users/:id/edit', component:UserEditComponent, canActivate:[AuthGuard]},

  {path:'books', component:BookListComponent},
  { path:'', redirectTo:'/books', pathMatch:'full'},
  {path:'books/new', component:BookFormComponent, canActivate:[AuthGuard]},
  {path:'books/:id/edit', component:BookFormComponent, canActivate:[AuthGuard]},

  {path: 'cart', component:CartComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
