const User = require("../models/User");
const Attendance = require("../models/Attendance");

// Get all users with search functionality
const getAllUsers = async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = {};
    
    // Search by name, last name, middle name, or address
    if (search) {
      query = {
        $or: [
          { first_name: { $regex: search, $options: 'i' } },
          { last_name: { $regex: search, $options: 'i' } },
          { address: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    const users = await User.find(query).select('-qr').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: users,
      total: users.length
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message
    });
  }
};

// Get all attendance records with search and sort functionality
const getAttendanceRecords = async (req, res) => {
  try {
    const { search, day, session, sortBy } = req.query;
    
    let query = {};
    
    // Search by user details
    if (search) {
      const users = await User.find({
        $or: [
          { first_name: { $regex: search, $options: 'i' } },
          { last_name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { address: { $regex: search, $options: 'i' } }
        ]
      }).select('email');
      
      const userEmails = users.map(user => user.email);
      query.email = { $in: userEmails };
    }
    
    // Filter by day
    if (day) {
      query.day = day;
    }
    
    // Filter by session
    if (session) {
      query.session = session;
    }
    
    let sortOptions = { timestamp: -1 }; // Default sort by timestamp descending
    
    // Custom sorting
    if (sortBy === 'day') {
      sortOptions = { day: 1, session: 1, timestamp: -1 };
    } else if (sortBy === 'session') {
      sortOptions = { session: 1, day: 1, timestamp: -1 };
    }
    
    const attendanceRecords = await Attendance.find(query).sort(sortOptions);
    
    // Populate user details for each attendance record
    const populatedRecords = await Promise.all(
      attendanceRecords.map(async (record) => {
        const user = await User.findOne({ email: record.email }).select('-qr');
        return {
          _id: record._id,
          email: record.email,
          day: record.day,
          session: record.session,
          timestamp: record.timestamp,
          user: user
        };
      })
    );
    
    res.json({
      success: true,
      data: populatedRecords,
      total: populatedRecords.length
    });
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching attendance records",
      error: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  getAttendanceRecords
}; 