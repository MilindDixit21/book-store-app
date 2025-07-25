import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router){}

  canActivate(): boolean {
    const token = localStorage.getItem('auth_token');
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
    console.log('payload',payload.role);    
    return payload.role;
  }

  
}
