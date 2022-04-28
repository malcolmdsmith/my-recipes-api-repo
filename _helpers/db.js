const mysql = require("mysql2/promise");
const { Sequelize } = require("sequelize");

module.exports = db = {};

initialize();

async function initialize() {
  // create db if it doesn't already exist
  let connection = {};
  let sequelize = {};
  const db_url = process.env.DATABASE_URL;
  const env = process.env.NODE_ENV;
  if (env === "production") {
    const dbname = "my-recipes"; //process.env.DB_NAME;
    connection = await mysql.createConnection(db_url);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbname}\`;`);
    // connect to db
    sequelize = new Sequelize(db_url, { dialect: "mysql" });
  } else {
    const dbname = "my_recipes_db"; //process.env.DB_NAME;
    const host = "127.0.0.1"; //process.env.DB_HOST;
    const port = "3306"; //process.env.DB_PORT;
    const user = "root"; //process.env.DB_USER;
    const password = "smith1665"; //process.env.DB_PASSWORD;

    connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbname}\`;`);
    // connect to db
    sequelize = new Sequelize(dbname, user, password, { dialect: "mysql" });
  }

  // init models and add them to the exported db object
  db.User = require("../users/user.model")(sequelize);
  db.Recipe = require("../recipes/recipe.model")(sequelize);
  db.Ingredient = require("../ingredients/ingredient.model")(sequelize);
  db.RecipeImage = require("../recipe_images/recipe_image.model")(sequelize);
  db.ShoppingItem = require("../shopping_items/shopping_item.model")(sequelize);
  db.ShoppingList = require("../shopping_lists/shopping_list.model")(sequelize);
  db.RecipeCategory = require("../recipe_categories/recipe_category.model")(
    sequelize
  );
  ////////////////////////
  // My Budget App
  db.BankTransaction =
    require("../my_budget_api/bank_transactions/bank_transactions.model")(
      sequelize
    );
  db.TransactionRule =
    require("../my_budget_api/transaction_rules/transaction_rules.model")(
      sequelize
    );
  db.BudgetType = require("../my_budget_api/budget_types/budget_types.model")(
    sequelize
  );
  /////////////////////////////

  /////////////////////////////
  // My Todooz App 18/4/2022
  db.Project = require("../my_todooz_api/projects/projects.model")(sequelize);
  db.TodoItem = require("../my_todooz_api/todo_items/todo_items.model")(
    sequelize
  );
  /////////////////////////////

  // sync all models with database
  await sequelize.sync();

  db.sequelize = sequelize;
  db.Sequelize = Sequelize;
}
