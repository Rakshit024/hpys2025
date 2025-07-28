const sharp = require("sharp");
const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");
const prisma = require("../models/prisma");

// Utility function to validate DOB
function isValidDateString(d) {
  const date = new Date(d);
  return date instanceof Date && !isNaN(date);
}

exports.registerUser = async (req, res) => {
  try {
    const {
      first_name,
      middle_name,
      last_name,
      dob,
      email,
      phone,
      address,
      city,
      reference,
      group,
      eduType,
      standard,
      stream,
      schoolName,
      collegeName,
      branch,
      semester,
    } = req.body;

    if (!dob || !isValidDateString(dob)) {
      return res
        .status(400)
        .json({ error: "Invalid or missing date of birth." });
    }

    let compressedFilename = null;

    if (req.file) {
      const photoPath = path.join(__dirname, "../uploads/", req.file.filename);
      compressedFilename = `compressed-${req.file.filename}`;
      const compressedPath = path.join(
        __dirname,
        "../uploads/",
        compressedFilename
      );

      // Compress image
      await sharp(photoPath)
        .resize(500)
        .jpeg({ quality: 70 })
        .toFile(compressedPath);
      fs.unlinkSync(photoPath);
    }

    // Generate QR code
    const qrFilename = `${email}-qr.png`;
    const qrPath = path.join(__dirname, "../uploads/", qrFilename);
    await QRCode.toFile(qrPath, email);

    const isEmailExist = !!(await prisma.user.findUnique({
      where: {
        email: email,
      },
    }));

    if (isEmailExist) {
      return res.status(400).json({ error: "Email is already exist" });
    }

    // Save to DB
    const newUser = await prisma.user.create({
      data: {
        first_name,
        middle_name,
        last_name,
        dob: new Date(dob),
        email,
        phone,
        address,
        city,
        reference,
        group,
        eduType,
        standard: standard || null,
        stream: stream || null,
        schoolName: schoolName || null,
        collegeName: collegeName || null,
        branch: branch || null,
        semester: semester || null,
        photo: compressedFilename || null,
        qr: qrFilename,
      },
    });

    return res.status(200).json({ success: true, user: newUser });
  } catch (err) {
    console.error("Registration failed:", err);
    return res
      .status(500)
      .json({ error: "Registration failed. Please check logs." });
  }
};
