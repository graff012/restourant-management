import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import CustomError from '../utils/custom.error.js';
import { generateToken } from './jwt.service.js';

const register = async (fullName, email, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const query = `
    INSERT INTO users (full_name, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, full_name, email, role, created_at
  `;
  try {
    const { rows } = await pool.query(query, [
      fullName,
      email,
      hashedPassword,
      'waiter',
    ]);
    return rows[0];
  } catch (error) {
    if (error.code === '23505') {
      throw new CustomError('Email already exists', 400);
    }
    throw new CustomError('Failed to register user', 500);
  }
};

const login = async (email, password) => {
  const query = `
    SELECT * FROM users WHERE email = $1
  `;
  const { rows } = await pool.query(query, [email]);
  const user = rows[0];

  if (!user) {
    throw new CustomError('Invalid credentials', 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new CustomError('Invalid credentials', 401);
  }

  const token = generateToken(user);
  return {
    token,
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
    },
  };
};

export { register, login };
