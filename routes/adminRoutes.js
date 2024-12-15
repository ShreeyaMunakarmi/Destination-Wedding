const express= require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

router.route("/")
    .post(adminController.createAdmin);

router.route("/:id")
    .get(adminController.getAdminById)
    .update(adminController.updateAdmin)
    .delete(adminController.deleteAdmin);

module.exports = router;
