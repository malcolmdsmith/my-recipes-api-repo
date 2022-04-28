const express = require("express");
const router = express.Router();
const Joi = require("joi");
const validateRequest = require("_middleware/validate-request");
const authorize = require("_middleware/authorize");
const todoItemService = require("./todo_items.service");

// routes
router.get("/:item_id", authorize(), getById);
router.put("/:item_id", authorize(), updateSchema, update);
router.delete("/:item_id", authorize(), _delete);
router.get("/user/all", getAll);
router.post("/", authorize(), updateSchema, create);

module.exports = router;

function updateSchema(req, res, next) {
  const schema = Joi.object({
    todo_text: Joi.string().max(255).required(),
    project_id: Joi.number().required(),
    due_date: Joi.date(),
    completed: Joi.date(),
    owner_id: Joi.number().required(),
  });
  validateRequest(req, next, schema);
}

function getAll(req, res, next) {
  todoItemService
    .getAll(req.query)
    .then((todoItems) => res.json(todoItems))
    .catch(next);
}

function getById(req, res, next) {
  todoItemService
    .getById(req.params.item_id)
    .then((todoItem) => res.json(todoItem))
    .catch(next);
}

function update(req, res, next) {
  todoItemService
    .update(req.params.item_id, req.body)
    .then((todoItem) => res.json(todoItem))
    .catch(next);
}

function create(req, res, next) {
  todoItemService
    .create(req.body)
    .then((todoItem) => res.json(todoItem))
    .catch(next);
}

function _delete(req, res, next) {
  todoItemService
    .delete(req.params.item_id)
    .then((result) => res.json(result))
    .catch(next);
}
