const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class SubmissionFile extends Model {}

SubmissionFile.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    submission_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    field_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    original_name: DataTypes.STRING(255),
    stored_path: { type: DataTypes.STRING(500), allowNull: false },
    mime_type: DataTypes.STRING(100),
    size_bytes: DataTypes.INTEGER.UNSIGNED,
  },
  { sequelize, modelName: 'SubmissionFile', tableName: 'submission_files', updatedAt: false }
);

module.exports = SubmissionFile;
