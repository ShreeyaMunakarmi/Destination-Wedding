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

exports.getAllVenues = async (req, res) => {
    try {
      const venues = await Venue.find();
      res.status(200).json(venues);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

exports.getVenueById = async (req, res) => {
    try{
        const venue = await Venue.findById(req.params.id);
        if(!venue){
            return res.status(404).json({ error: "Venue not found!" });
        }
        res.status(200).json(venue);
    } catch (error) {
        res.status(500).json({ error : error.message });
    }
  };

  exports.createVenue = async (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
  
      if (decoded.role !== 'eventMgmtVendor') {
        return res.status(403).json({ error: 'Access denied. Event Management Vendors only.' });
      }
  
      const { name, location, capacity, price } = req.body;
      const newVenue = await Venue.create({
        name,
        location,
        capacity,
        price,
        event_management_vendor: decoded.id, 
      });


      const vendor = await EventMgmtVendor.findOne({ user_id: decoded.id });
         if (!vendor) {
      return res.status(404).json({ error: 'Event Management Vendor not found.' });
    }
        vendor.venues.push(newVenue._id);
        await vendor.save();
    
      res.status(201).json({
        message: 'Venue created successfully!',
        venue: newVenue,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  exports.updateVenue = async (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
  
      if (decoded.role !== 'eventMgmtVendor') {
        return res.status(403).json({ error: 'Access denied. Vendors only.' });
      }
  
      const venue = await Venue.findById(req.params.id);
      if (!venue) {
        return res.status(404).json({ error: 'Venue not found!' });
      }
  
      if (venue.event_management_vendor.toString() !== decoded.id) {
        return res.status(403).json({ error: 'Access denied. You can only update venues you created.' });
      }
  
      const updatedVenue = await Venue.findByIdAndUpdate(req.params.id, req.body, { new: true });
      
      const vendor = await EventMgmtVendor.findOne({ user_id: decoded.id }).populate('venues');
    if (!vendor) {
      return res.status(404).json({ error: 'Event Management Vendor not found.' });
    }

    vendor.venues = vendor.venues.map((v) =>
      v._id.toString() === updatedVenue._id.toString() ? updatedVenue : v
    );
    await vendor.save();

      
      res.status(200).json({
        message: 'Venue updated successfully!',
        venue: updatedVenue,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  exports.deleteVenue = async (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
  
      if (decoded.role !== 'eventMgmtVendor') {
        return res.status(403).json({ error: 'Access denied. Vendors only.' });
      }
  
      const venue = await Venue.findById(req.params.id);
      if (!venue) {
        return res.status(404).json({ error: 'Venue not found!' });
      }
  
      if (venue.event_management_vendor.toString() !== decoded.id) {
        return res.status(403).json({ error: 'Access denied. You can only delete venues you created.' });
      }
  
      await EventMgmtVendor.findOneAndUpdate(
        { user_id: decoded.id },
        { $pull: { venues: venue._id } }
      );

      await Venue.findByIdAndDelete(req.params.id);
  
      res.status(200).json({ message: 'Venue deleted successfully!' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  
  

