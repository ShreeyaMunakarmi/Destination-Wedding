import sanitize from 'mongo-sanitize';
import Vendor from '../models/vendor.js';
import EventMgmtVendor from '../models/eventMgmtVendor.js';
import logger from '../utils/logger.js'; // Import logger for consistent logging

// Get all vendors
export const getAllVendors = async (req, res, next) => {
  try {
    const vendors = await Vendor.find();
    logger.info('Fetched all vendors successfully.');
    res.status(200).json(vendors);
  } catch (error) {
    logger.error('Error fetching vendors', { error: error.message });
    next({ statusCode: 500, message: 'Failed to fetch vendors.', error });
  }
};

// Get a vendor by ID
export const getVendorById = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return next({ statusCode: 404, message: 'Vendor not found.', vendorId: req.params.id });
    }
    logger.info(`Fetched vendor ${req.params.id} successfully.`);
    res.status(200).json(vendor);
  } catch (error) {
    logger.error(`Error fetching vendor ${req.params.id}`, { error: error.message });
    next({ statusCode: 500, message: 'Failed to fetch vendor.', error });
  }
};

// Create a new vendor
export const createVendor = async (req, res, next) => {
  try {
    if (!['admin', 'eventMgmtVendor'].includes(req.user.role)) {
      return next({ statusCode: 403, message: 'Access denied. Only admins or event management vendors can create vendors.' });
    }

    const { name, service_type, contact_details } = sanitize(req.body);

    const newVendor = await Vendor.create({
      name,
      service_type,
      contact_details,
    });

    if (req.user.role === 'eventMgmtVendor') {
      const eventMgmtVendor = await EventMgmtVendor.findOne({ user_id: req.user.id });
      if (!eventMgmtVendor) {
        return next({ statusCode: 404, message: 'Event Management Vendor not found.', userId: req.user.id });
      }
      eventMgmtVendor.vendor_id = newVendor._id;
      await eventMgmtVendor.save();
    }

    logger.info(`Vendor ${newVendor._id} created by ${req.user.role} ${req.user.id}.`);
    res.status(201).json({
      message: 'Vendor created successfully!',
      vendor: newVendor,
    });
  } catch (error) {
    logger.error('Error creating vendor', { error: error.message });
    next({ statusCode: 400, message: 'Failed to create vendor.', error });
  }
};

// Update a vendor
export const updateVendor = async (req, res, next) => {
  try {
    if (!['admin', 'eventMgmtVendor'].includes(req.user.role)) {
      return next({ statusCode: 403, message: 'Access denied. Only admins or event management vendors can update vendors.' });
    }

    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return next({ statusCode: 404, message: 'Vendor not found.', vendorId: req.params.id });
    }

    const updatedVendor = await Vendor.findByIdAndUpdate(req.params.id, sanitize(req.body), {
      new: true,
      runValidators: true,
    });

    const eventMgmtVendor = await EventMgmtVendor.findOne({ vendor_id: req.params.id });
    if (eventMgmtVendor) {
      eventMgmtVendor.vendor_id = updatedVendor._id;
      await eventMgmtVendor.save();
    }

    logger.info(`Vendor ${req.params.id} updated by ${req.user.role} ${req.user.id}.`);
    res.status(200).json({
      message: 'Vendor updated successfully!',
      vendor: updatedVendor,
    });
  } catch (error) {
    logger.error(`Error updating vendor ${req.params.id}`, { error: error.message });
    next({ statusCode: 400, message: 'Failed to update vendor.', error });
  }
};

// Delete a vendor
export const deleteVendor = async (req, res, next) => {
  try {
    if (!['admin', 'eventMgmtVendor'].includes(req.user.role)) {
      return next({ statusCode: 403, message: 'Access denied. Only admins or event management vendors can delete vendors.' });
    }

    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return next({ statusCode: 404, message: 'Vendor not found.', vendorId: req.params.id });
    }

    if (req.user.role === 'eventMgmtVendor') {
      const eventMgmtVendor = await EventMgmtVendor.findOne({ user_id: req.user.id });
      if (eventMgmtVendor && eventMgmtVendor.vendor_id.toString() === vendor._id.toString()) {
        eventMgmtVendor.vendor_id = null;
        await eventMgmtVendor.save();
      }
    }

    await Vendor.findByIdAndDelete(req.params.id);

    logger.info(`Vendor ${req.params.id} deleted by ${req.user.role} ${req.user.id}.`);
    res.status(200).json({ message: 'Vendor deleted successfully!' });
  } catch (error) {
    logger.error(`Error deleting vendor ${req.params.id}`, { error: error.message });
    next({ statusCode: 500, message: 'Failed to delete vendor.', error });
  }
};
