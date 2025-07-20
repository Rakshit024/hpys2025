const express = require("express");
const router = express.Router();
const { getAllUsers, getAttendanceRecords } = require("../controllers/adminController");

// Get all users with search functionality
router.get("/users", getAllUsers);

// Get all attendance records with search and sort functionality
router.get("/attendance", getAttendanceRecords);

module.exports = router; 