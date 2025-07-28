const prisma = require("../models/prisma");

async function main() {
  const leaders = [
    // HOSTEL
    // { group: "Param", email: "param.hostel527@avd.com" },
    // { group: "Pulkit", email: "pulkit.hostel198@avd.com" },
    // { group: "Pavitra", email: "pavitra.hostel603@avd.com" },
    // { group: "Parmanand", email: "parmanand.hostel741@avd.com" },

    // // VVN
    // { group: "Samp Atmiya", email: "sampatmiya.anand382@avd.com" },
    // { group: "Suhradbhav Bhoolku", email: "suhradbhoolku.anand946@avd.com" },
    // { group: "Saradata Dastva", email: "saradaradastva.anand125@avd.com" },
    // { group: "Swikar Ekta", email: "swikarekta.anand873@avd.com" },
    // {
    //   group: "Sahaj (V. V. Nagar, Karamsad, Mogari)",
    //   email: "sahaj.vvn310@avd.com",
    // },

    // // NADIAD
    // {
    //   group: "Seva (Nadiad - city)",
    //   email: "seva.nadiad654@avd.com",
    // },
    // {
    //   group: "smruti (Nadiad - city)",
    //   email: "smruti.nadiad209@avd.com",
    // },
    // {
    //   group: "Suhradbhav (Nadiad - city)",
    //   email: "suhradbhav.nadiad795@avd.com",
    // },
    // {
    //   group: "swadharm (Nadiad - city)",
    //   email: "swadharm.nadiad471@avd.com",
    // },

    {
      group: "Bhakti(Nadiyad Gramya)",
      email: "bhakti.nadiad368@avd.com",
    },
    {
      group: "Parabhakti(Nadiyad Gramya)",
      email: "parabhakti.nadiad348@avd.com",
    },
    {
      group: "Anuvruti(Nadiyad Gramya)",
      email: "anuvruti.nadiad323@avd.com",
    },
    // {
    //   group: "Mahemdavad",
    //   email: "mahemdavad.nadiad589@avd.com",
    // },
  ];

  await prisma.leaders.createMany({
    data: leaders,
  });

  console.log("✅ Group emails seeded successfully.");
}

main()
  .catch((e) => {
    console.error(" Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
