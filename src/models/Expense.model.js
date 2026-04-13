'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../db.js');

const Expense = sequelize.define(
  'expense',
  {
    amount: { type: DataTypes.INTEGER, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    note: { type: DataTypes.TEXT },
    spentAt: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'spent_at',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
    },
  },
  {
    tableName: 'expenses',
    underscored: true,
    timestamps: false,
  },
);

module.exports = { Expense };
