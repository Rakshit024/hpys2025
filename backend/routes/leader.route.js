const express = require("express");
const { leaderEmail, groupData, paymentDone } = require("../controllers/leader.controller");

const leaderRouter = express.Router();

leaderRouter.post("/leader-id",leaderEmail)
leaderRouter.get('/get-group-data/:email',groupData)
leaderRouter.patch('/payment-done',paymentDone)


module.exports = leaderRouter