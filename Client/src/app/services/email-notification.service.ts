import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmailNotificationService {

  private apiUrl = 'http://localhost:3000/api/notifications';

  constructor(private http: HttpClient) { }


  createNotification(username:string, bookTitle:string,bookId:string, email:string):Observable<any>{
    return this.http.post(`${this.apiUrl}/create`,{username, bookTitle,bookId,email});
  }
}
