const User = require("../models/User");
const sharp = require("sharp");
const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");

exports.registerUser = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      dob,
      email,
      phone,
      occupation,
      qualification,
      address,
      reference,
      group,
    } = req.body;

    const photoPath = path.join(__dirname, "../uploads/", req.file.filename);
    const compressedPath = path.join(
      __dirname,
      "../uploads/",
      `compressed-${req.file.filename}`
    );

    // Only compress the image, do not remove background
    await sharp(photoPath)
      .resize(500)
      .jpeg({ quality: 70 })
      .toFile(compressedPath);
    fs.unlinkSync(photoPath);

    // QR generation
    const qrData = `${email}`;
    const qrPath = path.join(__dirname, "../uploads/", `${email}-qr.png`);
    await QRCode.toFile(qrPath, qrData);
    const newUser = new User({
      first_name,
      last_name,
      dob,
      email,
      phone,
      occupation,
      qualification,
      address,
      photo: `compressed-${req.file.filename}`,
      qr: `${email}-qr.png`,
      reference,
      group,
    });
    await newUser.save();
    res.status(200).json({ success: true, user: newUser });
  } catch (err) {
    // Handle duplicate key error for address/email
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(409).json({ error: `A user with this ${field} already exists.` });
    }
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
};
