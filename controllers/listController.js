const List = require("../models/list");

module.exports = {
  createList: async (req, res) => {
    const { listName, user } = req.body;

    try {
      const newList = new List({ name: listName, createdBy: user });
      await newList.save();
      return newList;
    } catch (err) {
      console.error("Error creating list:", err);
      throw err;
    }
  },

  addItem: async (req, res) => {
    const { listName, item } = req.body;

    try {
      const list = await List.findOne({ name: listName });
      if (!list) throw new Error(`List "${listName}" not found!`);

      list.items.push(item);
      await list.save();
      return list;
    } catch (err) {
      console.error("Error adding item to list:", err);
      throw err;
    }
  },

  viewList: async (req, res) => {
    const { listName } = req.body;

    try {
      const list = await List.findOne({ name: listName }).lean();
      if (!list) throw new Error(`List "${listName}" not found!`);
      return list;
    } catch (err) {
      console.error("Error viewing list:", err);
      throw err;
    }
  },

  getAllItems: async (req, res) => {
    try {
      const lists = await List.find({});
      return lists.map((list) => list.items).flat();
    } catch (err) {
      console.error("Error getting entire list:", err);
      throw err;
    }
  },

  removeItemsFromList: async (req, res) => {
    const { listName, itemsToRemove } = req.body;
    const list = await List.findOne({ name: listName });
    list.items = list.items.filter((item) => !itemsToRemove.includes(item));
    await list.save();
    return list;
  },
  clearList: async (req, res) => {
    const { listName } = req.body;
    const list = await List.findOne({ name: listName });
    list.items = [];
    await list.save();
    return list;
  },
};
