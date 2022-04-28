const { DataTypes } = require("sequelize");

module.exports = model;

function model(sequelize) {
  const attributes = {
    shopping_list_name: { type: DataTypes.STRING(30), allowNull: false },
    ingredientName: { type: DataTypes.STRING(50), allowNull: false },
    measure: { type: DataTypes.STRING(30), allowNull: false },
    qty: { type: DataTypes.FLOAT, allowNull: false },
    shopping_list_date: { type: DataTypes.DATEONLY, allowNull: false },
    picked: { type: DataTypes.BOOLEAN, allowNull: false, default: false },
    owner_id: { type: DataTypes.INTEGER, allowNull: false },
    cost: { type: DataTypes.DECIMAL(6, 2), allowNull: false },
    master_list: { type: DataTypes.BOOLEAN, allowNull: false, default: false },
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
    tableName: "shopping_items",
  };

  return sequelize.define("ShoppingItem", attributes, options);
}
