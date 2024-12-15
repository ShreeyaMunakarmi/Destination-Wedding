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

exports.getAllVendors = async (req, res) => {
    try {
      const vendors = await Vendor.find();
      res.status(200).json(vendors);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

exports.getVendorById = async (req, res) => {
    try{
        const vendor = await Vendor.findById(req.params.id);
        if(!vendor){
            return res.status(404).json({ error: "Vendor not found!" });
        }
        res.status(200).json(vendor);
    } catch (error) {
        res.status(500).json({ error : error.message });
    }
  };

  exports.createVendor = async (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
  
      if (decoded.role !== 'admin' && decoded.role !== 'eventMgmtVendor') {
        return res.status(403).json({ error: 'Access denied. Only admins or event management vendors can create vendors.' });
      }
  
      const { name, service_type, contact_details } = req.body;
  
      const newVendor = await Vendor.create({
        name,
        service_type,
        contact_details,
      });
  
      if (decoded.role === 'eventMgmtVendor') {
        const eventMgmtVendor = await eventMgmtVendor.findOne({ user_id: decoded.id });
        if (!eventMgmtVendor) {
          return res.status(404).json({ error: 'Event Management Vendor not found.' });
        }
        eventMgmtVendor.vendor_id = newVendor._id; 
        await eventMgmtVendor.save();
      }
  
      res.status(201).json({
        message: 'Vendor created successfully!',
        vendor: newVendor,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };


exports.updateVendor = async (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
  
      if (decoded.role !== 'admin' && decoded.role !== 'eventMgmtVendor') {
        return res.status(403).json({ error: 'Access denied. Only admins or event management vendors can update vendors.' });
      }
  
      const vendor = await Vendor.findById(req.params.id);
      if (!vendor) {
        return res.status(404).json({ error: 'Vendor not found!' });
      }

      const updatedVendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, { new: true });
      const eventMgmtVendor = await eventMgmtVendor.findOne({ vendor_id: req.params.id });
    if (eventMgmtVendor) {
      eventMgmtVendor.vendor_id = updatedVendor._id; 
      await eventMgmtVendor.save();
    }

    res.status(200).json({
        message: 'Vendor updated successfully!',
        vendor: updatedVendor,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

exports.deleteVendor = async (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
  
      if (decoded.role !== 'admin' && decoded.role !== 'eventMgmtVendor') {
        return res.status(403).json({ error: 'Access denied. Only admins or event management vendors can delete vendors.' });
      }
  
      const vendor = await Vendor.findById(req.params.id);
      if (!vendor) {
        return res.status(404).json({ error: 'Vendor not found!' });
      }
  
      if (decoded.role === 'eventMgmtVendor') {
        const eventMgmtVendor = await eventMgmtVendor.findOne({ user_id: decoded.id });
        if (eventMgmtVendor && eventMgmtVendor.vendor_id.toString() === vendor._id.toString()) {
          eventMgmtVendor.vendor_id = null; 
          await eventMgmtVendor.save();
        }
      }
  
      await Vendor.findByIdAndDelete(req.params.id);
  
      res.status(200).json({ message: 'Vendor deleted successfully!' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  
