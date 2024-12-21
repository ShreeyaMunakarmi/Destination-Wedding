import express from 'express';
import {
  getAllVendors,
  createVendor,
  getVendorById,
  updateVendor,
  deleteVendor,
} from '../controllers/vendorController.js';
import { auth, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import Joi from 'joi';

const router = express.Router();

// Validation schema for creating and updating vendors
const vendorSchema = Joi.object({
  name: Joi.string().required(),
  service_type: Joi.string().required(),
  contact_details: Joi.string().required(),
});

// Validation schema for `:id` parameter
const idSchema = Joi.object({
  id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(), // Validate MongoDB ObjectId
});

// Routes for all vendors
router.route('/')
  .get(auth, getAllVendors) // GET all vendors (auth required)
  .post(auth, authorize('admin', 'eventMgmtVendor'), validate(vendorSchema), createVendor); // POST a new vendor (admins and eventMgmtVendors only)

// Routes for a specific vendor by id
router.route('/:id')
  .get(auth, validate(idSchema, 'params'), getVendorById) // GET a specific vendor by id (auth required)
  .put(auth, validate(idSchema, 'params'), authorize('admin', 'eventMgmtVendor'), validate(vendorSchema), updateVendor) // PUT to update a vendor (admins and eventMgmtVendors only)
  .delete(auth, validate(idSchema, 'params'), authorize('admin', 'eventMgmtVendor'), deleteVendor); // DELETE a specific vendor (admins and eventMgmtVendors only)

export default router;
