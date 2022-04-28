const { DataTypes } = require("sequelize");

module.exports = model;

function model(sequelize) {
  const attributes = {
    project_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    project_name: { type: DataTypes.STRING(40), allowNull: false },
    project_description: { type: DataTypes.STRING(255), allowNull: true },
    project_notes: { type: DataTypes.STRING(1000), allowNull: true },
    parent_project_id: { type: DataTypes.INTEGER, allowNull: true },
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
    tableName: "mytodooz_projects",
  };

  return sequelize.define("Project", attributes, options);
}
