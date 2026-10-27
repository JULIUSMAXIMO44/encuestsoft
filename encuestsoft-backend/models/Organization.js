const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Organization extends Model {}

Organization.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    uuid: { type: DataTypes.CHAR(36), unique: true, defaultValue: () => uuidv4() },
    name: { type: DataTypes.STRING(150), allowNull: false },
    slug: { type: DataTypes.STRING(150), unique: true, allowNull: false },
    plan_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    logo_url: DataTypes.STRING(500),
    primary_color: { type: DataTypes.STRING(20), defaultValue: '#4F46E5' },
    trial_ends_at: DataTypes.DATE,
    subscription_status: {
      type: DataTypes.ENUM('trialing', 'active', 'past_due', 'canceled'),
      defaultValue: 'trialing',
    },
    submissions_used_this_month: { type: DataTypes.INTEGER, defaultValue: 0 },
    storage_used_mb: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  { sequelize, modelName: 'Organization', tableName: 'organizations' }
);

module.exports = Organization;
