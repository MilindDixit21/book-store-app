import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/users';

  // holds login state
  private loggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isLoggedIn$ = this.loggedInSubject.asObservable();

  constructor(private http: HttpClient) {}

  private hasToken(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  emitLogin(): void {
    this.loggedInSubject.next(true);
  }

  // if you need logout in future:
  // logout(): void {
  //   localStorage.removeItem('auth_token');
  //   localStorage.removeItem('user_session');
  //   this.loggedInSubject.next(false);
  // }

  login(credentials: { email: string; password: string }): Observable<User & { token: string }> {
    return this.http.post<User & { token: string }>(`${this.apiUrl}/login`, credentials);
  }

  register(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, user);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  getCurrentUser(): User | null {
    const raw = localStorage.getItem('user_session');
    return raw ? JSON.parse(raw) as User : null;
  }

  getUserId(): string | null {
    const user = this.getCurrentUser();
    return user?._id ?? null;
  }
  
}