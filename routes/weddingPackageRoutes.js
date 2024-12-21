import express from 'express';
import {
  getAllPackages,
  createPackage,
  getPackageById,
  updatePackage,
  deletePackage,
} from '../controllers/weddingPackageController.js';
import { auth, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import Joi from 'joi';

const router = express.Router();

// Validation schema for creating and updating wedding packages
const packageSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required(),
  capacity: Joi.number().required(),
});

// Validation schema for `:id` parameter
const idSchema = Joi.object({
  id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(), // Ensure valid MongoDB ObjectId
});

// Routes for all wedding packages
router.route('/')
  .get(auth, getAllPackages) // GET all wedding packages (auth required)
  .post(auth, authorize('eventMgmtVendor'), validate(packageSchema), createPackage); // POST a new wedding package (vendors only)

// Routes for a specific wedding package by id
router.route('/:id')
  .get(auth, validate(idSchema, 'params'), getPackageById) // GET a specific wedding package by id
  .put(auth, authorize('eventMgmtVendor'), validate(idSchema, 'params'), validate(packageSchema), updatePackage) // PUT to update a wedding package
  .delete(auth, authorize('eventMgmtVendor'), validate(idSchema, 'params'), deletePackage); // DELETE a wedding package

export default router;
