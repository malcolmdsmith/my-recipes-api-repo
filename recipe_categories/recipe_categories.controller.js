const express = require("express");
const router = express.Router();
const Joi = require("joi");
const validateRequest = require("_middleware/validate-request");
const authorize = require("_middleware/authorize");
const recipeCategoryService = require("./recipe_categories.service");

module.exports = router;

// routes
router.post("/", authorize(), updateSchema, save);
router.get("/list", getCategoryNames);
router.get("/", getAll);
router.get("/category/:name", getRecipeCategoryImage);
//router.get("/:name", getById);
//router.put("/:name", authorize(), authorizeAction, updateSchema, update);
router.delete("/:name", authorize(), _delete);

function updateSchema(req, res, next) {
  const schema = Joi.object({
    category_name: Joi.string().required(),
    category_image: Joi.string().required(),
    category_image_format: Joi.string().required(),
    image_width: Joi.number().required(),
    image_height: Joi.number().required(),
  });
  validateRequest(req, next, schema);
}

function getAll(req, res, next) {
  recipeCategoryService
    .getAll()
    .then((categories) => res.json(categories))
    .catch(next);
}

function getCategoryNames(req, res, next) {
  recipeCategoryService
    .getCategoryNames()
    .then((categories) => res.json(categories))
    .catch(next);
}

function getRecipeCategoryImage(req, res, next) {
  recipeCategoryService
    .getRecipeCategoryImage(req.params.name)
    .then((images) => res.json(images))
    .catch(next);
}

function save(req, res, next) {
  recipeCategoryService
    .create(req.body)
    .then((category) => res.json(category))
    .catch(next);
}

function _delete(req, res, next) {
  recipeCategoryService
    .delete(req.params.name)
    .then(() => res.json({ message: "Recipe Category deleted successfully" }))
    .catch(next);
}
