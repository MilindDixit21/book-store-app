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
  public userId$ = new BehaviorSubject<string | null>(null);


  constructor(private http: HttpClient) {}

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  Old_setUserIdFromToken(): void {    
  const token = localStorage.getItem('auth_token');
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null;
  this.userId$.next(payload?._id ?? null);
}

setUserIdFromToken(): void {
  const token = localStorage.getItem('auth_token');
  try {
    const payload = token ? JSON.parse(atob(token.split('.')[1])) : null;
    const userId = payload?._id ?? this.getUserId(); // fallback to session
    this.userId$.next(userId);
  } catch (err) {
    console.warn('Invalid token format:', err);
    this.userId$.next(this.getUserId()); // fallback
  }
}


  getUserIdObservable(): Observable<string | null> {
  return this.userId$.asObservable();
  }


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

getCurrentUser(): User | null {
  const raw = localStorage.getItem('user_session');
  try {
    const session = raw ? JSON.parse(raw) : null;
    // If session has email, assume it's already decoded
    if (session?.email) return session as User;
    // If session already has a name, return it
     if (session?.username) return session.username;
    // Otherwise decode the token
    const token = session?.token;
    if (!token) return null;
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    // Merge decoded payload with token
    const enrichedUser = { ...decoded, token };
    localStorage.setItem('user_session', JSON.stringify(enrichedUser));
    return enrichedUser as User;
  } catch (err) {
    console.error('Failed to parse or decode user_session:', err);
    return null;
  }
}

  getUserId(): string | null {
    const user = this.getCurrentUser();   
    return user?._id ?? null;
  }

  getUserName(): string | null {
    const user = this.getCurrentUser();   
    return user?.username ?? null;
  }

  getUserEmail(): string | null {
    const user = this.getCurrentUser();
    return user?.email ?? null;
  }
  
}