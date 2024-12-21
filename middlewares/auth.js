import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const { JWT_SECRET } = process.env;

// Middleware for authenticating users via JWT
export const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return next({ statusCode: 401, message: 'Access denied. No token provided.' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach decoded user info to the request object
    next();
  } catch (err) {
    return next({ statusCode: 403, message: 'Invalid token.' });
  }
};

// Middleware for role-based authorization
export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next({ statusCode: 403, message: 'Access denied. Insufficient permissions.' });
  }
  next();
};
