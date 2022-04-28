const { DataTypes } = require("sequelize");

module.exports = model;

function model(sequelize) {
  const attributes = {
    ingredientName: { type: DataTypes.STRING(50), allowNull: false },
    measure: { type: DataTypes.STRING(30), allowNull: false },
    qty: { type: DataTypes.FLOAT, allowNull: false },
    recipeId: { type: DataTypes.INTEGER, allowNull: false },
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
    tableName: "ingredients",
  };

  return sequelize.define("Ingredient", attributes, options);
}
