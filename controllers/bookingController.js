const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Booking = require('../models/booking');
const EventMgmtVendor = require('../models/eventMgmtVendor');
const Vendor = require('../models/vendor');
const Venue = require('../models/venue');
const WeddingPackage = require('../models/weddingPackage');
const Admin = require('../models/Admin');

const JWT_SECRET = process.env.JWT_SECRET;

exports.getAllBookings = async (req, res) => {
    try {
      const bookings = await Booking.find();
      res.status(200).json(bookings);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

exports.getBookingById = async (req, res) => {
    try{
        const booking = await Booking.findById(req.params.id);
        if(!booking){
            return res.status(404).json({ error: "Booking not found!" });
        }
        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json({ error : error.message });
    }
  };

  exports.createBooking = async (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
  
      if (decoded.role !== 'user') {
        return res.status(403).json({ error: 'Access denied. Only users can create bookings.' });
      }
  
      const { package_id, booking_date, status } = req.body;
  
      const weddingPackage = await WeddingPackage.findById(package_id);
      if (!weddingPackage) {
        return res.status(404).json({ error: 'Wedding package not found!' });
      }
  
      const newBooking = await Booking.create({
        user_id: decoded.id,
        package_id,
        booking_date: booking_date || new Date(),
        status: status || 'Pending',
        });

      weddingPackage.bookings.push(newBooking._id);
      await weddingPackage.save();
  
      res.status(201).json({
        message: 'Booking created successfully!',
        booking: newBooking,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  exports.updateBooking = async( req, res) =>{
    const token = req.header('authorization')?.replace('Bearer ', '');
    try{
        const decoded = jwt.verify(token, JWT_SECRET);

        const booking = await Booking.findById(req.params.id);
        if(!booking){
            return res.status(404).json({error: 'Booking not found!' });
        }
        
        if(decoded.id !== booking.user_id.toString()){
            return res.status(403).json({ error: 'Access denied. you can only update your own bookings' });
        }

        const { package_id, booking_date, status } = req.body;
        if (package_id && package_id !== booking.package_id.toString()) {
    
            const oldPackage = await WeddingPackage.findById(booking.package_id);
            if (oldPackage) {
              oldPackage.bookings.pull(booking._id);
              await oldPackage.save();
            }

            const newPackage = await WeddingPackage.findById(package_id);
            if(!newPackage) {
                return res.status(404).json({error: 'New weddding package not found' });
            }

            newPackage.bookings.push(booking._id);
            await newPackage.save();
            booking.package_id = package_id;
        }
    
        if (booking_date) booking.booking_date = booking_date;
        if (status) booking.status = status;
    
        const updatedBooking = await booking.save();
    
        res.status(200).json({
          message: 'Booking updated successfully!',
          booking: updatedBooking,
        });
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    };

exports.deleteBooking = async (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
  
      const booking = await Booking.findById(req.params.id);
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found!' });
      }
  
    
      if (decoded.id !== booking.user_id.toString()) {
        return res.status(403).json({ error: 'Access denied. You can only delete your own bookings.' });
      }
  
      const weddingPackage = await WeddingPackage.findById(booking.package_id);
      if (weddingPackage) {
        weddingPackage.bookings.pull(booking._id);
        await weddingPackage.save();
      }
  
      await Booking.findByIdAndDelete(req.params.id);
  
      res.status(200).json({ message: 'Booking deleted successfully!' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  


