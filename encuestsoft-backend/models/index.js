const { sequelize } = require('../config/database');
const Plan = require('./Plan');
const Organization = require('./Organization');
const User = require('./User');
const Form = require('./Form');
const FormField = require('./FormField');
const FormSubmission = require('./FormSubmission');
const SubmissionAnswer = require('./SubmissionAnswer');
const SubmissionFile = require('./SubmissionFile');
const { Webhook, WebhookLog } = require('./Webhook');
const EmailIntegration = require('./EmailIntegration');
const AuditLog = require('./AuditLog');

// ---- Plan <-> Organization ----
Plan.hasMany(Organization, { foreignKey: 'plan_id' });
Organization.belongsTo(Plan, { foreignKey: 'plan_id' });

// ---- Organization <-> User ----
Organization.hasMany(User, { foreignKey: 'organization_id', onDelete: 'CASCADE' });
User.belongsTo(Organization, { foreignKey: 'organization_id' });

// ---- Organization/User <-> Form ----
Organization.hasMany(Form, { foreignKey: 'organization_id', onDelete: 'CASCADE' });
Form.belongsTo(Organization, { foreignKey: 'organization_id' });
User.hasMany(Form, { foreignKey: 'created_by' });
Form.belongsTo(User, { foreignKey: 'created_by', as: 'author' });

// ---- Form <-> FormField (drag & drop, orden) ----
Form.hasMany(FormField, { foreignKey: 'form_id', onDelete: 'CASCADE', as: 'fields' });
FormField.belongsTo(Form, { foreignKey: 'form_id' });

// ---- Form <-> FormSubmission ----
Form.hasMany(FormSubmission, { foreignKey: 'form_id', onDelete: 'CASCADE', as: 'submissions' });
FormSubmission.belongsTo(Form, { foreignKey: 'form_id' });
Organization.hasMany(FormSubmission, { foreignKey: 'organization_id' });

// ---- FormSubmission <-> SubmissionAnswer ----
FormSubmission.hasMany(SubmissionAnswer, { foreignKey: 'submission_id', onDelete: 'CASCADE', as: 'answers' });
SubmissionAnswer.belongsTo(FormSubmission, { foreignKey: 'submission_id' });
FormField.hasMany(SubmissionAnswer, { foreignKey: 'field_id' });
SubmissionAnswer.belongsTo(FormField, { foreignKey: 'field_id' });

// ---- FormSubmission <-> SubmissionFile ----
FormSubmission.hasMany(SubmissionFile, { foreignKey: 'submission_id', onDelete: 'CASCADE', as: 'files' });
SubmissionFile.belongsTo(FormSubmission, { foreignKey: 'submission_id' });
FormField.hasMany(SubmissionFile, { foreignKey: 'field_id' });

// ---- Form <-> Webhook ----
Form.hasMany(Webhook, { foreignKey: 'form_id', onDelete: 'CASCADE', as: 'webhooks' });
Webhook.belongsTo(Form, { foreignKey: 'form_id' });
Webhook.hasMany(WebhookLog, { foreignKey: 'webhook_id', onDelete: 'CASCADE' });
WebhookLog.belongsTo(Webhook, { foreignKey: 'webhook_id' });
FormSubmission.hasMany(WebhookLog, { foreignKey: 'submission_id' });

// ---- Form <-> EmailIntegration ----
Form.hasMany(EmailIntegration, { foreignKey: 'form_id', onDelete: 'CASCADE', as: 'integrations' });
EmailIntegration.belongsTo(Form, { foreignKey: 'form_id' });

module.exports = {
  sequelize,
  Plan,
  Organization,
  User,
  Form,
  FormField,
  FormSubmission,
  SubmissionAnswer,
  SubmissionFile,
  Webhook,
  WebhookLog,
  EmailIntegration,
  AuditLog,
};
