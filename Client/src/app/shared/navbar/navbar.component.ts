import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})

export class NavbarComponent {

  showLogin = true;

  get isLoggedIn(): boolean{
    return !!localStorage.getItem('token');
  }

  get currentRoute(): string {
    return this.router.url;
  }

  get userInfo() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  const payload = JSON.parse(atob(token.split('.')[1]));
  return {
    username: payload.username || 'User',
    // role: payload.role || 'viewer'
    role:(payload.role || 'viewer').charAt(0).toUpperCase()+ payload.role.slice(1) // Capitalized first letter (admin >> Admin)
  };
}

  get isAdmin(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role === 'admin';
  }

  constructor(public router: Router, private changeDetector:ChangeDetectorRef) {
    this.router.events.subscribe(event =>{
      if(event instanceof NavigationEnd){
        this.showLogin = !this.isLoggedIn && event.urlAfterRedirects !== '/register';
      }
    });
  }

  logout() {
    localStorage.removeItem('token');
    this.showLogin = true;
    this.changeDetector.detectChanges();
    this.router.navigate(['/login']);
  }

  public get showBackToBooks(): boolean {
  const route = this.router.url;
  return route.includes('/books/new') || route.includes('/books/') && route.includes('/edit');
}


}
