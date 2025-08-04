import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Book } from 'src/app/models/book.model';
import { CartItem } from 'src/app/models/cart.model';
import { BookService } from 'src/app/services/book.service';
import { CartService } from 'src/app/services/cart.service';
import { ToastService } from 'src/app/services/toast.service';
import { BookDetailsDialogComponent } from 'src/app/shared/book-details-dialog/book-details-dialog.component';

@Component({
  selector: 'app-book-details',
  templateUrl: './book-details.component.html',
  styleUrls: ['./book-details.component.scss']
})
export class BookDetailsComponent implements OnInit {

  book!: Book;
  store:boolean = false;

  constructor(
    private route: ActivatedRoute,
    private bookService: BookService,
    private cartService: CartService,
    private toastService: ToastService,
    private dialog:MatDialog
  ) {}

  ngOnInit(): void {
    const bookId = this.route.snapshot.paramMap.get('id');
    console.log('book id: ',bookId);
    
    if (bookId) {
      this.bookService.getBookById(bookId).subscribe({
        next: (book) => {
           console.log('📘 Book loaded:', book);
          this.book = book;
        },
        error: (err) => console.error('❌ Error loading book:', err)
      });
    }
  }

  addToCart(): void {
        
    if (!this.book || !this.book._id || this.book.price === undefined) {
      console.warn('⚠️ Book not ready for cart:', this.book);
      this.toastService.error('Book information is incomplete.');
      return;
    }

    const cartItem: CartItem = {
      _id: this.book._id,
      title: this.book.title,
      author: this.book.author,
      summary: this.book.summary,
      price: this.book.price,
      quantity: 1,
      coverImage: this.book.coverImage
    };

    this.cartService.addToCart(cartItem);
    this.toastService.success('Book added to cart!');
    console.log(`🛒 Cart item from details added: ${this.book.title}`);
  }

  findStore(store=false):boolean{
    return store;
  }

  openBookDetails(book: Book): void {
    console.log(`🔍 Opening details for: ${book.title}`);
    this.dialog.open(BookDetailsDialogComponent, {
      data: {
        // title: book.title,
        // summary: book.summary,
        coverImage: book.coverImage
      },
      width: '500px'
    });
  }
}