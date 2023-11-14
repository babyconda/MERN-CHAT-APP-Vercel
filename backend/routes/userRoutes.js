const express = require("express");
const {
  registerUser,
  authUser,
  allUsers,
  updateUser,
  updateProfile,
} = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.route("/").post(registerUser).get(protect, allUsers);
router.post("/login", authUser);
router.route("/:id").patch(protect, updateUser);
router.route("/profile/:id").patch(protect, updateProfile);

module.exports = router;
