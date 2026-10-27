const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class AuditLog extends Model {}

AuditLog.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
    organization_id: DataTypes.INTEGER.UNSIGNED,
    user_id: DataTypes.INTEGER.UNSIGNED,
    action: { type: DataTypes.STRING(100), allowNull: false },
    entity_type: { type: DataTypes.STRING(50), allowNull: false },
    entity_id: DataTypes.INTEGER.UNSIGNED,
    metadata_json: DataTypes.JSON,
  },
  { sequelize, modelName: 'AuditLog', tableName: 'audit_logs', updatedAt: false }
);

module.exports = AuditLog;
