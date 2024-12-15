const express = require("express");
const router = express.Router();
const vendorController = require("../controllers/vendorController");

router.route("/")
    .get(vendorController.getAllVendors)
    .post(vendorController.createVendor);

router.route("/:id")
    .get(vendorController.getVendorById)
    .put(vendorController.updateVendor)
    .delete(vendorController.deleteVendor);

module.exports = router;