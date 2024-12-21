import dotenv from 'dotenv';
import sanitize from 'mongo-sanitize';
import WeddingPackage from '../models/weddingPackage.js';
import EventMgmtVendor from '../models/eventMgmtVendor.js';
import logger from '../utils/logger.js'; // Logging utility

dotenv.config();

// Get all packages
export const getAllPackages = async (req, res, next) => {
  try {
    const packages = await WeddingPackage.find();
    logger.info('Fetched all wedding packages successfully.');
    res.status(200).json(packages);
  } catch (error) {
    logger.error('Error fetching wedding packages', { error: error.message });
    next({ statusCode: 500, message: 'Failed to fetch packages.', error });
  }
};

// Get a package by ID
export const getPackageById = async (req, res, next) => {
  try {
    const packageData = await WeddingPackage.findById(req.params.id);
    if (!packageData) {
      return next({ statusCode: 404, message: 'Package not found.', packageId: req.params.id });
    }
    logger.info(`Fetched package ${req.params.id} successfully.`);
    res.status(200).json(packageData);
  } catch (error) {
    logger.error(`Error fetching package ${req.params.id}`, { error: error.message });
    next({ statusCode: 500, message: 'Failed to fetch package.', error });
  }
};

// Create a new package
export const createPackage = async (req, res, next) => {
  try {
    if (req.user.role !== 'eventMgmtVendor') {
      return next({ statusCode: 403, message: 'Access denied. Vendors only.' });
    }

    const { name, description, price, capacity } = sanitize(req.body);

    const newPackage = await WeddingPackage.create({
      name,
      description,
      price,
      capacity,
      createdBy: req.user.id,
    });

    const eventMgmtVendor = await EventMgmtVendor.findOne({ user_id: req.user.id });
    if (!eventMgmtVendor) {
      return next({ statusCode: 404, message: 'Event Management Vendor not found.', userId: req.user.id });
    }

    eventMgmtVendor.wedding_packages.push(newPackage._id);
    await eventMgmtVendor.save();

    logger.info(`Wedding package ${newPackage._id} created by user ${req.user.id}.`);
    res.status(201).json({
      message: 'Wedding package created successfully!',
      package: newPackage,
    });
  } catch (error) {
    logger.error('Error creating wedding package', { error: error.message });
    next({ statusCode: 400, message: 'Failed to create package.', error });
  }
};

// Update a package
export const updatePackage = async (req, res, next) => {
  try {
    const packageData = await WeddingPackage.findById(req.params.id);
    if (!packageData) {
      return next({ statusCode: 404, message: 'Package not found.', packageId: req.params.id });
    }

    if (packageData.createdBy.toString() !== req.user.id) {
      return next({ statusCode: 403, message: 'Access denied. Only the creator can update.' });
    }

    const sanitizedBody = sanitize(req.body);

    const updatedPackage = await WeddingPackage.findByIdAndUpdate(req.params.id, sanitizedBody, {
      new: true,
      runValidators: true,
    });

    logger.info(`Wedding package ${req.params.id} updated by user ${req.user.id}.`);
    res.status(200).json({
      message: 'Wedding package updated successfully!',
      package: updatedPackage,
    });
  } catch (error) {
    logger.error(`Error updating wedding package ${req.params.id}`, { error: error.message });
    next({ statusCode: 400, message: 'Failed to update package.', error });
  }
};

// Delete a package
export const deletePackage = async (req, res, next) => {
  try {
    const packageData = await WeddingPackage.findById(req.params.id);
    if (!packageData) {
      return next({ statusCode: 404, message: 'Package not found.', packageId: req.params.id });
    }

    if (packageData.createdBy.toString() !== req.user.id) {
      return next({ statusCode: 403, message: 'Access denied. Only the creator can delete.' });
    }

    await WeddingPackage.findByIdAndDelete(req.params.id);

    const eventMgmtVendor = await EventMgmtVendor.findOne({ user_id: req.user.id });
    if (eventMgmtVendor) {
      eventMgmtVendor.wedding_packages = eventMgmtVendor.wedding_packages.filter(
        (pkgId) => pkgId.toString() !== req.params.id
      );
      await eventMgmtVendor.save();
    }

    logger.info(`Wedding package ${req.params.id} deleted by user ${req.user.id}.`);
    res.status(200).json({ message: 'Wedding package deleted successfully!' });
  } catch (error) {
    logger.error(`Error deleting wedding package ${req.params.id}`, { error: error.message });
    next({ statusCode: 500, message: 'Failed to delete package.', error });
  }
};
