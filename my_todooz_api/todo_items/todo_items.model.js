const { DataTypes } = require("sequelize");

module.exports = model;

function model(sequelize) {
  const attributes = {
    item_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    todo_text: { type: DataTypes.STRING(255), allowNull: false },
    project_id: { type: DataTypes.INTEGER, allowNull: false },
    due_date: { type: DataTypes.DATE, allowNull: true },
    completed: { type: DataTypes.DATE, allowNull: true },
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
    tableName: "mytodooz_todo_items",
  };

  return sequelize.define("TodoItem", attributes, options);
}
