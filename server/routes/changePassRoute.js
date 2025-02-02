const express = require("express");
const router = express.Router();
const changePasswordController = require("../Controllers/changePassController")
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/password", authMiddleware, changePasswordController);
module.exports = router
