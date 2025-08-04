import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Book } from '../models/book.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookService {
private apiBooksUrl = 'http://localhost:3000/api/books';
  constructor(private http:HttpClient) { }

  getBooks(params?: any) {
  return this.http.get<Book[]>(this.apiBooksUrl, { params });
}

createBook(formData: FormData) {
   return this.http.post(this.apiBooksUrl, formData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('auth_token')}`
    }
  });
}

updateBook(id: string, formData: FormData) {
  return this.http.put(`${this.apiBooksUrl}/${id}`, formData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('auth_token')}`
    }
  });
}

deleteBook(id: string) {
  return this.http.delete<{message:string}>(`${this.apiBooksUrl}/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('auth_token')}`
    }
  });
}

getBookById(id: string): Observable<Book> {
  const token = localStorage.getItem('auth_token');
  const userRole = localStorage.getItem('user_role');
  const headers = token
    ? new HttpHeaders({ Authorization: `Bearer ${token}` })
    : new HttpHeaders(); // still valid even without token
  const routePrefix = token && ['admin', 'editor'].includes(userRole || '')
    ? 'admin'
    : 'public';
  const url = `${this.apiBooksUrl}/${routePrefix}/${id}`;
  return this.http.get<Book>(url, {
    headers,
    responseType: 'json' // 👈 This ensures type inference aligns with `Book`
  });
}

}
