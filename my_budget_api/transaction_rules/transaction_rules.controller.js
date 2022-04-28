const express = require("express");
const router = express.Router();
const Joi = require("joi");
const validateRequest = require("_middleware/validate-request");
const authorize = require("_middleware/authorize");
const transactionRuleService = require("./transaction_rules.service");

// routes
router.get("/:id", authorize(), getById);
router.put("/:id", authorize(), updateSchema, update);
router.delete("/:id", authorize(), _delete);
router.get("/user/:id", authorize(), getAll);
router.post("/", updateSchema, create);

module.exports = router;

function updateSchema(req, res, next) {
  const schema = Joi.object({
    search_keywords: Joi.string().required(),
    category: Joi.string().required(),
    amount: Joi.number(),
    owner_id: Joi.number().required(),
  });
  validateRequest(req, next, schema);
}

function getAll(req, res, next) {
  transactionRuleService
    .getAll(req.params.id)
    .then((transactionRules) => res.json(transactionRules))
    .catch(next);
}

function getById(req, res, next) {
  transactionRuleService
    .getById(req.params.id)
    .then((transactionRule) => res.json(transactionRule))
    .catch(next);
}

function update(req, res, next) {
  transactionRuleService
    .update(req.params.id, req.body)
    .then((transactionRule) => res.json(transactionRule))
    .catch(next);
}

function create(req, res, next) {
  transactionRuleService
    .create(req.body)
    .then((transactionRule) => res.json(transactionRule))
    .catch(next);
}

function _delete(req, res, next) {
  transactionRuleService
    .delete(req.params.id)
    .then(() => res.json({ message: "Transaction Rule deleted successfully" }))
    .catch(next);
}
