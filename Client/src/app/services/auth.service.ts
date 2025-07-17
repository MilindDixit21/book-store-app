import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl ='http://localhost:3000/api/users';

  constructor(private http: HttpClient) { }

  register(user:User){
    return this.http.post<User>(`${this.apiUrl}/register`, user);
  }

  login(credentials:User){
    return this.http.post<User>(`${this.apiUrl}/login`, credentials);
  }
}
