const { DataTypes } = require("sequelize");

module.exports = model;

function model(sequelize) {
  const attributes = {
    category_name: { type: DataTypes.STRING(30) },
    category_image: { type: DataTypes.TEXT("long"), allowNull: false },
    category_image_format: { type: DataTypes.STRING(5) },
    image_width: { type: DataTypes.INTEGER },
    image_height: { type: DataTypes.INTEGER },
  };

  const options = {
    defaultScope: {
      // exclude hash by default
      attributes: { exclude: ["hash"] },
    },
    scopes: {
      // include hash with this scope
      withHash: { attributes: {} },
    },
    tableName: "recipe_categories",
  };

  return sequelize.define("RecipeCategory", attributes, options);
}
