const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("_helpers/db");
const { QueryTypes } = require("sequelize");

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: _delete,
  searchRecipes,
};

async function getAll() {
  return await db.Recipe.findAll();
}

async function getById(id) {
  return await getRecipe(id);
}

async function create(params) {
  // validate
  if (await db.Recipe.findOne({ where: { recipeTitle: params.recipeTitle } })) {
    throw 'Recipe "' + params.recipeTitle + '" already exists.';
  }

  // save recipe
  return await db.Recipe.create(params);
}

async function update(id, params) {
  const recipe = await getRecipe(id);

  // validate
  if (!recipe) throw "Recipe with the id does not exist.";

  // copy params to recipe and save
  Object.assign(recipe, params);
  await recipe.save();

  return recipe.get();
}

async function _delete(id) {
  const recipe = await getRecipe(id);
  await recipe.destroy();
}

async function searchRecipes(query) {
  let sql = "";
  let replacements = [];
  let offset = (query.currentPage - 1) * query.pageSize;

  if (query.keywords === "") {
    sql = `SELECT COUNT(id) as itemsCount FROM recipes;`;
  } else {
    sql = `SELECT sum(cnt) as itemsCount FROM (`;
    sql += ` SELECT COUNT(DISTINCT Id) as cnt FROM recipes r `;
    sql += ` WHERE category ${getCategoryWhereClause(query.keywords)}`;
    sql += ` OR r.id in (SELECT i.recipeId FROM ingredients i `;
    sql += ` WHERE ${getIngredientWhereClause(query.keywords)}`;
    sql += `)) d;`;
  }
  //console.log("Count...", sql);
  const results = await db.sequelize.query(
    sql,
    {
      replacements: replacements,
      type: QueryTypes.SELECT,
    },
    { raw: true }
  );
  let itemsCount = parseInt(results[0].itemsCount);

  sql = `SELECT DISTINCT r.id, r.recipeTitle FROM recipes r`;
  if (query.keywords !== "") {
    sql += ` WHERE r.category ${getCategoryWhereClause(query.keywords)}`;
    sql += ` OR r.id in (SELECT i.recipeId FROM ingredients i WHERE `;
    sql += ` ${getIngredientWhereClause(query.keywords)} )`;
  }
  sql += ` ORDER BY r.recipeTitle `;
  sql += `LIMIT ${offset},${query.pageSize};`;
  //console.log("select...", sql);
  const recipes = await db.sequelize.query(sql, {
    replacements: replacements,
    type: QueryTypes.SELECT,
    model: db.Recipe,
    mapToModel: true,
  });

  let searchResults = {};
  searchResults.totalCount = itemsCount;
  searchResults.recipes = recipes;

  return searchResults;
}

// helper functions

async function getRecipe(id) {
  const recipe = await db.Recipe.findByPk(id);
  if (!recipe) throw "Recipe not found";
  return recipe;
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
