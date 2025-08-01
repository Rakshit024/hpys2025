const express = require("express");
const {
  leaderEmail,
  groupData,
  paymentDone,
  deleteUser,
  groupDataController,
  takeAttendance,
  registerNewUser
} = require("../controllers/leader.controller");

const leaderRouter = express.Router();

leaderRouter.post("/leader-id", leaderEmail);
leaderRouter.get("/get-group-data/:email", groupData);
leaderRouter.patch("/payment-done", paymentDone);
leaderRouter.delete("/delete-user/:id", deleteUser);
leaderRouter.get("/get-data/:group", groupDataController);
leaderRouter.post("/take-attendance", takeAttendance);
leaderRouter.post('/register-user',registerNewUser)

module.exports = leaderRouter;
