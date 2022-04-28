const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("_helpers/db");
const { QueryTypes } = require("sequelize");

module.exports = {
  getAll,
  getById,
  getNotCategorized,
  create,
  update,
  delete: _delete,
  search,
  getLastTransactionDate,
  getRunRules,
};

async function getAll(id) {
  return await db.BankTransaction.findAll({ where: { owner_id: id } });
}

async function getLastTransactionDate(id) {
  return await db.BankTransaction.findOne({
    where: { owner_id: id },
    order: [["transDate", "DESC"]],
  });
}

async function getById(id) {
  return await getBankTransaction(id);
}

async function getNotCategorized(id) {
  const bankTransactions = await db.BankTransaction.findAll({
    where: {
      owner_id: id,
      myBudgetCategory: "",
    },
    order: [
      ["transDate", "ASC"],
      ["balance", "DESC"],
    ],
  });
  return bankTransactions;
}

async function getRunRules(id) {
  let sql = `SELECT * FROM (`;
  sql += `SELECT bt.id, bt.transDate, bt.narrative, bt.debitAmount, bt.creditAmount, bt.balance, bt.categories, bt.owner_id, tr.category as myBudgetCategory `;
  sql += ` FROM mymoney_bank_transactions bt JOIN mymoney_transaction_rules tr `;
  sql += ` ON INSTR(UCASE(bt.narrative), UCASE(tr.search_keywords)) >0 AND IF(tr.amount = 0, true, IF(bt.debitAmount = tr.Amount OR bt.creditAmount = tr.amount,true,false))`;
  sql += ` WHERE bt.owner_id = ${id} and bt.myBudgetCategory = ""`;
  sql += ` UNION ALL`;
  sql += ` SELECT mb.id, mb.transDate, mb.narrative, mb.debitAmount, mb.creditAmount, mb.balance, mb.categories, mb.owner_id, '' as myBudgetCategory FROM mymoney_bank_transactions mb WHERE`;
  sql += ` mb.owner_id = ${id} and mb.myBudgetCategory = "" and mb.id NOT IN (`;
  sql += ` SELECT bt.id FROM mymoney_bank_transactions bt JOIN mymoney_transaction_rules tr `;
  sql += ` ON INSTR(UCASE(bt.narrative), UCASE(tr.search_keywords)) >0 AND IF(tr.amount = 0, true, IF(bt.debitAmount = tr.Amount OR bt.creditAmount = tr.amount,true,false))`;
  sql += ` WHERE bt.owner_id = ${id} and bt.myBudgetCategory = "")`;
  sql += `) a `;
  sql += ` order by transDate, balance DESC;`;

  const transactions = await db.sequelize.query(sql, {
    type: QueryTypes.SELECT,
    model: db.BankTransaction,
    mapToModel: true,
  });

  return transactions;
}

async function search(query) {
  let sql = "";
  let whereclause = "";
  let replacements = [];

  let offset = (query.currentPage - 1) * query.pageSize;

  whereclause = "owner_id = ?";
  replacements.push(parseInt(query.owner_id));

  if (query.dateFrom != "" && query.dateTo != "") {
    whereclause += ` AND (transDate Between ? and ?) `;
    replacements.push(query.dateFrom);
    replacements.push(query.dateTo);
  }
  if (query.category != "") {
    whereclause += ` AND myBudgetCategory = ?`;
    replacements.push(query.category);
  }
  if (parseFloat(query.amountFrom) === 0 && parseFloat(query.amountTo) === 0) {
  } else {
    console.info("amountFrom");
    whereclause += ` AND ((debitAmount >= ? and debitAmount <= ?) OR`;
    whereclause += ` (creditAmount >= ? and creditAmount <= ?))`;
    replacements.push(parseFloat(query.amountFrom));
    replacements.push(parseFloat(query.amountTo));
    replacements.push(parseFloat(query.amountFrom));
    replacements.push(parseFloat(query.amountTo));
  }
  if (query.keywords != "") {
    whereclause += ` AND narrative Like ?`;
    replacements.push(`%${query.keywords}%`);
  }

  sql = `SELECT count(id) as itemsCount FROM mymoney_bank_transactions`;
  sql += ` WHERE ${whereclause}`;
  console.info(sql);
  const results = await db.sequelize.query(
    sql,
    { replacements: replacements, type: QueryTypes.SELECT },
    { raw: true }
  );
  let itemsCount = parseInt(results[0].itemsCount);

  let transactions = [];
  if (query.countOnly === "false") {
    sql = `SELECT DISTINCT mymoney_bank_transactions.* FROM mymoney_bank_transactions WHERE ${whereclause} `;
    sql += ` ORDER BY mymoney_bank_transactions.transDate LIMIT ${offset},${query.pageSize}`;
    transactions = await db.sequelize.query(sql, {
      replacements: replacements,
      type: QueryTypes.SELECT,
      model: db.BankTransaction,
      mapToModel: true,
    });
  }
  let searchResults = {};
  searchResults.totalCount = itemsCount;
  searchResults.transactions = transactions;

  return searchResults;
}

async function create(params) {
  // validate
  if (
    await db.BankTransaction.findOne({
      where: {
        transDate: params.transDate,
        narrative: params.narrative,
        balance: params.balance,
      },
    })
  ) {
    return;
    //throw 'BankTransaction "' + params.narrative + '" already exists.';
  }

  // save bankTransaction
  return await db.BankTransaction.create(params);
}

async function update(id, params) {
  const bankTransaction = await getBankTransaction(id);

  // validate
  if (!bankTransaction) throw "BankTransaction with the id does not exist.";

  // copy params to bankTransaction and save
  Object.assign(bankTransaction, params);
  await bankTransaction.save();

  return bankTransaction.get();
}

async function _delete(id) {
  const bankTransaction = await getBankTransaction(id);
  await bankTransaction.destroy();
}

// helper functions

async function getBankTransaction(id) {
  const bankTransaction = await db.BankTransaction.findByPk(id);
  if (!bankTransaction) throw "bankTransaction not found";
  return bankTransaction;
}
