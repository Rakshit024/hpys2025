// scripts/listUsers.js
const mongoose = require("mongoose");
const User = require("./models/User.js");

mongoose.connect("mongodb://localhost:27017/3didapp").then(async () => {
  const users = await User.find({});
  console.log(users);
  process.exit();
});
