const express = require("express");
const multer = require("multer");
const path = require("path");
const prisma = require('../models/prisma');
const {
  registerUser,
  getUserByEmail,
} = require("../controllers/userController");
const User = require("../models/User"); // ✅ only once
const router = express.Router(); // ✅ declared only once

const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

router.post("/register", upload.single("photo"), registerUser);
router.get("/getUserByEmail", async (req, res) => {
  const rawEmail = req.query.email;
  const email = decodeURIComponent(rawEmail || "").toLowerCase();

  if (!email){ return res.status(400).send("Email required");}

  try {
    console.log("Looking for email:", email);

    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive' // case-insensitive match
        }
      }
    });

    if (!user) {
      console.log("User not found for:", email);
      return res.status(404).send("User not found");
    }

    console.log("User found:", user);
    res.json(user);
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).send("Server error");
  }
});
router.get("/getAllUsers", async (req, res) => {
  const count = await User.countDocuments();
  res.json({ count });
});

module.exports = router;
