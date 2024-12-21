import express from 'express';
import {
  getAllBookings,
  createBooking,
  getBookingById,
  updateBooking,
  deleteBooking,
} from '../controllers/bookingController.js';
import { auth, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import Joi from 'joi';

const router = express.Router();

// Validation schema for creating and updating bookings
const bookingSchema = Joi.object({
  package_id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(), // Validate MongoDB ObjectId
  booking_date: Joi.date(),
  status: Joi.string().valid('Pending', 'Confirmed', 'Cancelled'),
});

// Validation schema for `:id` parameter
const idSchema = Joi.object({
  id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(), // Validate MongoDB ObjectId
});

// Routes for all bookings
router.route('/')
  .get(auth, authorize('admin', 'user'), getAllBookings) // Only authenticated users or admins can fetch bookings
  .post(auth, authorize('user'), validate(bookingSchema), createBooking); // Only users can create bookings

// Routes for a specific booking by id
router.route('/:id')
  .get(auth, validate(idSchema, 'params'), getBookingById) // Validate :id in params and require authentication
  .put(auth, validate(idSchema, 'params'), authorize('user'), validate(bookingSchema), updateBooking) // Validate :id, request body, and restrict to users
  .delete(auth, validate(idSchema, 'params'), authorize('user'), deleteBooking); // Validate :id and restrict to users

export default router;
