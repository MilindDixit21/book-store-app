import express from 'express';
const router = express.Router();
import auth from '../middleware/authMiddleware.js';
import role from '../middleware/roleMiddleware.js';
import upload from '../middleware/upload.js';
import {getAllBooks, getPublishedBooks, createBook, updateBook, deleteBook, getBookById} from '../controllers/bookController.js';

//public
router.get('/', getAllBooks);
router.get('/published', getPublishedBooks);


//protected: create, edit,delete
// router.post('/', auth, role('admin','editor'), upload.single('coverImage'), createBook);
router.post('/', auth, role('admin','editor'), upload.single('coverImage'), createBook);
router.put('/:id', auth, role('admin','editor'), upload.single('coverImage'), updateBook);
router.delete('/:id', auth, role('admin'), deleteBook);
router.get('/:id', auth, role('admin', 'editor'), getBookById);

export default router;
