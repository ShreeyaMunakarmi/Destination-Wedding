import express from 'express';
import {
  getAllVenues,
  createVenue,
  getVenueById,
  updateVenue,
  deleteVenue,
} from '../controllers/venueController.js';
import { auth, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import Joi from 'joi';

const router = express.Router();

// Validation schema for creating and updating venues
const venueSchema = Joi.object({
  name: Joi.string().required(),
  location: Joi.string().required(),
  capacity: Joi.number().min(1).required(),
  price: Joi.number().min(0).required(),
});

// Validation schema for `:id` parameter
const idSchema = Joi.object({
  id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(), // Validate MongoDB ObjectId
});

// Routes for all venues
router.route('/')
  .get(auth, getAllVenues) // GET all venues (auth required)
  .post(auth, authorize('eventMgmtVendor'), validate(venueSchema), createVenue); // POST a new venue (vendors only)

// Routes for a specific venue by id
router.route('/:id')
  .get(auth, validate(idSchema, 'params'), getVenueById) // GET a specific venue by id (auth required)
  .put(auth, validate(idSchema, 'params'), authorize('eventMgmtVendor'), validate(venueSchema), updateVenue) // PUT to update a venue (vendors only)
  .delete(auth, validate(idSchema, 'params'), authorize('eventMgmtVendor'), deleteVenue); // DELETE a specific venue (vendors only)

export default router;
