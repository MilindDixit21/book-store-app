import Book from '../models/bookModel.js';

// Get all books with filtering & sorting
export const getAllBooks = async (req, res) => {
  const { genre, author, sortBy } = req.query;
  const query = {};
  if (genre) query.genre = genre;
  if (author) query.author = author;

  const books = await Book.find(query).sort(sortBy ? { [sortBy]: 1 } : {});
  res.json(books);
};

// Get only published books
export const getPublishedBooks = async (req, res) => {
  const books = await Book.find({ status: 'published' });
  res.json(books);
};

// Create book (admin/editor)
export const createBook = async (req, res) => {
  const data = {
    ...req.body,
    coverImage: req.file?.path || '',
    createdBy:  req.user.id
  };
  const book = new Book(data);
  await book.save();
  res.status(201).json({ message: 'Book created' });
};

// Update book (admin/editor)
export const updateBook = async (req, res) => {
  const updates ={
    ...req.body
  };
  //handle new coverImage if uploaded
  if(req.file?.path){
    updates.coverImage = req.file.path;
  }
  const book = await Book.findByIdAndUpdate(req.params.id, updates, { new :true, runValidators:true });
  if(!book){
    return res.status(404).json({message:'Book not found'});
  }
  res.json({ message: 'Book updated', book });
};

// Delete book (admin)
export const deleteBook = async (req, res) => {
  await Book.findByIdAndDelete(req.params.id);
  res.json({ message: 'Book deleted' });
};

//getBookById
export const getBookById_old = async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ message: 'Book not found' });
  res.json(book);
};

export const getBookById = async (req, res) => {
  const { id } = req.params;
  const userRole = req.user?.role || 'guest';

  const book = await Book.findById(id);

  if (!book) return res.status(404).json({ message: 'Book not found' });

  if (userRole === 'admin' || userRole === 'editor') {
    // return res.json({ ...book.toObject(), internalNotes: book.internalNotes });
    return res.json(book);
  }

  // Strip sensitive info for guests/editors
  return res.json({
    _id:book._id,
    title: book.title,
    author: book.author,
    summary: book.summary,
    price: book.price,
    coverImage:book.coverImage
  });
};



