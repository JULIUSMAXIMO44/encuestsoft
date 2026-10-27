const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Form extends Model {}

Form.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    uuid: { type: DataTypes.CHAR(36), unique: true, defaultValue: () => uuidv4() },
    organization_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    created_by: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    title: { type: DataTypes.STRING(200), allowNull: false },
    slug: { type: DataTypes.STRING(220), allowNull: false },
    description: DataTypes.TEXT,
    status: { type: DataTypes.ENUM('draft', 'published', 'archived', 'paused'), defaultValue: 'draft' },
    draft_schema_json: DataTypes.JSON,
    is_password_protected: { type: DataTypes.BOOLEAN, defaultValue: false },
    password_hash: DataTypes.STRING(255),
    style_json: DataTypes.JSON,
    success_message: DataTypes.TEXT,
    error_message: DataTypes.TEXT,
    redirect_url: DataTypes.STRING(500),
    redirect_delay_seconds: { type: DataTypes.INTEGER, defaultValue: 0 },
    recaptcha_enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    recaptcha_version: { type: DataTypes.ENUM('v2', 'v3'), defaultValue: 'v2' },
    notify_email_enabled: { type: DataTypes.BOOLEAN, defaultValue: true },
    notify_emails: DataTypes.TEXT,
    autoresponder_enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    autoresponder_subject: DataTypes.STRING(255),
    autoresponder_body: DataTypes.TEXT,
    autoresponder_field_key: DataTypes.STRING(100),
    reference_id_prefix: { type: DataTypes.STRING(20), defaultValue: 'REF' },
    reference_id_format: { type: DataTypes.STRING(50), defaultValue: '{PREFIX}-{YEAR}-{SEQ}' },
    allow_prefill_from_url: { type: DataTypes.BOOLEAN, defaultValue: true },
    custom_attributes_json: DataTypes.JSON,
    callback_on_submit: DataTypes.STRING(150),
    submission_pdf_enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    submission_pdf_template: { type: DataTypes.ENUM('simple', 'branded'), defaultValue: 'simple' },
    is_multi_step: { type: DataTypes.BOOLEAN, defaultValue: false },
    allow_multiple_submissions: { type: DataTypes.BOOLEAN, defaultValue: true },
    limit_one_submission_per_user: { type: DataTypes.BOOLEAN, defaultValue: false },
    submission_limit: DataTypes.INTEGER,
    opens_at: DataTypes.DATE,
    closes_at: DataTypes.DATE,
    views_count: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
    submissions_count: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
    deleted_at: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'Form',
    tableName: 'forms',
    paranoid: false, // manejamos deleted_at manualmente para soft-delete controlado
  }
);

module.exports = Form;
