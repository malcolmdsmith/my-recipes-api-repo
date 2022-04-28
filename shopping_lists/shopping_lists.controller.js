const express = require("express");
const router = express.Router();
const Joi = require("joi");
const validateRequest = require("_middleware/validate-request");
const authorize = require("_middleware/authorize");
const shoppingListService = require("./shopping_lists.service");

// routes
router.get("/:id", authorize(), getById);
router.get("/item/findone/:owner_id", authorize(), findOne);
router.get("/lists/all", authorize(), getAllShoppingLists);
router.put("/:id", authorize(), updateSchema, update);
router.delete("/", authorize(), _delete);
router.delete("/items/user", authorize(), deleteAllByUser);
router.post("/", authorize(), updateSchema, create);

module.exports = router;

function updateSchema(req, res, next) {
  const schema = Joi.object({
    shopping_list_name: Joi.string().required(),
    owner_id: Joi.number().required(),
    master_list: Joi.bool().required(),
  });
  validateRequest(req, next, schema);
}

function getById(req, res, next) {
  shoppingListService
    .getById(req.params.id)
    .then((shoppingItem) => res.json(shoppingItem))
    .catch(next);
}

function findOne(req, res, next) {
  shoppingListService
    .findOne(req.params.owner_id)
    .then((shoppingItem) => res.json(shoppingItem))
    .catch(next);
}

function getAllShoppingLists(req, res, next) {
  shoppingListService
    .getAllShoppingLists(req.query)
    .then((shoppingItems) => res.json(shoppingItems))
    .catch(next);
}

function update(req, res, next) {
  shoppingListService
    .update(req.params.id, req.body)
    .then((shoppingItem) => res.json(shoppingItem))
    .catch(next);
}

function create(req, res, next) {
  shoppingListService
    .create(req.body)
    .then((shoppingItem) => res.json(shoppingItem))
    .catch(next);
}

function _delete(req, res, next) {
  shoppingListService
    .delete(req.query)
    .then(() => res.json({ message: "Shopping item deleted successfully" }))
    .catch(next);
}

function deleteAllByUser(req, res, next) {
  shoppingListService
    .deleteAllByUser(req.query)
    .then(() => res.json({ message: "Shopping items deleted successfully" }))
    .catch(next);
}
