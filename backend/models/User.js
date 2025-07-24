// backend/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  dob: Date,
  email: { type: String, unique: true },
  phone: String,
  // occupation: String,
  // qualification: String,
  address: String, // allow duplicate addresses
  photo: String, // filename of compressed photo
  qr: String, // filename of generated QR code
  reference: String,
  group: String,
  createdAt: { type: Date, default: Date.now },
}, { collection: 'users' });

module.exports = mongoose.model("User", userSchema);
