const prisma = require("../db");

const { sendMail } = require("../lib/mail");

const MAIL_FROM = `Mathongo Backend Intern Assignment <${process.env.SMTP_USER}>`;

const sendMailToList = async (req, res) => {
  try {
    const { listId } = req.params;

    const { subject, body } = req.body;

    if (!subject || !body) {
      return res.status(400).json({ error: "Subject and body are required" });
    }

    const listExists = await prisma.list.findUnique({
      where: { id: listId },
    });

    if (!listExists) {
      return res.status(400).json({ error: "List does not exist" });
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

    // Fetching custom property list to replace in the email body
    const properties = await prisma.property.findMany({
      where: {
        listId: listId,
      },
    });

    let usersSuccessfullySent = [];

    for (let user of users) {
      let text = body;

      text = text.replace(`[email]`, user.email);
      text = text.replace(`[name]`, user.name);

      for (let property of properties) {
        text = text.replace(`[${property.title}]`, user[property.title]);
      }

      sendMail({
        from: MAIL_FROM,
        to: user.email,
        subject,
        text,
      });
      usersSuccessfullySent.push(user.email);
    }

    let usersFailedToSend = users.filter(
      (user) => !usersSuccessfullySent.includes(user.email)
    );

    return res.status(200).json({
      message: "Emails sent successfully",
      usersFailedToSend,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { sendMailToList };
