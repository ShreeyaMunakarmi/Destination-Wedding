const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("./config/database");
const userRoutes = require ("./routes/userRoutes");
const packageRoutes = require ("./routes/weddingPackageRoutes");
const bookingRoutes = require ("./routes/bookingRoutes");
const venueRoutes = require ("./routes/venueRoutes");
const vendorRoutes = require ("./routes/vendorRoutes");
const eventMgmtVendorRoutes = require ("./routes/eventMgmtVendorRoutes");
const adminRoutes = require ("./routes/adminRoutes");

const app = express();
app.use(cors());

app.use(express.json());
app.use("/users", userRoutes);
app.use("/packages", packageRoutes);
app.use("/bookings",bookingRoutes);
app.use("/venues" , venueRoutes);
app.use("/vendors" , vendorRoutes);
app.use("/eventMgmtVendors" , eventMgmtVendorRoutes);
app.use("/admins", adminRoutes);

module.exports = app;