const express = require("express");
const router = express.Router();
const venueController = require("../controllers/venueController");

router.route("/")
    .get(venueController.getAllVenues)
    .post(venueController.createVenue);

router.route("/:id")
    .get(venueController.getVenueById)
    .put(venueController.updateVenue)
    .delete(venueController.deleteVenue);

module.exports = router; 