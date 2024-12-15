const express = require("express");
const router = express.Router();
const weddingPackageController = require("../controllers/weddingPackageController");

router.route("/")
  .get(weddingPackageController.getAllPackages)          
  .post(weddingPackageController.createPackage);
  
router.route("/:id")
    .get(weddingPackageController.getPackageById)
    .put(weddingPackageController.updatePackage)
    .delete(weddingPackageController.deletePackage);

module.exports= router;

