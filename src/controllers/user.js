const fs = require("fs");

const Papa = require("papaparse");

const prisma = require("../db");

// const getAllUsers = async (req, res) => {
//   try {
//     let users = await prisma.user.findMany({
//       include: {
//         properties: {
//           select: {
//             value: true,
//             customProperty: true,
//           },
//         },
//       },
//     });

//     for (let i = 0; i < users.length; i++) {
//       let userProperties = {};

//       users[i].properties.forEach((property) => {
//         userProperties[property.customProperty.name] = property.value;
//       });

//       users[i] = {
//         name: users[i].name,
//         email: users[i].email,
//         ...userProperties,
//       };
//     }

//     return res.json({ users });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ error: err.message });
//   }
// };

const addUsers = async (req, res) => {
  try {
    const { listId } = req.params;

    // multer saves the file to the machine once it intercepts the request
    const file = fs.readFileSync(req.file.path);

    if (!file) {
      return res.status(400).json({ error: "CSV not found" });
    }

    let users = [];

    Papa.parse(file.toString(), {
      header: true,
      complete: (results) => {
        users = results.data;
        // Delete the file after data has been loaded
        fs.unlinkSync(req.file.path);
      },
    });

    // Checking if the custom properties provided in the CSV file actually exists in the list
    let propertyName = users[i];
    if (propertyName !== "email" && propertyName !== "name") {
      let propertyExists = await prisma.property.findFirst({
        where: { title: propertyName, listId: listId },
      });

      if (!propertyExists) {
        return res.status(400).json({
          error:
            "The custom properties provided in the CSV file does not exist in the list",
        });
      }
    }

    const numberOfUsersProvided = users.length;

    let usersAdded = [];
    let usersFailed = [];

    for (let i = 0; i < users.length; i++) {
      const email = users[i].email;
      const name = users[i].name;

      if (!email || !name) {
        continue;
      }

      let customProperties = {};

      // Move the custom properties into an object to insert into the database
      for (let propertyName in users[i]) {
        if (propertyName !== "email" && propertyName !== "name") {
          customProperties[propertyName] = users[i][propertyName];
        }
      }

      // Prevent duplicate users
      const userExists = await prisma.user.findFirst({
        where: { email },
      });

      if (userExists) {
        continue;
      }

      // Using transaction to ensure that either all of the data of one particular user is inserted or none is inserted
      await prisma.$transaction(async (tx) => {
        let user = await tx.user.create({
          data: { name, email, listId },
        });

        for (let propertyName in customProperties) {
          const propertyValue = customProperties[propertyName];

          propertyExists = await tx.property.findFirst({
            where: { title: propertyName },
          });

          // Inserting default values in case no value is provided in the CSV
          if (!propertyValue) {
            await tx.userProperty.create({
              data: {
                userId: user.id,
                propertyId: propertyExists.id,
                value: propertyExists.default,
              },
            });
          } else {
            await tx.userProperty.create({
              data: {
                userId: user.id,
                propertyId: propertyExists.id,
                value: propertyValue,
              },
            });
          }
        }

        usersAdded.push(users[i]);
      });

      // Getting a list of all users which failed to get inserted
      usersFailed = users.filter(
        (user) => !usersAdded.map((user) => user.email).includes(user.email)
      );
    }
    return res.json({
      usersAdded,
      usersFailed,
      numberOfUsersProvided,
      numberOfUsersAdded: usersAdded.length,
      numberOfUsersFailed: usersFailed.length,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  addUsers,
};
