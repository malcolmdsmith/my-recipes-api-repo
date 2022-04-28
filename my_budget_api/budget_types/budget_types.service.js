const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("_helpers/db");

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: _delete,
};

async function getAll(id) {
  return await db.BudgetType.findAll({
    where: { owner_id: id },
    order: [
      // ["parent_category", "ASC"],
      ["category", "ASC"],
    ],
  });
}

async function getById(id) {
  return await getBudgetType(id);
}

async function create(params) {
  // validate
  if (
    await db.BudgetType.findOne({
      where: {
        parent_category: params.parent_category,
        category: params.category,
      },
    })
  ) {
    return;
    //throw 'BudgetType "' + params.narrative + '" already exists.';
  }

  // save budgetType
  return await db.BudgetType.create(params);
}

async function update(id, params) {
  const budgetType = await getBudgetType(id);

  // validate
  if (!budgetType) throw "BudgetType with the id does not exist.";

  // copy params to budgetType and save
  Object.assign(budgetType, params);
  await budgetType.save();

  return budgetType.get();
}

async function _delete(id) {
  const budgetType = await getBudgetType(id);
  const transactions = await checkBudgetTypeAllocated(budgetType.category);
  if (transactions === null) {
    await budgetType.destroy();
    return true;
  }
  return false;
}

function checkBudgetTypeAllocated(category) {
  return db.BankTransaction.findOne({
    where: {
      myBudgetCategory: category,
    },
  });
}

// helper functions

async function getBudgetType(id) {
  const budgetType = await db.BudgetType.findByPk(id);
  if (!budgetType) throw "BudgetType not found";
  return budgetType;
}
