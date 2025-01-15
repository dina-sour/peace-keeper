const express = require("express");
const {
  createList,
  addItem,
  viewList,
  getAllItems,
  removeItemsFromList,
  clearList,
} = require("../controllers/listController");
const twilio = require("twilio");
const { WELCOME_MESSAGE } = require("./constants");
const router = express.Router();

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const sendMessage = async (to, body) => {
  try {
    await client.messages.create({
      from: `whatsapp:${TWILIO_PHONE_NUMBER}`,
      to,
      body,
    });
    console.log("Message sent successfully!");
  } catch (error) {
    console.error("Failed to send message:", error.message);
  }
};

const commands = {
  create: async (args, user, res) => {
    await createList({ body: { listName: args.join(" "), user } }, res);
    await sendMessage(user, `The list '${args.join(" ")}' has been created.`);
  },

  add: async (args, user, res) => {
    const listName = args[args.length - 1];
    const item = args.slice(0, -1).join(" ");
    await addItem({ body: { listName, item } }, res);
    await sendMessage(user, `Added '${item}' to '${listName}'.`);
  },

  view: async (args, user, res) => {
    const listName = args.join(" ");
    const list = await viewList({ body: { listName } }, res);
    if (list && list.items.length > 0) {
      await sendMessage(
        user,
        `Your list '${listName}':\n✅ ${list.items.join("\n✅ ")}`
      );
    } else {
      await sendMessage(user, `Your list '${listName}' is empty.`);
    }
  },

  "i am going to the sooper": async (args, user, res) => {
    const entireList = await getAllItems({ user });
    if (entireList && entireList.length > 0) {
      await sendMessage(user, `\n✅ ${entireList.join("\n✅ ")}`);
    } else {
      await sendMessage(user, "Your list is empty. Add some items first!");
    }
  },
  בסופר: async (args, user, res) => {
    const entireList = await getAllItems({ user });
    if (entireList && entireList.length > 0) {
      await sendMessage(user, `\n✅ ${entireList.join("\n✅ ")}`);
    } else {
      await sendMessage(user, "Your list is empty. Add some items first!");
    }
  },
  sooper: async (args, user, res) => {
    const entireList = await getAllItems({ user });
    if (entireList && entireList.length > 0) {
      await sendMessage(user, `\n✅ ${entireList.join("\n✅ ")}`);
    } else {
      await sendMessage(user, "Your list is empty. Add some items first!");
    }
  },
  bought: async (args, user, res) => {
    const listName = args[0];
    const itemsToRemove = args.slice(1);
    await removeItemsFromList({ body: { listName, itemsToRemove } }, res);
    await sendMessage(
      user,
      `🎉Bought ${itemsToRemove.join(", ")} from ${listName}🎉`
    );
  },
  help: async (args, user, res) => {
    await sendMessage(user, WELCOME_MESSAGE);
  },
  clear: async (args, user, res) => {
    await clearList({ body: { listName: args[0] } }, res);
    await sendMessage(user, `🎉Cleared list '${args[0]}'🎉`);
  },
};

router.post("/bot", async (req, res) => {
  const incomingMessage = req.body.Body?.trim();
  const user = req.body.From;

  const [command, ...args] = incomingMessage.split(" ");

  try {
    const commandFn =
      commands[command.toLowerCase()] ||
      commands[incomingMessage.toLowerCase()];

    if (commandFn) {
      await commandFn(args, user, res);
    } else {
      await sendMessage(
        user,
        "Unknown command. ask for help to get more info."
      );
    }

    return res.status(200).send("OK");
  } catch (err) {
    console.error("Error handling Twilio request:", err.message);
    await sendMessage(
      user,
      `An error occurred while processing your request: ${err.message}`
    );
    return res.status(500).send("Error");
  }
});

module.exports = router;
