const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Booking = require('../models/booking');
const EventMgmtVendor = require('../models/eventMgmtVendor');
const Vendor = require('../models/vendor');
const Venue = require('../models/venue');
const WeddingPackageController = require('../models/weddingPackage');
const Admin = require('../models/Admin');

const JWT_SECRET = process.env.JWT_SECRET;

exports.createAdmin = async(req,res) => {
    try{
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password,10);
    
        const newAdmin = await Admin.create({
            username,
            email,
            password : hashedPassword,
        });
        
        res.status(201).json({
            message: 'Admin created successfully!',
            admin: {
                id: newAdmin._id,
                username: newAdmin.username,
                email: newAdmin.email,
            }
        });
} catch (error) {
    res.status(400).json({ error: error.message });
}
};

exports.getAdminById = async (req, res) => {
    try {
      const admin = await Admin.findById(req.params.id).select('-password'); // Exclude the password field
      if (!admin) {
        return res.status(404).json({ error: 'Admin not found!' });
      }
  
      res.status(200).json(admin);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  exports.updateAdmin = async (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
  
      if (decoded.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Only admins can update admin details.' });
      }
  
      const { username, email, password } = req.body;
  
      const updatedData = {};
      if (username) updatedData.username = username;
      if (email) updatedData.email = email;
      if (password) updatedData.password = await bcrypt.hash(password, 10); 
  
      const updatedAdmin = await Admin.findByIdAndUpdate(req.params.id, updatedData, { new: true }).select('-password');
      if (!updatedAdmin) {
        return res.status(404).json({ error: 'Admin not found!' });
      }
  
      res.status(200).json({
        message: 'Admin updated successfully!',
        admin: updatedAdmin,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  
  exports.deleteAdmin = async (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
  
      if (decoded.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Only admins can delete admin accounts.' });
      }
  
      const admin = await Admin.findById(req.params.id);
      if (!admin) {
        return res.status(404).json({ error: 'Admin not found!' });
      }
  
      await Admin.findByIdAndDelete(req.params.id);
  
      res.status(200).json({ message: 'Admin deleted successfully!' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
