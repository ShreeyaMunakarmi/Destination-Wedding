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

exports.getAllPackages = async (req, res) => {
    try {
      const packages = await WeddingPackage.find();
      res.status(200).json(packages);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

exports.getPackageById = async (req, res) => {
    try{
        const package = await WeddingPackage.findById(req.params.id);
        if(!package){
            return res.status(404).json({ error: "Package not found!" });
        }
        res.status(200).json(package);
    } catch (error) {
        res.status(500).json({ error : error.message });
    }
  };

  exports.createPackage = async (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
  
      if (decoded.role !== 'eventMgmtVendor') {
        return res.status(403).json({ error: 'Access denied. Vendors only.' });
      }
  
      const { name, description, price, capacity } = req.body;
      const newPackage = await WeddingPackage.create({
        name,
        description,
        price,
        capacity,
        createdBy: decoded.id, 
      });

      const eventMgmtVendor = await eventMgmtVendor.findOne({ user_id: decoded.id });
    if (!eventMgmtVendor) {
      return res.status(404).json({ error: 'Event Management Vendor not found.' });
    }
    eventMgmtVendor.wedding_packages.push(newPackage._id);
    await eventMgmtVendor.save();

  
      res.status(201).json({
        message: 'Wedding package created successfully!',
        package: newPackage,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  exports.updatePackage = async (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
  
      const package = await WeddingPackage.findById(req.params.id);
      if (!package) return res.status(404).json({ error: 'Package not found!' });
  
      if (package.createdBy.toString() !== decoded.id) {
        return res.status(403).json({ error: 'Access denied. Only the creator can update.' });
      }
  
      const updatedPackage = await WeddingPackage.findByIdAndUpdate(req.params.id, req.body, { new: true });
      
      const eventMgmtVendor = await eventMgmtVendor.findOne({ user_id: decoded.id });
      if (eventMgmtVendor) {
        const packageIndex = eventMgmtVendor.wedding_packages.findIndex(
          (pkgId) => pkgId.toString() === updatedPackage._id.toString()
        );
  
        if (packageIndex !== -1) {
          eventMgmtVendor.wedding_packages[packageIndex] = updatedPackage._id; 
          await eventMgmtVendor.save();
        }
      }
      
      res.status(200).json({
        message: 'Wedding package updated successfully!',
        package: updatedPackage,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  exports.deletePackage = async (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
  
      const package = await WeddingPackage.findById(req.params.id);
      if (!package) return res.status(404).json({ error: 'Package not found!' });
  
      if (package.createdBy.toString() !== decoded.id) {
        return res.status(403).json({ error: 'Access denied. Only the creator can delete.' });
      }
  
      await WeddingPackage.findByIdAndDelete(req.params.id);

      const eventMgmtVendor = await eventMgmtVendor.findOne({ user_id: decoded.id });
      if (eventMgmtVendor) {
        eventMgmtVendor.wedding_packages = eventMgmtVendor.wedding_packages.filter(
          (pkgId) => pkgId.toString() !== req.params.id
        );
        await eventMgmtVendor.save();
      }
  
      res.status(200).json({ message: 'Wedding package deleted successfully!' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  
  
