import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BookService } from 'src/app/services/book.service';

@Component({
  selector: 'app-book-form',
  templateUrl: './book-form.component.html',
  styleUrls: ['./book-form.component.scss'],
})
export class BookFormComponent implements OnInit {
  previewUrl: string | ArrayBuffer | null = null;

  bookForm!: FormGroup;
  id!: string;
  isEditMode = false;
  statusOptions = ['draft', 'published'];
  selectedFile?: File;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public router: Router,
    private bookService: BookService
  ) {}

  ngOnInit(): void { 
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    this.isEditMode = !!this.id;

    this.bookForm = this.fb.group({
      title: ['', Validators.required],
      price: ['', Validators.required],
      author: ['', Validators.required],
      genre: ['', Validators.required],
      publishDate: [''],
      ISBN: [''],
      summary: ['', Validators.maxLength(500)],
      status: ['draft', Validators.required],
    });

    if (this.isEditMode) {
      this.bookService.getBookById(this.id).subscribe((book) => {
        this.bookForm.patchValue(book);
      });
    }
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    this.selectedFile = file;
    // this.selectedFile = event.target.files[0];

    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result;
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    const formData = new FormData();
    Object.entries(this.bookForm.value).forEach(([key, value]) => {
      // formData.append(key, String(value));
      //---If publishDate or other fields may be null/undefined, you could skip them or default---
      if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });
    if (this.selectedFile) {
      formData.append('coverImage', this.selectedFile);
    }

    const request = this.isEditMode
      ? this.bookService.updateBook(this.id, formData)
      : this.bookService.createBook(formData);

    request.subscribe({
      next: () => this.router.navigate(['/books']),
      error: (err) => console.error('❌ Submission error:', err),
    });
  }
}
