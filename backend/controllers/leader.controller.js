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

exports.groupDataController = async (req, res) => {
  try {
    const { group } = req.params;
    const { session } = req.query;

    console.log(group);

    if (!group || !session) {
      return res.status(400).json({ error: "Group and Session are required" });
    }

    const whereClause = group.toLowerCase() === "all" ? {} : { group };

    const user = await prisma.hpysReg.findMany({
      orderBy: {
        id: "desc",
      },
      where: whereClause,
      select: {
        id: true,
        full_name: true,
        phone: true,
        reference: true,
        [session]: true, // Dynamic session column
        group:true
      },
    });

    console.log(user);

    if (!user || user.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No users found" });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("groupDataController error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.takeAttendance = async (req, res) => {
  try {
    const { id, session, value } = req.body;

    if (!session || !id) {
      return res
        .status(400)
        .json({ success: false, message: "session or id is required" });
    }

    // Allowed session fields to update
    const allowedSessions = ["s1", "s2", "s3", "s4", "s5"];

    if (!allowedSessions.includes(session)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid session field" });
    }

    await prisma.hpysReg.update({
      where: {
        id: id,
      },
      data: {
        [session]: value,
      },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server Error" });
  }
};

const allowedGroups = [
  "Param",
  "Pavitra",
  "Pulkit",
  "Paramanand",
  "Samp",
  "Atmiya",
  "Suhradbhav",
  "Bhulku",
  "Saradta",
  "Dasatva",
  "Swikar",
  "Ekta",
  "Sahaj",
  "Seva Nadiad",
  "Smruti Nadiad",
  "Suhradbhav Nadiad",
  "Swadharma Nadiad",
  "Bhakti Zone",
  "Parabhakti Zone",
  "Anuvrutti Zone",
  "Mahemdavad",
];

exports.registerNewUser = async (req, res) => {
  try {
    const { full_name, phone, reference, group } = req.body;

    // Basic field validations
    if (
      !full_name ||
      typeof full_name !== "string" ||
      full_name.trim() === ""
    ) {
      return res.status(400).json({ message: "Full name is required" });
    }

    if (!phone || !/^\d{10}$/.test(phone)) {
      return res
        .status(400)
        .json({ message: "Valid 10-digit phone number is required" });
    }

    if (
      !reference ||
      typeof reference !== "string" ||
      reference.trim() === ""
    ) {
      return res.status(400).json({ message: "Reference is required" });
    }

    if (!group || !allowedGroups.includes(group)) {
      return res.status(400).json({ message: "Invalid group selected" });
    }

    const user = await prisma.hpysReg.create({
      data: {
        full_name: full_name,
        group: group,
        reference: reference,
        phone: phone,
      },
    });

    return res
      .status(200)
      .json({ success: true, message: "User registered successfully", user });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
