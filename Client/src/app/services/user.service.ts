import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
 private apiUrl = 'http://localhost:3000/api/users';

  constructor(private http:HttpClient) { }

  getUsers(){
    return this.http.get<User[]>(this.apiUrl, {
      headers: {Authorization: `Bearer ${localStorage.getItem('token')}`}
    }
  );
  }

  getUserById(id:string){
    return this.http.get<User>(`${this.apiUrl}/${id}`,{
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
  }
  updateRole(id: string, role: string) {
      return this.http.put<{message:string}>(`${this.apiUrl}/${id}/role`, {role}, {
        headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
      });
  }

}
