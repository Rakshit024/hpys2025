const express = require("express");
const { leaderEmail, groupData, paymentDone, deleteUser } = require("../controllers/leader.controller");

const leaderRouter = express.Router();

leaderRouter.post("/leader-id",leaderEmail)
leaderRouter.get('/get-group-data/:email',groupData)
leaderRouter.patch('/payment-done',paymentDone)
leaderRouter.delete('/delete-user/:id',deleteUser)


module.exports = leaderRouter