const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Plan extends Model {}

Plan.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    code: { type: DataTypes.STRING(50), unique: true, allowNull: false },
    name: { type: DataTypes.STRING(100), allowNull: false },
    description: DataTypes.TEXT,
    price: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    billing_cycle: { type: DataTypes.ENUM('free', 'monthly', 'yearly', 'one_time'), defaultValue: 'free' },
    max_forms: { type: DataTypes.INTEGER, defaultValue: 3 },
    max_submissions_per_month: { type: DataTypes.INTEGER, defaultValue: 500 },
    max_storage_mb: { type: DataTypes.INTEGER, defaultValue: 100 },
    max_users: { type: DataTypes.INTEGER, defaultValue: 1 },
    allow_webhooks: { type: DataTypes.BOOLEAN, defaultValue: false },
    allow_integrations: { type: DataTypes.BOOLEAN, defaultValue: false },
    allow_custom_branding: { type: DataTypes.BOOLEAN, defaultValue: false },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  { sequelize, modelName: 'Plan', tableName: 'plans' }
);

module.exports = Plan;
