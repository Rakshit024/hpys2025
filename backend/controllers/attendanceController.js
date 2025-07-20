const Attendance = require("../models/Attendance");
const User = require('../models/User')

exports.markAttendance = async (req, res) => {
  const { email, day, session } = req.body;
  if (!email || !day || !session) {
    return res.status(400).json({ message: "All fields required" });
  }

  const exists = await Attendance.findOne({ email, day, session });
  if (exists) {
    return res.status(409).json({ message: "Already marked" });
  }

  const record = new Attendance({ email, day, session });
  const photo = await User.findOne({email:email})
  await record.save();
  const formetedData = {
    ...record,
    photo_url:photo.photo
  }
  res.status(201).json({ message: "Attendance marked", formetedData });
};
