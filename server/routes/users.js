import express from 'express';
const router = express.Router();
import auth from '../middleware/authMiddleware.js';
import role from '../middleware/roleMiddleware.js';
import {register, login, updateRole, getUserById, getAllUsers} from '../controllers/userController.js';

//public
router.post('/register', register);
router.post('/login', login);

router.get('/:id', auth, role('admin'), getUserById);
router.get('/', auth, role('admin'), getAllUsers);

//Admin-only
router.put('/:id/role', auth, role('admin'), updateRole);

export default router;