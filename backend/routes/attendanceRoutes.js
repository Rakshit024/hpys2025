const express = require("express");
const router = express.Router();
const { markAttendance } = require("../controllers/attendanceController");
const Attendance = require("../models/Attendance");

router.post("/mark", markAttendance);

// Get all attendance records
router.get("/", async (req, res) => {
  try {
    const attendanceRecords = await Attendance.find().sort({ timestamp: -1 });
    res.json(attendanceRecords);
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    res.status(500).json({ error: "Failed to fetch attendance records" });
  }
});

module.exports = router;
