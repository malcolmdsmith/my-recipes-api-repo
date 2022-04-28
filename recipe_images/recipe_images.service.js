const db = require("_helpers/db");
const { QueryTypes } = require("sequelize");

module.exports = {
  getAll,
  getById,
  getMainImage,
  create,
  update,
  delete: _delete,
  validateRecipeImageOwner,
  getHomeImages,
  getImages,
  getImageCount,
  getImageByAlpha,
  getRecipeImages,
  getImagesForCategory,
  getImagesForKeywords,
  getRecipeImagesNoCategory,
  getMealOfTheWeek,
  setMealOfTheWeek,
};

async function getAll() {
  return await db.RecipeImage.findAll();
}

async function getById(id) {
  return await getRecipeImage(id);
}

async function getMainImage(recipe_id) {
  const image = await db.RecipeImage.findOne({
    where: { recipe_id: recipe_id, show_main_image: true },
  });
  return image;
}

async function getMealOfTheWeek() {
  return await db.RecipeImage.findOne({
    where: { mealOfTheWeek: 1 },
    attributes: [
      ["image_id", "image_id"],
      ["recipe_image", "image"],
      ["recipe_image_format", "image_format"],
      "image_width",
      "image_height",
      "recipe_id",
    ],
  });
}

async function setMealOfTheWeek(id) {
  try {
    db.sequelize.query("CALL setMealOfTheWeek (:id)", {
      replacements: { id: id },
    });
    return true;
  } catch (e) {
    throw "Call to procedure setMealOfTheWeek failed.";
  }
}

async function getRecipeImagesNoCategory(recipe_id) {
  const images = await db.RecipeImage.findAll({
    where: { recipe_id: recipe_id },
    order: [["image_id", "DESC"]],
    attributes: [
      ["image_id", "image_id"],
      ["recipe_image", "image"],
      ["recipe_image_format", "image_format"],
      "image_width",
      "image_height",
    ],
  });
  return images;
}

async function getRecipeImages(recipeId) {
  sql = ` SELECT r.id, IFNULL(riy.image_id, 0) as image_id, r.recipeTitle, r.rating, r.category, IFNULL(riy.recipe_image, c.category_image) as image,`;
  sql += `  IFNULL(riy.recipe_image_format, c.category_image_format) as image_format,`;
  sql += `  IFNULL(riy.image_width, c.image_width) as image_width, IFNULL(riy.image_height, c.image_height) as image_height`;
  sql += `  FROM recipes r  `;
  sql += ` LEFT JOIN recipe_images riy  ON  r.id = riy.recipe_id`;
  sql += ` LEFT JOIN recipe_categories c ON r.category = c.category_name`;
  sql += ` WHERE (r.id = ${recipeId})`;

  const results = await db.sequelize.query(
    sql,
    { type: QueryTypes.SELECT },
    { raw: true }
  );
  return results;
}

async function getHomeImages(imageCount) {
  return await db.RecipeImage.findAll({ limit: parseInt(imageCount) });
}

async function getImages(offset, imageCount) {
  let sql = `SELECT DISTINCT recipes.id, recipes.rating, recipes.recipeTitle, recipe_images.recipe_image as image, recipe_images.recipe_image_format as image_format, recipe_images.image_width, recipe_images.image_height FROM recipes `;
  sql += `JOIN recipe_images ON recipes.id = recipe_images.recipe_id ORDER BY recipes.id LIMIT ${offset},${imageCount}`;
  const results = await db.sequelize.query(
    sql,
    { type: QueryTypes.SELECT },
    { raw: true }
  );
  return results;
}

async function getImagesForCategory(category, offset, imageCount) {
  let sql = `SELECT DISTINCT x.id, x.recipeTitle, x.rating, recipe_images.image_id, recipe_images.recipe_image as image,`;
  sql += ` recipe_images.recipe_image_format as image_format, recipe_images.image_width, recipe_images.image_height`;
  sql += ` FROM recipes x`;
  sql += ` JOIN recipe_images ON x.id = recipe_images.recipe_id`;
  if (category != "none") sql += ` WHERE x.category = '${category}'`;
  sql += ` AND recipe_images.image_id = (SELECT min(y.image_id) FROM recipe_images y`;
  sql += ` 						WHERE x.id = y.recipe_id`;
  sql += ` 						GROUP BY y.recipe_id)`;
  sql += ` ORDER BY x.recipeTitle LIMIT ${offset},${imageCount}`;
  const results = await db.sequelize.query(
    sql,
    { type: QueryTypes.SELECT },
    { raw: true }
  );
  return results;
}

