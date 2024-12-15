const express = require("express");
const router = express.Router();
const eventMgmtVendorController = require("../controllers/eventMgmtVendorController");

router.route("/")
    .get(eventMgmtVendorController.getAllEventMgmtVendors)
    .post(eventMgmtVendorController.createEventMgmtVendor);

router.route("/:id")
    .get(eventMgmtVendorController.getEventMgmtVendorById)
    .put(eventMgmtVendorController.updateEventMgmtVendor)
    .delete(eventMgmtVendorController.deleteEventMgmtVendor);

module.exports = router;
