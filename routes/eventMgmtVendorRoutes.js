import express from 'express';
import {
  getAllEventMgmtVendors,
  createEventMgmtVendor,
  getEventMgmtVendorById,
  updateEventMgmtVendor,
  deleteEventMgmtVendor,
} from '../controllers/eventMgmtVendorController.js';
import { auth, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import Joi from 'joi';

const router = express.Router();

// Validation schema for creating and updating event management vendors
const eventMgmtVendorSchema = Joi.object({
  user_id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(), // Validate MongoDB ObjectId
  vendor_id: Joi.string().regex(/^[0-9a-fA-F]{24}$/), // Validate MongoDB ObjectId (optional)
});

// Validation schema for `:id` parameter
const idSchema = Joi.object({
  id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(), // Validate MongoDB ObjectId
});

// Routes for all event management vendors
router.route('/')
  .get(auth, authorize('admin'), getAllEventMgmtVendors) // GET all event management vendors (admin only)
  .post(auth, authorize('admin'), validate(eventMgmtVendorSchema), createEventMgmtVendor); // POST a new event management vendor (admin only)

// Routes for a specific event management vendor by id
router.route('/:id')
  .get(auth, authorize('admin'), validate(idSchema, 'params'), getEventMgmtVendorById) // GET a specific event management vendor (admin only)
  .put(auth, authorize('admin'), validate(idSchema, 'params'), validate(eventMgmtVendorSchema), updateEventMgmtVendor) // PUT to update an event management vendor (admin only)
  .delete(auth, authorize('admin'), validate(idSchema, 'params'), deleteEventMgmtVendor); // DELETE a specific event management vendor (admin only)

export default router;

