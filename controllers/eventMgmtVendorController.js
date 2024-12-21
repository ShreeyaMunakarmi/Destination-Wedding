import sanitize from 'mongo-sanitize';
import EventMgmtVendor from '../models/eventMgmtVendor.js';
import User from '../models/user.js'; // Ensure User model is imported
import logger from '../utils/logger.js'; // Import logger for consistent logging

// Get all Event Management Vendors
export const getAllEventMgmtVendors = async (req, res, next) => {
  try {
    const vendors = await EventMgmtVendor.find()
      .populate('user_id', 'username email') // Populate user details
      .populate('vendor_id', 'name service_type') // Populate vendor details
      .populate('wedding_packages', 'name price') // Populate wedding packages
      .populate('venues', 'name location capacity'); // Populate venues

    logger.info('Fetched all Event Management Vendors successfully.');
    res.status(200).json(vendors);
  } catch (error) {
    logger.error('Error fetching Event Management Vendors', { error: error.message });
    next({ statusCode: 500, message: 'Failed to fetch Event Management Vendors.', error });
  }
};

// Get an Event Management Vendor by ID
export const getEventMgmtVendorById = async (req, res, next) => {
  try {
    const vendor = await EventMgmtVendor.findById(req.params.id)
      .populate('user_id', 'username email')
      .populate('vendor_id', 'name service_type')
      .populate('wedding_packages', 'name price')
      .populate('venues', 'name location capacity');

    if (!vendor) {
      return next({ statusCode: 404, message: 'Event Management Vendor not found.', vendorId: req.params.id });
    }

    logger.info(`Fetched Event Management Vendor ${req.params.id} successfully.`);
    res.status(200).json(vendor);
  } catch (error) {
    logger.error(`Error fetching Event Management Vendor ${req.params.id}`, { error: error.message });
    next({ statusCode: 500, message: 'Failed to fetch Event Management Vendor.', error });
  }
};

// Create a new Event Management Vendor
export const createEventMgmtVendor = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return next({ statusCode: 403, message: 'Access denied. Only admins can create Event Management Vendors.' });
    }

    const { user_id, vendor_id } = sanitize(req.body);

    // Check if the user exists
    const user = await User.findById(user_id);
    if (!user) {
      return next({ statusCode: 404, message: 'User not found.', userId: user_id });
    }

    // Check if the user is already an Event Management Vendor
    if (user.role === 'eventMgmtVendor') {
      return next({ statusCode: 400, message: 'User is already an Event Management Vendor.' });
    }

    // Create the new Event Management Vendor
    const newVendor = await EventMgmtVendor.create({
      user_id,
      vendor_id,
    });

    // Update the user's role to 'eventMgmtVendor'
    user.role = 'eventMgmtVendor';
    await user.save();

    logger.info(`Event Management Vendor ${newVendor._id} created by admin ${req.user.id}.`);
    res.status(201).json({
      message: 'Event Management Vendor created successfully!',
      vendor: newVendor,
    });
  } catch (error) {
    logger.error('Error creating Event Management Vendor', { error: error.message });
    next({ statusCode: 400, message: 'Failed to create Event Management Vendor.', error });
  }
};

// Update an Event Management Vendor
export const updateEventMgmtVendor = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return next({ statusCode: 403, message: 'Access denied. Only admins can update Event Management Vendors.' });
    }

    const vendor = await EventMgmtVendor.findById(req.params.id);
    if (!vendor) {
      return next({ statusCode: 404, message: 'Event Management Vendor not found.', vendorId: req.params.id });
    }

    const updatedVendor = await EventMgmtVendor.findByIdAndUpdate(req.params.id, sanitize(req.body), {
      new: true,
      runValidators: true,
    });

    logger.info(`Event Management Vendor ${req.params.id} updated by admin ${req.user.id}.`);
    res.status(200).json({
      message: 'Event Management Vendor updated successfully!',
      vendor: updatedVendor,
    });
  } catch (error) {
    logger.error(`Error updating Event Management Vendor ${req.params.id}`, { error: error.message });
    next({ statusCode: 400, message: 'Failed to update Event Management Vendor.', error });
  }
};

// Delete an Event Management Vendor
export const deleteEventMgmtVendor = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return next({ statusCode: 403, message: 'Access denied. Only admins can delete Event Management Vendors.' });
    }

    const vendor = await EventMgmtVendor.findById(req.params.id);
    if (!vendor) {
      return next({ statusCode: 404, message: 'Event Management Vendor not found.', vendorId: req.params.id });
    }

    await EventMgmtVendor.findByIdAndDelete(req.params.id);

    logger.info(`Event Management Vendor ${req.params.id} deleted by admin ${req.user.id}.`);
    res.status(200).json({ message: 'Event Management Vendor deleted successfully!' });
  } catch (error) {
    logger.error(`Error deleting Event Management Vendor ${req.params.id}`, { error: error.message });
    next({ statusCode: 500, message: 'Failed to delete Event Management Vendor.', error });
  }
};
