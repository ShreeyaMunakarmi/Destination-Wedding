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

exports.getAllEventMgmtVendors = async (req, res) => {
    try {
      const vendors = await EventMgmtVendor.find()
        .populate('user_id', 'username email') 
        .populate('vendor_id', 'name service_type') 
        .populate('wedding_packages', 'name price') 
        .populate('venues', 'name location capacity'); 
      res.status(200).json(vendors);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  exports.getEventMgmtVendorById = async (req, res) => {
    try {
      const vendor = await EventMgmtVendor.findById(req.params.id)
        .populate('user_id', 'username email')
        .populate('vendor_id', 'name service_type')
        .populate('wedding_packages', 'name price')
        .populate('venues', 'name location capacity');
      if (!vendor) {
        return res.status(404).json({ error: 'Event Management Vendor not found!' });
      }
      res.status(200).json(vendor);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  exports.createEventMgmtVendor = async (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
  
      if (decoded.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Only admins can create event management vendors.' });
      }
  
      const { user_id, vendor_id } = req.body;
      const newVendor = await EventMgmtVendor.create({
        user_id,
        vendor_id,
      });
  
      res.status(201).json({
        message: 'Event Management Vendor created successfully!',
        vendor: newVendor,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  
  exports.updateEventMgmtVendor = async (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
  
      if (decoded.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Only admins can update event management vendors.' });
      }
  
      const vendor = await EventMgmtVendor.findById(req.params.id);
      if (!vendor) {
        return res.status(404).json({ error: 'Event Management Vendor not found!' });
      }
  
      const updatedVendor = await EventMgmtVendor.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.status(200).json({
        message: 'Event Management Vendor updated successfully!',
        vendor: updatedVendor,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  
  exports.deleteEventMgmtVendor = async (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
  
      if (decoded.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Only admins can delete event management vendors.' });
      }
  
      const vendor = await EventMgmtVendor.findById(req.params.id);
      if (!vendor) {
        return res.status(404).json({ error: 'Event Management Vendor not found!' });
      }
  
      await EventMgmtVendor.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: 'Event Management Vendor deleted successfully!' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };