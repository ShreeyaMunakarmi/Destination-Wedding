import sanitize from 'mongo-sanitize';
import Venue from '../models/venue.js';
import EventMgmtVendor from '../models/eventMgmtVendor.js';
import logger from '../utils/logger.js'; // Logger for consistent logging

// Get all venues
export const getAllVenues = async (req, res, next) => {
  try {
    const venues = await Venue.find();
    logger.info('Fetched all venues successfully.');
    res.status(200).json(venues);
  } catch (error) {
    logger.error('Error fetching venues', { error: error.message });
    next({ statusCode: 500, message: 'Failed to fetch venues.', error });
  }
};

// Get a venue by ID
export const getVenueById = async (req, res, next) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) {
      return next({ statusCode: 404, message: 'Venue not found.', venueId: req.params.id });
    }
    logger.info(`Fetched venue ${req.params.id} successfully.`);
    res.status(200).json(venue);
  } catch (error) {
    logger.error(`Error fetching venue ${req.params.id}`, { error: error.message });
    next({ statusCode: 500, message: 'Failed to fetch venue.', error });
  }
};

// Create a new venue
export const createVenue = async (req, res, next) => {
  try {
    if (req.user.role !== 'eventMgmtVendor') {
      return next({ statusCode: 403, message: 'Access denied. Vendors only.' });
    }

    const { name, location, capacity, price } = sanitize(req.body);

    const newVenue = await Venue.create({
      name,
      location,
      capacity,
      price,
      event_management_vendor: req.user.id,
    });

    const vendor = await EventMgmtVendor.findOne({ user_id: req.user.id });
    if (!vendor) {
      return next({ statusCode: 404, message: 'Event Management Vendor not found.', userId: req.user.id });
    }
    vendor.venues.push(newVenue._id);
    await vendor.save();

    logger.info(`Venue ${newVenue._id} created by vendor ${req.user.id}.`);
    res.status(201).json({
      message: 'Venue created successfully!',
      venue: newVenue,
    });
  } catch (error) {
    logger.error('Error creating venue', { error: error.message });
    next({ statusCode: 400, message: 'Failed to create venue.', error });
  }
};

// Update a venue
export const updateVenue = async (req, res, next) => {
  try {
    if (req.user.role !== 'eventMgmtVendor') {
      return next({ statusCode: 403, message: 'Access denied. Vendors only.' });
    }

    const venue = await Venue.findById(req.params.id);
    if (!venue) {
      return next({ statusCode: 404, message: 'Venue not found.', venueId: req.params.id });
    }

    if (venue.event_management_vendor.toString() !== req.user.id) {
      return next({ statusCode: 403, message: 'Access denied. You can only update your own venues.' });
    }

    const updatedVenue = await Venue.findByIdAndUpdate(req.params.id, sanitize(req.body), {
      new: true,
      runValidators: true,
    });

    logger.info(`Venue ${req.params.id} updated by vendor ${req.user.id}.`);
    res.status(200).json({
      message: 'Venue updated successfully!',
      venue: updatedVenue,
    });
  } catch (error) {
    logger.error(`Error updating venue ${req.params.id}`, { error: error.message });
    next({ statusCode: 400, message: 'Failed to update venue.', error });
  }
};

// Delete a venue
export const deleteVenue = async (req, res, next) => {
  try {
    if (req.user.role !== 'eventMgmtVendor') {
      return next({ statusCode: 403, message: 'Access denied. Vendors only.' });
    }

    const venue = await Venue.findById(req.params.id);
    if (!venue) {
      return next({ statusCode: 404, message: 'Venue not found.', venueId: req.params.id });
    }

    if (venue.event_management_vendor.toString() !== req.user.id) {
      return next({ statusCode: 403, message: 'Access denied. You can only delete your own venues.' });
    }

    await EventMgmtVendor.findOneAndUpdate(
      { user_id: req.user.id },
      { $pull: { venues: venue._id } }
    );

    await Venue.findByIdAndDelete(req.params.id);

    logger.info(`Venue ${req.params.id} deleted by vendor ${req.user.id}.`);
    res.status(200).json({ message: 'Venue deleted successfully!' });
  } catch (error) {
    logger.error(`Error deleting venue ${req.params.id}`, { error: error.message });
    next({ statusCode: 500, message: 'Failed to delete venue.', error });
  }
};
