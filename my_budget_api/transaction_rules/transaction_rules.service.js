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
  console.info(id);
  return await db.TransactionRule.findAll({
    where: { owner_id: id },
    order: [["category", "ASC"]],
  });
}

async function getById(id) {
  return await getTransactionRule(id);
}

async function create(params) {
  // validate
  if (
    await db.TransactionRule.findOne({
      where: {
        search_keywords: params.search_keywords,
        category: params.category,
      },
    })
  ) {
    return;
    //throw 'TransactionRule "' + params.narrative + '" already exists.';
  }

  // save transactionRule
  return await db.TransactionRule.create(params);
}

async function update(id, params) {
  const transactionRule = await getTransactionRule(id);

  // validate
  if (!transactionRule) throw "TransactionRule with the id does not exist.";

  // copy params to transactionRule and save
  Object.assign(transactionRule, params);
  await transactionRule.save();

  return transactionRule.get();
}

async function _delete(id) {
  const transactionRule = await getTransactionRule(id);
  await transactionRule.destroy();
}

// helper functions

async function getTransactionRule(id) {
  const transactionRule = await db.TransactionRule.findByPk(id);
  if (!transactionRule) throw "transactionRule not found";
  return transactionRule;
}
