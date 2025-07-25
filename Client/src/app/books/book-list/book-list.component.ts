import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Book } from 'src/app/models/book.model';
import { BookService } from 'src/app/services/book.service';
import { CartService } from 'src/app/services/cart.service';
import { ToastService } from 'src/app/services/toast.service';
import { BookDetailsDialogComponent } from 'src/app/shared/book-details-dialog/book-details-dialog.component';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';



@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.scss']
})
export class BookListComponent implements OnInit {

  displayedColumns: string[]=[];
  books: Book[] = [];

constructor( 
  private bookService:BookService,
  private cartServivce:CartService, 
  private dialog:MatDialog,
  private toastService:ToastService
){}

filters = { genre: '', author: '', sortBy: '' };
role = ''; // from decoded JWT

ngOnInit() {
  const token = localStorage.getItem('auth_token');
  this.role = token ? JSON.parse(atob(token.split('.')[1])).role : 'guest';

  this.displayedColumns =['title', 'coverImage', 'summary','author','status'];
  if(this.role === 'admin' || this.role === 'editor'){
    this.displayedColumns.push('actions');
  }

  this.loadBooks();
}

loadBooks() {
  this.bookService.getBooks(this.filters).subscribe((res) => {
    this.books = res;

    // Extract clean genre list for autocomplete
    this.genreList = [...new Set(res.map(book => book.genre?.trim()).filter(Boolean))].sort();

    // Optionally initialize filteredGenres with full list
    this.filteredGenres = [...this.genreList];

  });
}

coverError(event: Event) {
  (event.target as HTMLImageElement).src = 'assets/images/placeholder.jpg';
}

deleteBook(id?: string): void {
  if(!id) return;
  const dialogRef = this.dialog.open(ConfirmDialogComponent);

  dialogRef.afterClosed().subscribe(confirmed => {
  if (!confirmed) return;

  this.bookService.deleteBook(id).subscribe({
    next: (res) => {
      console.log(res.message);
      // Refresh the list after deletion
      this.loadBooks();
    },
    error: (err) => {
      console.error('❌ Error deleting book:', err);
      alert('Failed to delete book');
    }
  });

  });

}

openBookDetails(book: Book): void {
  console.log(`🔍 Opening details for: ${book.title}`);
  this.dialog.open(BookDetailsDialogComponent, {
    data: {
      title: book.title,
      summary: book.summary,
      coverImage: book.coverImage
    },
    width: '600px'
  });
}

getSnippet(text: string | undefined, limit: number = 65): string {
  if (!text) return '';
  const words = text.split(' ');
  let snippet = '';
  for (const word of words) {
    if ((snippet + word).length > limit) break;
    snippet += word + ' ';
  }
  return snippet.trim() + '...';
}

isCardView = false;
toggleView(): void {
  this.isCardView = !this.isCardView;
}

genreList: string[] = ['Fiction', 'Fantasy', 'Science Fiction', 'Mystery', 'Biography', 'History', 'Romance', 'Thriller'];
filteredGenres: string[] = [...this.genreList];


filterGenres(input: string): void {
  const lowerInput = input?.toLowerCase() || '';

  if (lowerInput === '') {
    // Reset: show all genres and load all books
    this.filteredGenres = [...this.genreList];
    this.filters.genre = '';

    this.loadBooks(); // Optional: refresh the book list
    return;
  }

  // Otherwise, filter genre suggestions
  this.filteredGenres = this.genreList.filter(
    genre => genre.toLowerCase().includes(lowerInput)
  );
}

onGenreBlur(): void {
  if (!this.filters.genre) {
    this.filteredGenres = [...this.genreList];
    this.loadBooks();
  }
}

addToCart(book: Book): void {
  if(!book || !book._id || book.price === undefined){
    console.warn('cannot add this book to cart', book);
    this.toastService.error('cannot add this book to cart');
    return;
  }
  const cartItem ={
    _id:book._id,
    title:book.title,
    author:book.author,
    summary:book.summary,
    price: book.price,
    quantity:1,
    coverImage: book.coverImage
  };

  this.cartServivce.addToCart(cartItem);
  this.toastService.success('Book added to cart!');
   console.log(`🛒 Book added to cart: ${book.title}`);
}


}
