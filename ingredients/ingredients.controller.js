const express = require("express");
const router = express.Router();
const Joi = require("joi");
const validateRequest = require("_middleware/validate-request");
const authorize = require("_middleware/authorize");
const ingredientService = require("./ingredients.service");

// routes
router.get("/recipe/:id", getByRecipeId);
router.get("/:id", getById);
router.put("/:id", authorize(), updateSchema, update);
router.delete("/:id", authorize(), _delete);
router.get("/", getAll);
router.post("/", authorize(), updateSchema, create);

module.exports = router;

function updateSchema(req, res, next) {
  const schema = Joi.object({
    ingredientName: Joi.string().required(),
    measure: Joi.string().required(),
    qty: Joi.number().required(),
    recipeId: Joi.number().required(),
  });
  validateRequest(req, next, schema);
}

function getAll(req, res, next) {
  ingredientService
    .getAll()
    .then((ingredients) => res.json(ingredients))
    .catch(next);
}

function getById(req, res, next) {
  ingredientService
    .getById(req.params.id)
    .then((ingredient) => res.json(ingredient))
    .catch(next);
}

function getByRecipeId(req, res, next) {
  ingredientService
    .getByRecipeId(req.params.id)
    .then((ingredients) => res.json(ingredients))
    .catch(next);
}

function update(req, res, next) {
  ingredientService
    .update(req.params.id, req.body)
    .then((ingredient) => res.json(ingredient))
    .catch(next);
}

function create(req, res, next) {
  ingredientService
    .create(req.body)
    .then((ingredient) => res.json(ingredient))
    .catch(next);
}

function _delete(req, res, next) {
  ingredientService
    .delete(req.params.id)
    .then(() => res.json({ message: "Ingredient deleted successfully" }))
    .catch(next);
}
