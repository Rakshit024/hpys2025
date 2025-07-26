const express = require("express");
const mongoose = require("mongoose");
const path = require('path')
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const adminRoutes = require("./routes/adminRoutes");
const leaderRouter = require('./routes/leader.route')


require("dotenv").config();

const app = express();
app.use(
  cors({
    origin: [`${process.env.FRONTEND_URL}`], // allow frontend
    credentials: true,
  })
);

app.use(express.json());
app.use("/api/attendance", attendanceRoutes);
app.use("/api/admin", adminRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api", userRoutes);
app.use('/api/leader',leaderRouter)

// Serve static files from the React build
app.use(express.static(path.join(__dirname, 'view/dist')));

// Handle all other routes by serving the React app
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'view/dist/index.html'));
});



app.listen(5000, "0.0.0.0", () => console.log("Server running on port http://localhost:5000"));
