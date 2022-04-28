require("rootpath")();
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const errorHandler = require("_middleware/error-handler");

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: false }));
//app.use(bodyParser.json({ limit: "50mb" }));
// app.use(
//   bodyParser.urlencoded({
//     limit: "50mb",
//     extended: true,
//     parameterLimit: 50000,
//   })
// );
app.use(cors());

// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "X-Requested-With");
//     next();
//     });

// app.use(function(req, res, next) {
//     res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
//     res.header('Expires', '-1');
//     res.header('Pragma', 'no-cache');
//     next()
//   });

// api routes
app.use("/api/users", require("./users/users.controller"));
app.use("/api/recipes", require("./recipes/recipes.controller"));
app.use("/api/ingredients", require("./ingredients/ingredients.controller"));
app.use(
  "/api/recipe_images",
  require("./recipe_images/recipe_images.controller")
);
app.use(
  "/api/shopping_items",
  require("./shopping_items/shopping_items.controller")
);
app.use(
  "/api/shopping_lists",
  require("./shopping_lists/shopping_lists.controller")
);
//app.use("/api/cats", require("./categories/categories.controller"));
app.use(
  "/api/recipe_categories",
  require("./recipe_categories/recipe_categories.controller")
);

/////////////////////////
/// MY BUDGET APP DATA 13.11.21
/////////////////////////
app.use(
  "/api/transactions",
  require("./my_budget_api/bank_transactions/bank_transactions.controller")
);
app.use(
  "/api/rules",
  require("./my_budget_api/transaction_rules/transaction_rules.controller")
);
app.use(
  "/api/budgetTypes",
  require("./my_budget_api/budget_types/budget_types.controller")
);
////////////////////////////////////
/// MY TODOOZ APP DATA 18/4/2022
////////////////////////////////////
app.use(
  "/api/projects",
  require("./my_todooz_api/projects/projects.controller")
);
app.use(
  "/api/todooz",
  require("./my_todooz_api/todo_items/todo_items.controller")
);
// global error handler
app.use(errorHandler);

// start server
const port = process.env.PORT || 4000;
app.listen(port, () => console.log("Server listening on port " + port));
