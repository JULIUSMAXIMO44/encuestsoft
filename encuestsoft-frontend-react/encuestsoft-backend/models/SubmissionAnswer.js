const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class SubmissionAnswer extends Model {}

SubmissionAnswer.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
    submission_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    field_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    field_key: { type: DataTypes.STRING(100), allowNull: false },
    value_text: DataTypes.TEXT,
    value_number: DataTypes.DECIMAL(15, 4),
    value_date: DataTypes.DATE,
  },
  { sequelize, modelName: 'SubmissionAnswer', tableName: 'submission_answers', timestamps: false }
);

module.exports = SubmissionAnswer;
