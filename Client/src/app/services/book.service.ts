import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Book } from '../models/book.model';

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
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
}

updateBook(id: string, formData: FormData) {
  return this.http.put(`${this.apiBooksUrl}/${id}`, formData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
}

deleteBook(id: string) {
  return this.http.delete<{message:string}>(`${this.apiBooksUrl}/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
}

getBookById(id: string) {
  const token = localStorage.getItem('token');
  const headers = {
    Authorization: `Bearer ${token}`
  };
  return this.http.get<Book>(`${this.apiBooksUrl}/${id}`, { headers });
}


}
