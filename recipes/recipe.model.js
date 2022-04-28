const { DataTypes } = require("sequelize");

module.exports = model;

function model(sequelize) {
  const attributes = {
    recipeTitle: { type: DataTypes.STRING(255), allowNull: false },
    category: { type: DataTypes.STRING(30), allowNull: false },
    recipeSource: { type: DataTypes.STRING(100), allowNull: false },
    recipeSourceData: { type: DataTypes.TEXT(), allowNull: true },
    method: { type: DataTypes.TEXT(), allowNull: true },
    comments: { type: DataTypes.TEXT(), allowNull: true },
    prepTime: { type: DataTypes.STRING(10), allowNull: true },
    cookTime: { type: DataTypes.STRING(10), allowNull: true },
    rating: { type: DataTypes.FLOAT, allowNull: false },
    owner_id: { type: DataTypes.INTEGER, allowNull: false },
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
    tableName: "recipes",
  };

  return sequelize.define("Recipe", attributes, options);
}
