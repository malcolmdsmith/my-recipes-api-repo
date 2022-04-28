const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("_helpers/db");
const { QueryTypes } = require("sequelize");

module.exports = {
  getById,
  create,
  update,
  delete: _delete,
  getByDate,
  findOne,
  getAllShoppingItems,
  deleteAllByUser,
  getTotalCost,
  findShoppingListItemIngredient,
  clearPickedItems,
  getShoppingListNames,
  updateCost,
  updateMasterListPicked,
};

async function getById(id) {
  return await getShoppingItem(id);
}

async function getByDate(date) {
  return await db.ShoppingItem.findAll({ where: { shopping_list_date: date } });
}

async function findOne(owner_id) {
  return await db.ShoppingItem.findOne({ where: { owner_id: owner_id } });
}

async function getAllShoppingItems(query) {
  if (query.runClearAndPicked === "true") {
    await clearPickedItems(query);
    await updateMasterListPicked(query);
  }

  let sql = `SELECT * FROM (SELECT 1 as ord, si.*, (SELECT SUM(qty * cost) AS totalCost FROM shopping_items WHERE owner_id = ${query.owner_id} AND master_list = true AND shopping_list_name = 'master') as totalCost`;
  sql += ` FROM shopping_items si WHERE owner_id = ${query.owner_id} AND master_list = true AND shopping_list_name = 'master'`;
  sql += ` UNION ALL`;
  sql += ` SELECT 2 as ord, sp.*, (SELECT SUM(qty * cost) AS totalCost FROM shopping_items WHERE owner_id = ${query.owner_id} AND master_list = false AND shopping_list_name = '${query.shopping_list_name}') as totalCost`;
  sql += ` FROM shopping_items sp WHERE owner_id = ${query.owner_id} AND master_list = false AND shopping_list_name = '${query.shopping_list_name}'`;
  sql += ` ) a ORDER BY ord, picked, ingredientName;`;

  const result = await db.sequelize.query(sql, {
    type: QueryTypes.SELECT,
  });

  return result;
}

async function getTotalCost(query) {
  sql = `SELECT SUM(qty * cost) AS totalCost FROM shopping_items `;
  sql += `WHERE owner_id = ${query.owner_id} AND master_list = ${query.master_list} AND shopping_list_name='${query.shopping_list_name}'`;

  const total = await db.sequelize.query(sql, {
    type: QueryTypes.SELECT,
  });

  return total;
}

async function getShoppingListNames(query) {
  sql = `SELECT DISTINCT shopping_list_name FROM shopping_items `;
  sql += `WHERE owner_id = ${query.owner_id} AND master_list = 0`;

  const names = await db.sequelize.query(sql, {
    type: QueryTypes.SELECT,
  });

  return names;
}

async function clearPickedItems(query) {
  sql = `UPDATE shopping_items SET picked = 0 `;
  sql += `WHERE owner_id = ${query.owner_id} AND master_list = ${query.master_list}`;

  const [resuilts, metadata] = await db.sequelize.query(sql);

  return metadata;
}

async function findShoppingListItemIngredient(query) {
  return await db.ShoppingItem.findAll({
    where: {
      owner_id: query.owner_id,
      master_list: query.master_list,
      shopping_list_name: query.shopping_list_name,
      ingredientName: query.ingredient,
    },
    order: [
      ["picked", "ASC"],
      ["ingredientName", "ASC"],
    ],
  });
}

async function updateCost(query) {
  sql = `UPDATE shopping_items SET cost = ${query.cost} WHERE id != ${query.id} and owner_id = ${query.owner_id}`;
  sql += ` and ingredientName = '${query.ingredient}' and cost = 0`;

  console.info("=================", sql);
  const [results, metadata] = await db.sequelize.query(sql);

  return metadata;
}

async function updateMasterListPicked(query) {
  let sql = `UPDATE shopping_items SET picked = true  WHERE master_list = true`;
  sql += ` and ingredientName in (select * FROM (select ingredientName FROM shopping_items `;
  sql += ` WHERE owner_id = ${query.owner_id} and shopping_list_name = '${query.shopping_list_name}') as t)`;

  const [resuilts, metadata] = await db.sequelize.query(sql);

  return metadata;
}

async function create(params) {
  // validate
  // if (
  //   await db.ShoppingItem.findOne({
  //     where: {
  //       id: params.id,
  //       shoppingItemName: params.shoppingItemName,
  //     },
  //   })
  // ) {
  //   throw 'ShoppingItem "' + params.shoppingItemName + '" already exists.';
  // }

  // save shoppingItem
  return await db.ShoppingItem.create(params);
}

async function update(id, params) {
  const shoppingItem = await getShoppingItem(id);

  // validate
  if (!shoppingItem) throw "ShoppingItem with the id does not exist.";

  // copy params to shoppingItem and save
  Object.assign(shoppingItem, params);
  await shoppingItem.save();

  return shoppingItem.get();
}

async function deleteAllByUser(query) {
  console.info("deletingAllByUser...", query);
  try {
    db.sequelize.query(
      "CALL deleteAllShoppingItems (:id, :isMaster, :listName)",
      {
        replacements: {
          id: query.owner_id,
          isMaster: query.master_list,
          listName: query.shopping_list_name,
        },
      }
    );
  } catch (e) {
    throw "Call to procedure deleteAllShoppingIems failed.";
  }
}

async function _delete(id) {
  const shoppingItem = await getShoppingItem(id);
  await shoppingItem.destroy();
}

// helper functions

async function getShoppingItem(id) {
  const shoppingItem = await db.ShoppingItem.findByPk(id);
  if (!shoppingItem) throw "Shopping item not found";
  return shoppingItem;
}
