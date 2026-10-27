const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class FormSubmission extends Model {}

FormSubmission.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    uuid: { type: DataTypes.CHAR(36), unique: true, defaultValue: () => uuidv4() },
    form_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    organization_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    reference_id: { type: DataTypes.STRING(80), allowNull: false },
    status: { type: DataTypes.ENUM('draft', 'completed', 'spam'), defaultValue: 'completed' },
    submitted_by_user_id: DataTypes.INTEGER.UNSIGNED,
    respondent_email: DataTypes.STRING(150),
    ip_address: DataTypes.STRING(64),
    user_agent: DataTypes.STRING(500),
    source_url: DataTypes.STRING(500),
    recaptcha_score: DataTypes.DECIMAL(3, 2),
    pdf_path: DataTypes.STRING(500),
    raw_answers_json: { type: DataTypes.JSON, allowNull: false },
    submitted_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: 'FormSubmission', tableName: 'form_submissions' }
);

module.exports = FormSubmission;
