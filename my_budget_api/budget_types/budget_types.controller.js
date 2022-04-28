const express = require("express");
const router = express.Router();
const Joi = require("joi");
const validateRequest = require("_middleware/validate-request");
const authorize = require("_middleware/authorize");
const budgetTypeService = require("./budget_types.service");

// routes
router.get("/:id", authorize(), getById);
router.put("/:id", authorize(), updateSchema, update);
router.delete("/:id", authorize(), _delete);
router.get("/user/:id", authorize(), getAll);
router.post("/", authorize(), updateSchema, create);

module.exports = router;

function updateSchema(req, res, next) {
  const schema = Joi.object({
    category: Joi.string().required(),
    parent_category: Joi.string().allow(""),
    owner_id: Joi.number().required(),
  });
  validateRequest(req, next, schema);
}

function getAll(req, res, next) {
  budgetTypeService
    .getAll(req.params.id)
    .then((budgetTypes) => res.json(budgetTypes))
    .catch(next);
}

function getById(req, res, next) {
  budgetTypeService
    .getById(req.params.id)
    .then((budgetType) => res.json(budgetType))
    .catch(next);
}

function update(req, res, next) {
  budgetTypeService
    .update(req.params.id, req.body)
    .then((budgetType) => res.json(budgetType))
    .catch(next);
}

function create(req, res, next) {
  budgetTypeService
    .create(req.body)
    .then((budgetType) => res.json(budgetType))
    .catch(next);
}

function _delete(req, res, next) {
  budgetTypeService
    .delete(req.params.id)
    .then((result) => res.json(result))
    .catch(next);
}
