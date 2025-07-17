import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {


  constructor(private router: Router){}

  canActivate(): boolean {
    const token = localStorage.getItem('token');
    const role = this.decodeRole(token);

    // - Admin or Editor -
    // if (!token || !['admin', 'editor'].includes(role)) { 
    // - only Admin -
    if(!token || role !==  'admin'){
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }

  private decodeRole(token: string | null): string {
    if (!token) return '';
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role;
  }

  
}
