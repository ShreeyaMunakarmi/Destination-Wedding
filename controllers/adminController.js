import sanitize from 'mongo-sanitize';
import bcrypt from 'bcryptjs';
import Admin from '../models/admin.js';
import User from '../models/user.js';
import logger from '../utils/logger.js'; // Import logger for consistent logging

// Create a new Admin
export const createAdmin = async (req, res, next) => {
  try {
    const { username, email, password, contact_details } = sanitize(req.body);

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the admin in the Admin collection
    const newAdmin = await Admin.create({
      username,
      email,
      password: hashedPassword,
      contact_details,
    });

    // Add the admin to the User collection with role 'admin'
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      contact_details,
      role: 'admin',
    });

    logger.info(`Admin ${newAdmin._id} created successfully.`);
    res.status(201).json({
      message: 'Admin created successfully!',
      admin: {
        id: newAdmin._id,
        username: newAdmin.username,
        email: newAdmin.email,
        contact_details: newAdmin.contact_details,
      },
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        contact_details: newUser.contact_details,
      },
    });
  } catch (error) {
    logger.error('Error creating admin', { error: error.message });
    next({ statusCode: 400, message: 'Failed to create admin.', error });
  }
};

// Get an Admin by ID
export const getAdminById = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.params.id).select('-password'); // Exclude password field
    if (!admin) {
      return next({ statusCode: 404, message: 'Admin not found.', adminId: req.params.id });
    }

    logger.info(`Fetched Admin ${req.params.id} successfully.`);
    res.status(200).json(admin);
  } catch (error) {
    logger.error(`Error fetching Admin ${req.params.id}`, { error: error.message });
    next({ statusCode: 500, message: 'Failed to fetch admin.', error });
  }
};

// Update an Admin
export const updateAdmin = async (req, res, next) => {
  try {
    const { username, email, password } = sanitize(req.body);

    const updatedData = {};
    if (username) updatedData.username = username;
    if (email) updatedData.email = email;
    if (password) updatedData.password = await bcrypt.hash(password, 10);

    const updatedAdmin = await Admin.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!updatedAdmin) {
      return next({ statusCode: 404, message: 'Admin not found.', adminId: req.params.id });
    }

    logger.info(`Admin ${req.params.id} updated successfully.`);
    res.status(200).json({
      message: 'Admin updated successfully!',
      admin: updatedAdmin,
    });
  } catch (error) {
    logger.error(`Error updating Admin ${req.params.id}`, { error: error.message });
    next({ statusCode: 400, message: 'Failed to update admin.', error });
  }
};

// Delete an Admin
export const deleteAdmin = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return next({ statusCode: 404, message: 'Admin not found.', adminId: req.params.id });
    }

    await Admin.findByIdAndDelete(req.params.id);

    logger.info(`Admin ${req.params.id} deleted successfully.`);
    res.status(200).json({ message: 'Admin deleted successfully!' });
  } catch (error) {
    logger.error(`Error deleting Admin ${req.params.id}`, { error: error.message });
    next({ statusCode: 500, message: 'Failed to delete admin.', error });
  }
};
