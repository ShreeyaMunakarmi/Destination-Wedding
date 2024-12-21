import express from 'express';
import {
  createAdmin,
  getAdminById,
  updateAdmin,
  deleteAdmin,
} from '../controllers/adminController.js';
import { auth, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import Joi from 'joi';

const router = express.Router();

// Validation schema for creating and updating admins
const adminSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  contact_details: Joi.string().required(),
});

// Validation schema for `:id` parameter
const idSchema = Joi.object({
  id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(), // Validate MongoDB ObjectId
});

// Routes for all admins
router.route('/')
  .post(auth, authorize('admin'), validate(adminSchema), createAdmin); // Create a new admin (admin only)

// Routes for a specific admin by id
router.route('/:id')
  .get(auth, authorize('admin'), validate(idSchema, 'params'), getAdminById) // GET a specific admin by id (admin only)
  .put(auth, authorize('admin'), validate(idSchema, 'params'), validate(adminSchema), updateAdmin) // PUT to update an admin by id (admin only)
  .delete(auth, authorize('admin'), validate(idSchema, 'params'), deleteAdmin); // DELETE a specific admin by id (admin only)

export default router;

