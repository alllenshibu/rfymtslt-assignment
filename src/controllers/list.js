const prisma = require("../db");

const getAllLists = async (req, res) => {
  try {
    let lists = await prisma.list.findMany();

    return res.json({ lists });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

const getListById = async (req, res) => {
  try {
    const { listId } = req.params;

    if (!listId) {
      return res.status(400).json({ error: "ID is required" });
    }

    let list = await prisma.list.findUnique({
      where: {
        id: listId,
      },
      include: {
        properties: {
          select: {
            title: true,
            default: true,
          },
        },
      },
    });

    if (!list) {
      return res.status(404).json({ error: "List not found" });
    }

    let users = await prisma.user.findMany({
      where: {
        listId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        properties: {
          select: {
            value: true,
            property: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    // Move all properties to top level instead of nested objects as returned by Prisma
    for (let i = 0; i < users.length; i++) {
      let userProperties = {};

      users[i].properties.forEach((property) => {
        userProperties[property.property.title] = property.value;
      });

      users[i] = {
        name: users[i].name,
        email: users[i].email,
        ...userProperties,
      };
    }

    list.users = users;

    return res.json({ list });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

const createList = async (req, res) => {
  try {
    const { title, properties } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const listExists = await prisma.list.findFirst({
      where: {
        title,
      },
    });

    if (listExists) {
      return res.status(400).json({ error: "List already exists" });
    }

    // Transaction to make sure that either the complete process is successful or nothing is saved
    await prisma.$transaction(async (tx) => {
      const list = await tx.list.create({
        data: {
          title,
        },
      });

      for (let property in properties) {
        await tx.property.create({
          data: {
            title: property,
            default: properties[property],
            listId: list.id,
          },
        });
      }

      return res.json({ list });
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllLists,
  getListById,
  createList,
};
