const express = require("express");
const router = express.Router();
const Joi = require("joi");
const validateRequest = require("_middleware/validate-request");
const authorize = require("_middleware/authorize");
const bankTransactionService = require("./bank_transactions.service");

// routes
router.get("/:id", getById);
router.put("/:id", authorize(), updateSchema, update);
router.delete("/:id", authorize(), _delete);
router.get("/user/:id", getAll);
router.get("/notcategorized/user/:id", getNotCategorized);
router.get("/runrules/user/:id", getRunRules);
router.post("/", updateSchema, create);
router.get("/search/user/all", search);
router.get("/lastTransaction/user/:id", getLastTransactionDate);

module.exports = router;

function updateSchema(req, res, next) {
  const schema = Joi.object({
    transDate: Joi.date().required(),
    narrative: Joi.string().required(),
    debitAmount: Joi.number().required(),
    creditAmount: Joi.number().required(),
    balance: Joi.number().required(),
    categories: Joi.string().required(),
    myBudgetCategory: Joi.string().allow(""),
    owner_id: Joi.number().required(),
  });
  validateRequest(req, next, schema);
}

function getAll(req, res, next) {
  bankTransactionService
    .getAll(req.params.id)
    .then((bankTransactions) => res.json(bankTransactions))
    .catch(next);
}

function getNotCategorized(req, res, next) {
  bankTransactionService
    .getNotCategorized(req.params.id)
    .then((bankTransactions) => res.json(bankTransactions))
    .catch(next);
}

function getRunRules(req, res, next) {
  bankTransactionService
    .getRunRules(req.params.id)
    .then((bankTransactions) => res.json(bankTransactions))
    .catch(next);
}

function getById(req, res, next) {
  bankTransactionService
    .getById(req.params.id)
    .then((bankTransaction) => res.json(bankTransaction))
    .catch(next);
}

function getLastTransactionDate(req, res, next) {
  bankTransactionService
    .getLastTransactionDate(req.params.id)
    .then((result) => res.json(result))
    .catch(next);
}

function search(req, res, next) {
  bankTransactionService
    .search(req.query)
    .then((result) => res.json(result))
    .catch(next);
}

function update(req, res, next) {
  bankTransactionService
    .update(req.params.id, req.body)
    .then((bankTransaction) => res.json(bankTransaction))
    .catch(next);
}

function create(req, res, next) {
  bankTransactionService
    .create(req.body)
    .then((bankTransaction) => res.json(bankTransaction))
    .catch(next);
}

function _delete(req, res, next) {
  bankTransactionService
    .delete(req.params.id)
    .then(() => res.json({ message: "Transaction deleted successfully" }))
    .catch(next);
}
