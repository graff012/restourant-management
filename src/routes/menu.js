import express from 'express';
import {
  createMenuItem,
  getAllMenuItems,
} from '../controllers/menu.controller.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, createMenuItem);
router.get('/', getAllMenuItems);

export default router;