async function getImagesForKeywords(keywords, offset, imageCount) {
  sql = ` SELECT r.id, r.recipeTitle, r.rating, r.category, IFNULL(riy.recipe_image, c.category_image) as image,`;
  sql += ` IFNULL(riy.recipe_image_format, c.category_image_format) as image_format,`;
  sql += ` IFNULL(riy.image_width, c.image_width) as image_width, IFNULL(riy.image_height, c.image_height) as image_height`;
  sql += ` FROM recipes r  `;
  sql += ` LEFT JOIN (SELECT recipe_id, recipe_image, recipe_image_format, image_width, image_height FROM recipe_images`;
  sql += ` 		WHERE image_id IN (SELECT min(rix.image_id) `;
  sql += ` 								FROM recipe_images rix `;
  sql += ` 								GROUP BY rix.recipe_id)`;
  sql += ` 		   ) riy  ON  r.id = riy.recipe_id`;
  sql += ` LEFT JOIN recipe_categories c ON r.category = c.category_name`;
  if (keywords !== "none") {
    sql += `         WHERE (r.category ${getCategoryWhereClause(
      keywords
    )} or r.id IN (`;
    sql += ` 			SELECT DISTINCT(i.recipeId) FROM ingredients i `;
    sql += ` WHERE ${getIngredientWhereClause(keywords)}`;
    sql += `))`;
  }
  sql += ` ORDER BY r.recipeTitle`;
  sql += ` LIMIT ${offset},${imageCount}`;

  const results = await db.sequelize.query(
    sql,
    { type: QueryTypes.SELECT },
    { raw: true }
  );

  let searchResults = {};
  searchResults.images = results;
  searchResults.totalItems = await getImagesForKeywordsCount(keywords);
  //console.log(searchResults);
  return searchResults;
}

async function getImagesForKeywordsCount(keywords) {
  sql = ` SELECT COUNT(r.id) as itemsCount `;
  sql += ` FROM recipes r  `;
  sql += ` LEFT JOIN (SELECT recipe_id, recipe_image, recipe_image_format, image_width, image_height FROM recipe_images`;
  sql += ` 		WHERE image_id IN (SELECT min(rix.image_id) `;
  sql += ` 								FROM recipe_images rix `;
  sql += ` 								GROUP BY rix.recipe_id)`;
  sql += ` 		   ) riy  ON  r.id = riy.recipe_id`;
  sql += ` LEFT JOIN recipe_categories c ON r.category = c.category_name`;
  if (keywords !== "none") {
    sql += `         WHERE (r.category ${getCategoryWhereClause(
      keywords
    )} or r.id IN (`;
    sql += ` 			SELECT DISTINCT(i.recipeId) FROM ingredients i `;
    sql += ` WHERE ${getIngredientWhereClause(keywords)}`;
    sql += `))`;
  }

  const results = await db.sequelize.query(
    sql,
    { type: QueryTypes.SELECT },
    { raw: true }
  );
  let itemsCount = parseInt(results[0].itemsCount);
  //  console.log(itemsCount);
  return itemsCount;
}

function getCategoryWhereClause(keywords) {
  const words = keywords.split(" ");
  let sql = "IN (";
  for (let word of words) {
    sql += `'${word}',`;
  }
  sql = rtrim(sql, ",") + ")";
  return sql;
}

function getIngredientWhereClause(keywords) {
  const words = keywords.split(" ");
  let sql = "";
  for (let word of words) {
    sql += ` i.ingredientName LIKE '%${word}%' OR `;
  }
  if (sql.length > 0) sql = sql.slice(0, sql.length - 4);
  return sql;
}

function rtrim(str, ch) {
  for (i = str.length - 1; i >= 0; i--) {
    if (ch != str.charAt(i)) {
      str = str.substring(0, i + 1);
      break;
    }
  }
  return str;
}
async function getImageByAlpha(char) {
  let sql = "SELECT rowindex, recipe_id FROM (";
  sql += "SELECT @rowindex:=@rowindex+1 as rowindex, recipe_id";
  sql += " FROM";
  sql += "	recipe_images JOIN recipes using(recipe_id), (SELECT @rowindex:=0) r";
  sql +=
    " WHERE recipes.recipeTitle <= (SELECT f.recipeTitle FROM recipes f WHERE LEFT(f.recipeTitle, 1) = '" +
    char +
    "'  ORDER BY f.recipeTitle  LIMIT 1)";
  sql += " ORDER BY recipes.recipeTitle) t";
  sql += " ORDER BY rowindex DESC LIMIT 1";

  const results = await db.sequelize.query(
    sql,
    { type: QueryTypes.SELECT },
    { raw: true }
  );
  return results;
}

async function getImageCount() {
  const sql = "SELECT COUNT(*) as imageCount FROM recipe_images";
  const result = await db.sequelize.query(
    sql,
    { type: QueryTypes.SELECT },
    { raw: true }
  );
  return result;
}

async function create(params) {
  const result = await db.RecipeImage.create(params);
  return result;
}

async function update(id, params) {
  const recipeImage = await getRecipeImage(id);

  // validate
  if (!recipeImage) throw "Recipe Image with the id does not exist.";

  Object.assign(recipeImage, params);
  await recipeImage.save();

  return recipeImage.get();
}

async function _delete(id) {
  const recipeImage = await getRecipeImage(id);
  await recipeImage.destroy();
}

// helper functions

async function getRecipeImage(id) {
  const recipeImage = await db.RecipeImage.findByPk(id);
  if (!recipeImage) throw "Recipe Image not found.";
  return recipeImage;
}

async function validateRecipeImageOwner(id, user_id) {
  const recipeImage = await db.RecipeImage.findByPk(id);
  if (!recipeImage) throw "Recipe Image not found.";
  return recipeImage.owner_id === user_id;
}
