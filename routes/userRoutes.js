import express from 'express';
import {
  register,
  login,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import { auth, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  contact_details: Joi.string().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const updateSchema = Joi.object({
  username: Joi.string(),
  email: Joi.string().email(),
  password: Joi.string().min(6),
  contact_details: Joi.string(),
});

// User Registration
router.post('/register', validate(registerSchema), register);

// User Login
router.post('/login', validate(loginSchema), login);

// Routes for all users
router.route('/')
  // Only admins can get all users
  .get(auth, authorize('admin'), getAllUsers);

// Routes for a specific user by id
router.route('/:id')
  // Authenticated users can get their own details; admins can get any user
  .get(auth, authorize('admin', 'user'), getUserById)
  // Authenticated users or admins can update
  .put(auth, validate(updateSchema), updateUser)
  // Only admins can delete users
  .delete(auth, authorize('admin'), deleteUser);

export default router;
