import express from 'express';
import {createPayment} from '../controllers/paymentController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/payments/charge
router.post('/create', authMiddleware, createPayment);

export default router;
