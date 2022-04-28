const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("_helpers/db");
const { QueryTypes } = require("sequelize");

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: _delete,
};

async function getAll(query) {
  let sql = "";
  let where = "";

  if (query.project_id === "0") where = ` AND owner_id = ${query.owner_id}`;
  else where = ` AND project_id = ${query.project_id}`;

  sql = sql + `SELECT * FROM mytodooz_todo_items WHERE 1=1`;
  sql = sql + where;
  if (query.completed === "true") sql = sql + ` AND completed IS NOT NULL`;
  else sql = sql + ` AND completed IS NULL`;

  const results = await db.sequelize.query(
    sql,
    {
      type: QueryTypes.SELECT,
    },
    { raw: true }
  );

  return results;
}

async function getById(item_id) {
  return await getTodoItem(item_id);
}

async function create(params) {
  // validate
  if (
    await db.TodoItem.findOne({
      where: {
        todo_text: params.todo_text,
        project_id: params.project_id,
      },
    })
  ) {
    //return;
    throw (
      'TodoItem "' + params.todo_text + '" already exists for this project.'
    );
  }

  // save todoItem
  return await db.TodoItem.create(params);
}

async function update(item_id, params) {
  const todoItem = await getTodoItem(item_id);

  // validate
  if (!todoItem) throw "TodoItem with the id does not exist.";

  // copy params to todoItem and save
  Object.assign(todoItem, params);
  await todoItem.save();

  return todoItem.get();
}

async function _delete(item_id) {
  const todoItem = await getTodoItem(item_id);
  if (todoItem) await todoItem.destroy();
}

// helper functions

async function getTodoItem(item_id) {
  const todoItem = await db.TodoItem.findByPk(item_id);
  if (!todoItem) throw "TodoItem not found with Id " + item_id;
  return todoItem;
}
