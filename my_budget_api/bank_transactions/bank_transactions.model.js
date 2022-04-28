const { DataTypes } = require("sequelize");

module.exports = model;

function model(sequelize) {
  const attributes = {
    transDate: { type: DataTypes.DATE, allowNull: false },
    narrative: { type: DataTypes.STRING(255), allowNull: false },
    debitAmount: { type: DataTypes.DECIMAL, allowNull: false },
    creditAmount: { type: DataTypes.DECIMAL, allowNull: false },
    balance: { type: DataTypes.DECIMAL, allowNull: false },
    categories: { type: DataTypes.STRING(45), allowNull: false },
    myBudgetCategory: { type: DataTypes.STRING(100), allowNull: false },
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
    tableName: "mymoney_bank_transactions",
  };

  return sequelize.define("BankTransaction", attributes, options);
}
