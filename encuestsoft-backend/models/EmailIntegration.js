const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class EmailIntegration extends Model {}

EmailIntegration.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    form_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    provider: { type: DataTypes.ENUM('mailchimp', 'acelle'), allowNull: false },
    api_key: DataTypes.STRING(255),
    api_url: DataTypes.STRING(255),
    list_or_audience_id: DataTypes.STRING(150),
    field_mapping_json: DataTypes.JSON,
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  { sequelize, modelName: 'EmailIntegration', tableName: 'email_integrations', updatedAt: false }
);

module.exports = EmailIntegration;
