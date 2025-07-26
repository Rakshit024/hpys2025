const prisma = require("../models/prisma");
exports.leaderEmail = async (req, res) => {
  try {
    const { email } = req.body;

    //First check the email is exist or not

    const isExistEmail = await prisma.leaders.findUnique({
      where: {
        email: email,
      },
    });

    if (isExistEmail === null) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    return res.status(200).json({ success: true, data: isExistEmail });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server Error" });
  }
};
exports.groupData = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await prisma.leaders.findUnique({
      where: { email },
      select: {
        email: true,
        group: true, // assuming schema field is `group_name`
      },
    });

    if (user === null) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const data = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        group: user.group,
      },
      select: {
        id: true,
        first_name: true,
        middle_name: true,
        last_name: true,
        address: true,
        group: true,
        email: true,
        phone: true,
        city: true,
        payment_status: true, //boolean
      },
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server Error" });
  }
};

exports.paymentDone = async (req, res) => {
  try {
    const { payment_status, id } = req.body;

    if (payment_status === null || payment_status === undefined) {
      return res.status(400).json({ error: "Pyament status is required" });
    }

    console.log(payment_status, id);

    const changeStatus = await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        payment_status: payment_status,
      },
    });
    return res.status(200).json({ success: true, data: changeStatus });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server Error" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Id is required" });
    }

    const deletedId = await prisma.user.delete({
      where: {
        id: id,
      },
      select: {
        id: true,
      },
    });
    return res.status(200).json({ success: true, deletedId });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server Error" });
  }
};
