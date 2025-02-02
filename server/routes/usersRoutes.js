const express = require("express");
const router = express.Router();
const {
  getAllClients,
  GetUserById,
} = require("../Controllers/usersController");
const authMiddleware = require("../middlewares/authMiddleware");
const getUserActivityLogs = require("../Controllers/userActivityController")
const clearLogs = require("../Controllers/logController");

router.get("/get-all-users", authMiddleware, getAllClients);
router.get("/activity", authMiddleware, getUserActivityLogs);
router.post("/activity/clear", authMiddleware,clearLogs);


router.get("/:userId", GetUserById);

module.exports = router;
