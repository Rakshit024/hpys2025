const User = require("../models/User");
const Attendance = require("../models/Attendance");
const prisma = require("../models/prisma");

// Get all users with search functionality
const getAllUsers = async (req, res) => {
  try {
    const { search } = req.query;

    let where = {};

    // Search by first_name, last_name, or address (case-insensitive)
    if (search) {
      where = {
        OR: [
          { first_name: { contains: search, mode: "insensitive" } },
          { last_name: { contains: search, mode: "insensitive" } },
          { address: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    // Fetch users, exclude 'qr', sort by createdAt descending
    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: users,
      total: users.length,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};

// Get all attendance records with search and sort functionality
const getAttendanceRecords = async (req, res) => {
  try {
    const { search, day, session, sortBy } = req.query;

    let emailFilter = undefined;

    // 1. Handle user search by name/email/address
    if (search) {
      const matchedUsers = await prisma.user.findMany({
        where: {
          OR: [
            { first_name: { contains: search, mode: "insensitive" } },
            { last_name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { address: { contains: search, mode: "insensitive" } },
          ],
        },
        select: { email: true },
      });

      const emails = matchedUsers.map((u) => u.email);
      if (emails.length > 0) {
        emailFilter = { in: emails };
      } else {
        // No matches, return early
        return res.json({ success: true, data: [], total: 0 });
      }
    }

    // 2. Build filters for Attendance
    let whereClause = {};

    if (emailFilter) whereClause.email = emailFilter;
    if (day) whereClause.day = day;
    if (session) whereClause.session = session;

    // 3. Define sorting logic
    let orderBy = [{ timestamp: "desc" }]; // Default
    if (sortBy === "day") {
      orderBy = [{ day: "asc" }, { session: "asc" }, { timestamp: "desc" }];
    } else if (sortBy === "session") {
      orderBy = [{ session: "asc" }, { day: "asc" }, { timestamp: "desc" }];
    }

    // 4. Fetch attendance records
    const attendanceRecords = await prisma.attendance.findMany({
      where: whereClause,
      orderBy,
    });

    // 5. Populate user data
    const populatedRecords = await Promise.all(
      attendanceRecords.map(async (record) => {
        const user = await prisma.user.findUnique({
          where: { email: record.email },
          select: {
            id: true,
            first_name: true,
            last_name: true,
            dob: true,
            email: true,
            phone: true,
            occupation: true,
            qualification: true,
            address: true,
            photo: true,
            reference: true,
            group: true,
            createdAt: true,
            // qr is excluded
          },
        });

        return {
          id: record.id,
          email: record.email,
          day: record.day,
          session: record.session,
          timestamp: record.timestamp,
          user,
        };
      })
    );

    // 6. Send response
    res.json({
      success: true,
      data: populatedRecords,
      total: populatedRecords.length,
    });
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching attendance records",
      error: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  getAttendanceRecords,
};
