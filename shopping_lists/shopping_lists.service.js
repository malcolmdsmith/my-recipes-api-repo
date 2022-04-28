const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("_helpers/db");
const { QueryTypes } = require("sequelize");

module.exports = {
  getById,
  create,
  update,
  delete: _delete,
  findOne,
  getAllShoppingLists,
  deleteAllByUser,
};

async function getById(id) {
  return await getShoppingList(id);
}

async function findOne(owner_id) {
  return await db.ShoppingList.findOne({ where: { owner_id: owner_id } });
}

async function getAllShoppingLists(query) {
  return await db.ShoppingList.findAll({
    where: {
      owner_id: query.owner_id,
      master_list: query.master_list,
    },
    order: [["shopping_list_name", "ASC"]],
  });
}

async function create(params) {
  // validate
  // if (
  //   await db.ShoppingList.findOne({
  //     where: {
  //       id: params.id,
  //       shoppingListName: params.shoppingListName,
  //     },
  //   })
  // ) {
  //   throw 'ShoppingList "' + params.shoppingListName + '" already exists.';
  // }

  // save shoppingList
  return await db.ShoppingList.create(params);
}

async function update(id, params) {
  const shoppingList = await getShoppingList(id);

  // validate
  if (!shoppingList) throw "ShoppingList with the id does not exist.";

  // copy params to shoppingList and save
  Object.assign(shoppingList, params);
  await shoppingList.save();

  return shoppingList.get();
}

async function deleteAllByUser(query) {
  console.info("deletingAllByUser...", query);
  try {
    db.sequelize.query(
      "CALL deleteAllShoppingItems (:ownerId, :isMaster, :listName)",
      {
        replacements: {
          ownerId: query.owner_id,
          isMaster: query.master_list,
          listName: query.shopping_list_name,
        },
      }
    );
  } catch (e) {
    throw "Call to procedure deleteAllShoppingIems failed.";
  }
}

async function _delete(query) {
  const shoppingList = await getShoppingListByName(query);
  await shoppingList.destroy();
}

// helper functions

async function getShoppingList(id) {
  const shoppingList = await db.ShoppingList.findByPk(id);
  if (!shoppingList) throw "Shopping list not found";
  return shoppingList;
}

async function getShoppingListByName(query) {
  const shoppingList = await db.ShoppingList.findOne({
    where: {
      owner_id: query.owner_id,
      shopping_list_name: query.shopping_list_name,
    },
  });
  if (!shoppingList) throw "Shopping list not found";
  return shoppingList;
}
