import express from 'express';
import {
  createOrder,
  updateOrderStatus,
} from '../controllers/orders.controllers.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, createOrder);
router.patch('/:id/status', authenticate, updateOrderStatus);

export default router;
