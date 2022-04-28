const express = require("express");
const router = express.Router();
const Joi = require("joi");
const validateRequest = require("_middleware/validate-request");
const authorize = require("_middleware/authorize");
const shoppingItemService = require("./shopping_items.service");

// routes
router.get("/date/:date", authorize(), getByDate);
router.get("/:id", authorize(), getById);
router.get("/item/findone/:owner_id", authorize(), findOne);
router.get("/items/all", authorize(), getAllShoppingItems);
router.get("/item/ingredient", authorize(), findShoppingListItemIngredient);
router.get("/items/total", authorize(), getTotalCost);
router.put("/:id", authorize(), updateSchema, update);
router.get("/clear/picked", authorize(), clearPickedItems);
router.get("/update/cost", authorize(), updateCost);
router.get("/update/picked", authorize(), updateMasterListPicked);
router.get("/list/names", authorize(), getShoppingListNames);
router.delete("/:id", authorize(), _delete);
router.delete("/items/user", authorize(), deleteAllByUser);
router.post("/", authorize(), updateSchema, create);

module.exports = router;

function updateSchema(req, res, next) {
  const schema = Joi.object({
    shopping_list_name: Joi.string().required(),
    ingredientName: Joi.string().required(),
    measure: Joi.string().required(),
    qty: Joi.number().required(),
    shopping_list_date: Joi.date().required(),
    picked: Joi.bool().required(),
    cost: Joi.number(),
    owner_id: Joi.number().required(),
    master_list: Joi.bool().required(),
  });
  validateRequest(req, next, schema);
}

function getById(req, res, next) {
  shoppingItemService
    .getById(req.params.id)
    .then((shoppingItem) => res.json(shoppingItem))
    .catch(next);
}

function getByDate(req, res, next) {
  shoppingItemService
    .getByDate(req.params.date)
    .then((shoppingItems) => res.json(shoppingItems))
    .catch(next);
}

function findOne(req, res, next) {
  shoppingItemService
    .findOne(req.params.owner_id)
    .then((shoppingItem) => res.json(shoppingItem))
    .catch(next);
}

function getAllShoppingItems(req, res, next) {
  shoppingItemService
    .getAllShoppingItems(req.query)
    .then((shoppingItems) => res.json(shoppingItems))
    .catch(next);
}

function findShoppingListItemIngredient(req, res, next) {
  shoppingItemService
    .findShoppingListItemIngredient(req.query)
    .then((shoppingItems) => res.json(shoppingItems))
    .catch(next);
}

function getTotalCost(req, res, next) {
  shoppingItemService
    .getTotalCost(req.query)
    .then((total) => res.json(total))
    .catch(next);
}

function getShoppingListNames(req, res, next) {
  shoppingItemService
    .getShoppingListNames(req.query)
    .then((names) => res.json(names))
    .catch(next);
}

function clearPickedItems(req, res, next) {
  shoppingItemService
    .clearPickedItems(req.query)
    .then((total) => res.json(total))
    .catch(next);
}

function updateCost(req, res, next) {
  shoppingItemService
    .updateCost(req.query)
    .then((total) => res.json(total))
    .catch(next);
}

function updateMasterListPicked(req, res, next) {
  shoppingItemService
    .updateMasterListPicked(req.query)
    .then((total) => res.json(total))
    .catch(next);
}

function update(req, res, next) {
  shoppingItemService
    .update(req.params.id, req.body)
    .then((shoppingItem) => res.json(shoppingItem))
    .catch(next);
}

function create(req, res, next) {
  shoppingItemService
    .create(req.body)
    .then((shoppingItem) => res.json(shoppingItem))
    .catch(next);
}

function _delete(req, res, next) {
  shoppingItemService
    .delete(req.params.id)
    .then(() => res.json({ message: "Shopping item deleted successfully" }))
    .catch(next);
}

function deleteAllByUser(req, res, next) {
  shoppingItemService
    .deleteAllByUser(req.query)
    .then(() => res.json({ message: "Shopping items deleted successfully" }))
    .catch(next);
}
