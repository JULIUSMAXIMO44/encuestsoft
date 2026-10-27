const { Webhook, Form } = require('../models');
const { ok, created, fail } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

async function assertFormOwnership(formId, organizationId) {
  return Form.findOne({ where: { id: formId, organization_id: organizationId } });
}

const listWebhooks = asyncHandler(async (req, res) => {
  const form = await assertFormOwnership(req.params.formId, req.organizationId);
  if (!form) return fail(res, 'Formulario no encontrado.', 404);
  const webhooks = await Webhook.findAll({ where: { form_id: form.id } });
  return ok(res, webhooks);
});

const createWebhook = asyncHandler(async (req, res) => {
  const form = await assertFormOwnership(req.params.formId, req.organizationId);
  if (!form) return fail(res, 'Formulario no encontrado.', 404);
  const { url, method, headers_json } = req.body;
  const webhook = await Webhook.create({ form_id: form.id, url, method, headers_json });
  return created(res, webhook, 'Webhook creado.');
});

const updateWebhook = asyncHandler(async (req, res) => {
  const form = await assertFormOwnership(req.params.formId, req.organizationId);
  if (!form) return fail(res, 'Formulario no encontrado.', 404);
  const webhook = await Webhook.findOne({ where: { id: req.params.id, form_id: form.id } });
  if (!webhook) return fail(res, 'Webhook no encontrado.', 404);
  await webhook.update(req.body);
  return ok(res, webhook, 'Webhook actualizado.');
});

const deleteWebhook = asyncHandler(async (req, res) => {
  const form = await assertFormOwnership(req.params.formId, req.organizationId);
  if (!form) return fail(res, 'Formulario no encontrado.', 404);
  const deleted = await Webhook.destroy({ where: { id: req.params.id, form_id: form.id } });
  if (!deleted) return fail(res, 'Webhook no encontrado.', 404);
  return ok(res, null, 'Webhook eliminado.');
});

module.exports = { listWebhooks, createWebhook, updateWebhook, deleteWebhook };
