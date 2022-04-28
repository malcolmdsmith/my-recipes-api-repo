const db = require("_helpers/db");
const { QueryTypes } = require("sequelize");

module.exports = {
  getAll,
  getCategoryNames,
  create,
  //update,
  delete: _delete,
  getRecipeCategoryImage,
};

async function getAll() {
  return await db.RecipeCategory.findAll({
    order: [["category_name", "ASC"]],
  });
}

async function getCategoryNames() {
  let sql = `SELECT category_name FROM recipe_categories  ORDER BY category_name; `;
  const results = await db.sequelize.query(
    sql,
    { type: QueryTypes.SELECT },
    { raw: true }
  );
  return results;
}

async function getRecipeCategoryImage(name) {
  const image = await db.RecipeCategory.findOne({
    where: { category_name: name },
    attributes: [
      ["category_image", "image"],
      ["category_image_format", "image_format"],
      "image_width",
      "image_height",
    ],
  });
  return image;
}

async function create(params) {
  // save Category
  const category = await db.RecipeCategory.findOne({
    where: { category_name: params.category_name },
  });
  // validate
  if (category) throw "Category with the name already exists.";

  const result = await db.RecipeCategory.create(params);
  return result;
}

async function _delete(name) {
  const category = await db.RecipeCategory.findOne({
    where: { category_name: name },
  });
  await category.destroy();
}
