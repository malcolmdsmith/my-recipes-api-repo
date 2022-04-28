const express = require("express");
const router = express.Router();
const Joi = require("joi");
const validateRequest = require("_middleware/validate-request");
const authorize = require("_middleware/authorize");
const recipeImageService = require("./recipe_images.service");

// routes
router.post("/", authorize(), authorizeAction, updateSchema, save);
router.get("/", getAll);
router.get("/current", getCurrent);
router.get("/mainimage/:id", getMainImage);
router.get("/recipe/:recipe_id", getRecipeImages);
router.get("/recipe/nocategory/:recipe_id", getRecipeImagesNoCategory);
router.get("/home/:imageCount", getHomeImages);
router.get("/category/:category", getImagesForKeywords);
router.get("/count", getImageCount);
router.get("/images", getImages);
router.get("/imagebyalpha", getImageByAlpha);
router.get("/mealOfTheWeek", getMealOfTheWeek);
router.put(
  "/mealOfTheWeek/:id",
  authorize(),
  authorizeAction,
  setMealOfTheWeek
);
router.get("/:id", getById);
0;
router.put("/:id", authorize(), authorizeAction, updateSchema, update);
router.delete("/:id", authorize(), authorizeAction, _delete);

module.exports = router;

async function authorizeAction(req, res, next) {
  switch (req.user.role) {
    case "guest":
      switch (req.method) {
        case "PUT":
        case "POST":
        case "DELETE":
          throw "Invalid operation.";
      }
      break;
    case "user":
      switch (req.method) {
        case "PUT":
        case "DELETE":
          await recipeImageService
            .validateRecipeImageOwner(req.params.id, req.user.id)
            .then((result) => {
              if (!result) throw "Invalid Operation";
            })
            .catch(next);
          break;
      }
      break;
    case "admin":
      //next();
      break;
  }
  next();
}

function getAll(req, res, next) {
  recipeImageService
    .getAll()
    .then((recipeImages) => res.json(recipeImages))
    .catch(next);
}

function getCurrent(req, res, next) {
  res.json(req.recipeImage);
}

function getById(req, res, next) {
  recipeImageService
    .getById(req.params.id)
    .then((recipeImage) => res.json(recipeImage))
    .catch(next);
}

function getMainImage(req, res, next) {
  recipeImageService
    .getMainImage(req.params.id)
    .then((recipeImage) => res.json(recipeImage))
    .catch(next);
}

function getRecipeImages(req, res, next) {
  recipeImageService
    .getRecipeImages(req.params.recipe_id)
    .then((images) => res.json(images))
    .catch(next);
}

function getMealOfTheWeek(req, res, next) {
  recipeImageService
    .getMealOfTheWeek()
    .then((recipe) => res.json(recipe))
    .catch(next);
}

function setMealOfTheWeek(req, res, next) {
  recipeImageService
    .setMealOfTheWeek(req.params.id)
    .then((recipeImage) => res.json(recipeImage))
    .catch(next);
}

function getRecipeImagesNoCategory(req, res, next) {
  recipeImageService
    .getRecipeImagesNoCategory(req.params.recipe_id)
    .then((images) => res.json(images))
    .catch(next);
}

function getImagesForKeywords(req, res, next) {
  recipeImageService
    .getImagesForKeywords(
      req.params.category,
      req.query.offset,
      req.query.imageCount
    )
    .then((images) => res.json(images))
    .catch(next);
}

function getHomeImages(req, res, next) {
  recipeImageService
    .getHomeImages(req.params.imageCount)
    .then((recipeImages) => res.json(recipeImages))
    .catch(next);
}

function getImages(req, res, next) {
  recipeImageService
    .getImages(req.query.offset, req.query.imageCount)
    .then((results) => res.json(results))
    .catch(next);
}

function getImageByAlpha(req, res, next) {
  recipeImageService
    .getImageByAlpha(req.query.char)
    .then((results) => res.json(results))
    .catch(next);
}

function getImageCount(req, res, next) {
  recipeImageService
    .getImageCount()
    .then((result) => res.json(result))
    .catch(next);
}

function updateSchema(req, res, next) {
  const schema = Joi.object({
    recipe_id: Joi.number().required(),
    recipe_image: Joi.string().required(),
    recipe_image_format: Joi.string().required(),
    show_main_image: Joi.boolean().required(),
    image_width: Joi.number().required(),
    image_height: Joi.number().required(),
    owner_id: Joi.number().required(),
    mealOfTheWeek: Joi.boolean().required(),
  });
  validateRequest(req, next, schema);
}

function update(req, res, next) {
  recipeImageService
    .update(req.params.id, req.body)
    .then((recipeImage) => res.json(recipeImage))
    .catch(next);
}

function save(req, res, next) {
  recipeImageService
    .create(req.body)
    .then((recipeImage) => res.json(recipeImage))
    .catch(next);
}

function _delete(req, res, next) {
  recipeImageService
    .delete(req.params.id)
    .then(() => res.json({ message: "Recipe Image deleted successfully" }))
    .catch(next);
}
