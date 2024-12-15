const express = require ("express");
const router = express.Router();
const { register, login, getAllUsers, getUserById , updateUser, deleteUser} = require ("../controllers/userController");

router.post('/register' , register);
router.post ('/login' , login);

router.route("/")
    .get(getAllUsers);

router.route("/:id")
    .get(getUserById)
    .put(updateUser)
    .delete(deleteUser);

module.exports = router;