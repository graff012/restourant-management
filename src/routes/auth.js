import express from 'express';
import { register, login } from '../services/auth.service.js';
import CustomError from '../utils/custom.error.js';

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      throw new CustomError('Full name, email, and password are required', 400);
    }
    const user = await register(fullName, email, password);
    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new CustomError('Email and password are required', 400);
    }
    const result = await login(email, password);
    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
