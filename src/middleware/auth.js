import { verifyToken } from '../services/jwt.service.js';
import CustomError from '../utils/custom.error.js';

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new CustomError('Authorization token required', 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    throw new CustomError('Invalid or expired token', 401);
  }
};

export default authenticate;
