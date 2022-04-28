const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("_helpers/db");

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: _delete,
  getByRecipeId,
};

async function getAll() {
  return await db.Ingredient.findAll();
}

async function getById(id) {
  return await getIngredient(id);
}

async function getByRecipeId(id) {
  return await db.Ingredient.findAll({ where: { recipeId: id } });
}

async function create(params) {
  // validate
  if (
    await db.Ingredient.findOne({
      where: {
        recipeId: params.recipeId,
        ingredientName: params.ingredientName,
      },
    })
  ) {
    throw 'Ingredient "' + params.ingredientName + '" already exists.';
  }

  // save ingredient
  return await db.Ingredient.create(params);
}

async function update(id, params) {
  const ingredient = await getIngredient(id);

  // validate
  if (!ingredient) throw "Ingredient with the id does not exist.";

  // copy params to ingredient and save
  Object.assign(ingredient, params);
  await ingredient.save();

  return ingredient.get();
}

async function _delete(id) {
  const ingredient = await getIngredient(id);
  await ingredient.destroy();
}

// helper functions

async function getIngredient(id) {
  const ingredient = await db.Ingredient.findByPk(id);
  if (!ingredient) throw "ingredient not found";
  return ingredient;
}
