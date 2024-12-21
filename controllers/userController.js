import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sanitize from 'mongo-sanitize';
import User from '../models/user.js';
import logger from '../utils/logger.js'; // Use Winston for logging

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

// Register a new user
export const register = async (req, res, next) => {
  try {
    const { username, password, email, contact_details } = sanitize(req.body);

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = await User.create({
      username,
      password: hashedPassword,
      email,
      contact_details,
      role: 'user', // Default role
    });

    logger.info(`User ${user._id} registered successfully.`);
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    logger.error('Error during user registration', { error: error.message });
    next({ statusCode: 400, message: 'User registration failed.', error });
  }
};

// Login a user
export const login = async (req, res, next) => {
  try {
    const { email, password } = sanitize(req.body);

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn('Login failed: User not found');
      return next({ statusCode: 404, message: 'User not found.' });
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn('Login failed: Invalid credentials');
      return next({ statusCode: 400, message: 'Invalid credentials.' });
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

    const dashboardUrl = {
      admin: '/admin-dashboard',
      eventMgmtVendor: '/vendor-dashboard',
      user: '/user-dashboard',
    }[user.role] || '/';

    logger.info(`User ${user._id} logged in successfully.`);
    res.status(200).json({
      token,
      userId: user._id,
      role: user.role,
      dashboardUrl,
    });
  } catch (error) {
    logger.error('Error during user login', { error: error.message });
    next({ statusCode: 500, message: 'Login failed.', error });
  }
};

// Get all users (Admin only)
export const getAllUsers = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return next({ statusCode: 403, message: 'Access denied. Admins only.' });
    }

    const users = await User.find();
    logger.info('Fetched all users successfully.');
    res.status(200).json(users);
  } catch (error) {
    logger.error('Error fetching users', { error: error.message });
    next({ statusCode: 500, message: 'Failed to fetch users.', error });
  }
};

// Get a user by ID
export const getUserById = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return next({ statusCode: 403, message: 'Access denied.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return next({ statusCode: 404, message: 'User not found.' });
    }

    logger.info(`Fetched user ${req.params.id} successfully.`);
    res.status(200).json(user);
  } catch (error) {
    logger.error('Error fetching user by ID', { error: error.message });
    next({ statusCode: 500, message: 'Failed to fetch user.', error });
  }
};

// Update a user
export const updateUser = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return next({ statusCode: 403, message: 'Access denied.' });
    }

    const sanitizedBody = sanitize(req.body);
    const updatedUser = await User.findByIdAndUpdate(req.params.id, sanitizedBody, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return next({ statusCode: 404, message: 'User not found.' });
    }

    logger.info(`User ${req.params.id} updated successfully.`);
    res.status(200).json({ message: 'User updated successfully!', user: updatedUser });
  } catch (error) {
    logger.error('Error updating user', { error: error.message });
    next({ statusCode: 400, message: 'Failed to update user.', error });
  }
};

// Delete a user
export const deleteUser = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return next({ statusCode: 403, message: 'Access denied.' });
    }

    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return next({ statusCode: 404, message: 'User not found.' });
    }

    logger.info(`User ${req.params.id} deleted successfully.`);
    res.status(200).json({ message: 'User deleted successfully!' });
  } catch (error) {
    logger.error('Error deleting user', { error: error.message });
    next({ statusCode: 500, message: 'Failed to delete user.', error });
  }
};
