const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class FormField extends Model {}

FormField.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    uuid: { type: DataTypes.CHAR(36), unique: true, defaultValue: () => uuidv4() },
    form_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    field_key: { type: DataTypes.STRING(100), allowNull: false },
    field_type: {
      type: DataTypes.ENUM(
        'text', 'textarea', 'email', 'password', 'number', 'phone',
        'date', 'time', 'datetime', 'select', 'multiselect', 'radio',
        'checkbox', 'file', 'image', 'rating', 'recaptcha',
        'heading', 'paragraph', 'divider', 'hidden', 'signature', 'address'
      ),
      allowNull: false,
    },
    label: { type: DataTypes.STRING(255), allowNull: false },
    placeholder: DataTypes.STRING(255),
    help_text: DataTypes.STRING(500),
    position: { type: DataTypes.INTEGER, defaultValue: 0 },
    step_number: { type: DataTypes.INTEGER, defaultValue: 1 },
    is_required: { type: DataTypes.BOOLEAN, defaultValue: false },
    min_length: DataTypes.INTEGER,
    max_length: DataTypes.INTEGER,
    min_value: DataTypes.DECIMAL(15, 4),
    max_value: DataTypes.DECIMAL(15, 4),
    regex_pattern: DataTypes.STRING(255),
    validation_message: DataTypes.STRING(255),
    options_json: DataTypes.JSON,
    default_value: DataTypes.STRING(500),
    allowed_file_types: DataTypes.STRING(255),
    max_file_size_mb: { type: DataTypes.INTEGER, defaultValue: 10 },
    max_files: { type: DataTypes.INTEGER, defaultValue: 1 },
    // Accesibilidad (WCAG 2.1 AA)
    aria_label: DataTypes.STRING(255),
    aria_describedby_text: DataTypes.STRING(500),
    autocomplete_attr: DataTypes.STRING(50),
    conditional_logic_json: DataTypes.JSON,
    custom_attributes_json: DataTypes.JSON,
    width: { type: DataTypes.ENUM('full', 'half', 'third'), defaultValue: 'full' },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  { sequelize, modelName: 'FormField', tableName: 'form_fields' }
);

module.exports = FormField;
