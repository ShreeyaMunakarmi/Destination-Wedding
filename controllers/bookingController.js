import sanitize from 'mongo-sanitize';
import Booking from '../models/booking.js';
import WeddingPackage from '../models/weddingPackage.js';
import logger from '../utils/logger.js'; // Import logger for consistent logging

// Get all bookings
export const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find();
    logger.info('Fetched all bookings successfully.');
    res.status(200).json(bookings);
  } catch (error) {
    logger.error('Error fetching bookings', { error: error.message });
    next({ statusCode: 500, message: 'Failed to fetch bookings.', error });
  }
};

// Get a booking by ID
export const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return next({ statusCode: 404, message: 'Booking not found.', bookingId: req.params.id });
    }
    logger.info(`Fetched booking ${req.params.id} successfully.`);
    res.status(200).json(booking);
  } catch (error) {
    logger.error(`Error fetching booking ${req.params.id}`, { error: error.message });
    next({ statusCode: 500, message: 'Failed to fetch booking.', error });
  }
};

// Create a new booking
export const createBooking = async (req, res, next) => {
  try {
    if (req.user.role !== 'user') {
      return next({ statusCode: 403, message: 'Access denied. Only users can create bookings.' });
    }

    const { package_id, booking_date, status } = sanitize(req.body);

    const weddingPackage = await WeddingPackage.findById(package_id);
    if (!weddingPackage) {
      return next({ statusCode: 404, message: 'Wedding package not found.', packageId: package_id });
    }

    const newBooking = await Booking.create({
      user_id: req.user.id,
      package_id,
      booking_date: booking_date || new Date(),
      status: status || 'Pending',
    });

    weddingPackage.bookings.push(newBooking._id);
    await weddingPackage.save();

    logger.info(`Booking ${newBooking._id} created by user ${req.user.id}.`);
    res.status(201).json({
      message: 'Booking created successfully!',
      booking: newBooking,
    });
  } catch (error) {
    logger.error('Error creating booking', { error: error.message });
    next({ statusCode: 400, message: 'Failed to create booking.', error });
  }
};

// Update a booking
export const updateBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return next({ statusCode: 404, message: 'Booking not found.', bookingId: req.params.id });
    }

    if (req.user.id !== booking.user_id.toString()) {
      return next({ statusCode: 403, message: 'Access denied. You can only update your own bookings.' });
    }

    const { package_id, booking_date, status } = sanitize(req.body);

    if (package_id && package_id !== booking.package_id.toString()) {
      const oldPackage = await WeddingPackage.findById(booking.package_id);
      if (oldPackage) {
        oldPackage.bookings.pull(booking._id);
        await oldPackage.save();
      }

      const newPackage = await WeddingPackage.findById(package_id);
      if (!newPackage) {
        return next({ statusCode: 404, message: 'New wedding package not found.', packageId });
      }

      newPackage.bookings.push(booking._id);
      await newPackage.save();
      booking.package_id = package_id;
    }

    if (booking_date) booking.booking_date = booking_date;
    if (status) booking.status = status;

    const updatedBooking = await booking.save();

    logger.info(`Booking ${req.params.id} updated by user ${req.user.id}.`);
    res.status(200).json({
      message: 'Booking updated successfully!',
      booking: updatedBooking,
    });
  } catch (error) {
    logger.error(`Error updating booking ${req.params.id}`, { error: error.message });
    next({ statusCode: 400, message: 'Failed to update booking.', error });
  }
};

// Delete a booking
export const deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return next({ statusCode: 404, message: 'Booking not found.', bookingId: req.params.id });
    }

    if (req.user.id !== booking.user_id.toString()) {
      return next({ statusCode: 403, message: 'Access denied. You can only delete your own bookings.' });
    }

    const weddingPackage = await WeddingPackage.findById(booking.package_id);
    if (weddingPackage) {
      weddingPackage.bookings.pull(booking._id);
      await weddingPackage.save();
    }

    await Booking.findByIdAndDelete(req.params.id);

    logger.info(`Booking ${req.params.id} deleted by user ${req.user.id}.`);
    res.status(200).json({ message: 'Booking deleted successfully!' });
  } catch (error) {
    logger.error(`Error deleting booking ${req.params.id}`, { error: error.message });
    next({ statusCode: 500, message: 'Failed to delete booking.', error });
  }
};
