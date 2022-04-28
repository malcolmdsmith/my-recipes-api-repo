const { DataTypes } = require("sequelize");

module.exports = model;

function model(sequelize) {
  const attributes = {
    category: { type: DataTypes.STRING(100), allowNull: false },
    parent_category: { type: DataTypes.STRING(100), allowNull: true },
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
    tableName: "mymoney_budget_types",
  };

  return sequelize.define("BudgetType", attributes, options);
}
