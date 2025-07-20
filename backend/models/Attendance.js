const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  email: { type: String, required: true },
  day: { type: String, required: true },
  session: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Attendance", attendanceSchema);
