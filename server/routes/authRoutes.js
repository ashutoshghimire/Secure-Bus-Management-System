const express = require("express");
const router = express();
const {
  CreateUser,
  Login,
 
  UpdatePassword,
  ResetPassword,
} = require("../Controllers/authController");

router.post("/create-user", CreateUser);
router.post("/login", Login);
router.post("/requestPasswordReset", ResetPassword);

router.post("/resetPassword/:userId/:resetString", UpdatePassword);

module.exports = router;
