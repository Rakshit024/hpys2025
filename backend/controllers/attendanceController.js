const prisma = require("../models/prisma")

exports.markAttendance = async (req, res) => {
  const { email, day, session } = req.body;

  // 1. Check for missing fields
  if (!email || !day || !session) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    // 2. Check if attendance already exists
    const exists = await prisma.attendance.findFirst({
      where: {
        email,
        day,
        session
      }
    });

    if (exists) {
      return res.status(409).json({ message: "Already marked" });
    }

    // 3. Insert attendance record
    const record = await prisma.attendance.create({
      data: { email, day, session }
    });

    // 4. Get user's photo by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { photo: true }
    });

    // 5. Format response
    const formattedData = {
      ...record,
      photo_url: user?.photo || null
    };

    res.status(201).json({
      message: "Attendance marked",
      formattedData
    });

  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};
