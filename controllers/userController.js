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
exports.register = async (req,res) => {
    const { username, password, email, contact_details, } = req.body;

  try {
     /*if (role !== 'user' && role !== 'admin') {
      return res.status(400).json({ error: 'Invalid role specified.' });
    }
      */

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password: hashedPassword,
      email,
      contact_details    
    });

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Registration error:', error);    
    res.status(400).json({ error: 'User registration failed!' });
  }
}

exports.login = async (req, res) => {
    const { email, password, role } = req.body;
  
    try {
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ error: "User not found!" });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
  
      if (!isMatch) {
        return res.status(400).json({ error: "Invalid credentials!" });
      }

      if (user.role !== role) {
        return res.status(403).json({ error: "Invalid role for this user!" });
      }
  
      const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
  
      let dashboardUrl = "/";
      switch (user.role) {
        case "admin":
          dashboardUrl = "/admin-dashboard";
          break;
        case "eventMgmtVendor":
          dashboardUrl = "/vendor-dashboard";
          break;
        case "user":
        default:
          dashboardUrl = "/user-dashboard";
          break;
      }
  
      res.status(200).json({
        token,
        userId: user._id,
        role: user.role,
        dashboardUrl,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed!" });
    }
  };

  exports.getAllUsers = async (req, res) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.role !== "admin") {
        return res.status(403).json({ error: "Access denied. Admins only." });
      }
  
      const users = await User.find();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  exports.getUserById = async (req, res) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.id !== req.params.id && decoded.role !== "admin") {
        return res.status(403).json({ error: "Access denied." });
      }
  
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ error: "User not found!" });
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  exports.updateUser = async (req, res) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.id !== req.params.id && decoded.role !== "admin") {
        return res.status(403).json({ error: "Access denied." });
      }
  
      const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!user) return res.status(404).json({ error: "User not found!" });
      res.status(200).json({ message: "User updated successfully!", user });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

exports.deleteUser = async (req, res) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.id !== req.params.id && decoded.role !== "admin") {
        return res.status(403).json({ error: "Access denied." });
      }
  
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) return res.status(404).json({ error: "User not found!" });
      res.status(200).json({ message: "User deleted successfully!" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  




  





