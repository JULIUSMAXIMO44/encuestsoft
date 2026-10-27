const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Webhook extends Model {}
Webhook.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    form_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    url: { type: DataTypes.STRING(500), allowNull: false },
    method: { type: DataTypes.ENUM('POST', 'PUT'), defaultValue: 'POST' },
    headers_json: DataTypes.JSON,
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  { sequelize, modelName: 'Webhook', tableName: 'webhooks', updatedAt: false }
);

class WebhookLog extends Model {}
WebhookLog.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    webhook_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    submission_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    attempt: { type: DataTypes.INTEGER, defaultValue: 1 },
    status_code: DataTypes.INTEGER,
    success: { type: DataTypes.BOOLEAN, defaultValue: false },
    response_body: DataTypes.TEXT,
  },
  { sequelize, modelName: 'WebhookLog', tableName: 'webhook_logs', updatedAt: false }
);

module.exports = { Webhook, WebhookLog };
