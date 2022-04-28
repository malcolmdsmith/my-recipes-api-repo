const { DataTypes } = require("sequelize");

module.exports = model;

function model(sequelize) {
  const attributes = {
    shopping_list_name: { type: DataTypes.STRING(30), allowNull: false },
    owner_id: { type: DataTypes.INTEGER, allowNull: false },
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
    tableName: "shopping_lists",
  };

  return sequelize.define("ShoppingList", attributes, options);
}
