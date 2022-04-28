const express = require("express");
const router = express.Router();
const Joi = require("joi");
const validateRequest = require("_middleware/validate-request");
const authorize = require("_middleware/authorize");
const recipeService = require("./recipes.service");

// routes
router.get("/test", authorize(), Test);
router.get("/search", searchRecipes);
router.get("/:id", getById);
router.put("/:id", authorize(), updateSchema, update);
router.delete("/:id", authorize(), _delete);
router.get("/", getAll);
router.post("/", authorize(), updateSchema, create);
module.exports = router;

function updateSchema(req, res, next) {
  const schema = Joi.object({
    recipeTitle: Joi.string().required(),
    category: Joi.string().required(),
    recipeSource: Joi.string().required(),
    recipeSourceData: Joi.string().allow(""),
    method: Joi.string().allow(""),
    comments: Joi.string().allow(""),
    prepTime: Joi.string().allow(""),
    cookTime: Joi.string().allow(""),
    rating: Joi.number(),
    owner_id: Joi.number().required(),
  });
  validateRequest(req, next, schema);
}

function getAll(req, res, next) {
  recipeService
    .getAll()
    .then((recipes) => res.json(recipes))
    .catch(next);
}

function getById(req, res, next) {
  recipeService
    .getById(req.params.id)
    .then((recipe) => res.json(recipe))
    .catch(next);
}

function update(req, res, next) {
  recipeService
    .update(req.params.id, req.body)
    .then((recipe) => res.json(recipe))
    .catch(next);
}

function create(req, res, next) {
  recipeService
    .create(req.body)
    .then((recipe) => res.json(recipe))
    .catch(next);
}

function _delete(req, res, next) {
  recipeService
    .delete(req.params.id)
    .then(() => res.json({ message: "Recipe deleted successfully" }))
    .catch(next);
}

function searchRecipes(req, res, next) {
  recipeService
    .searchRecipes(req.query)
    .then((result) => res.json(result))
    .catch(next);
}

function Test(req, res, next) {
  res.json("Connection to my-recipes-api successful");
}
