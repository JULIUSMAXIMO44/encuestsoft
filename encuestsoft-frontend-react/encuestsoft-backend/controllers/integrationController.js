const { EmailIntegration, Form } = require('../models');
const { ok, created, fail } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

async function assertFormOwnership(formId, organizationId) {
  return Form.findOne({ where: { id: formId, organization_id: organizationId } });
}

const listIntegrations = asyncHandler(async (req, res) => {
  const form = await assertFormOwnership(req.params.formId, req.organizationId);
  if (!form) return fail(res, 'Formulario no encontrado.', 404);
  const integrations = await EmailIntegration.findAll({ where: { form_id: form.id } });
  return ok(res, integrations);
});

/** Crea una integración con Mailchimp o Acelle Email para el formulario. */
const createIntegration = asyncHandler(async (req, res) => {
  const form = await assertFormOwnership(req.params.formId, req.organizationId);
  if (!form) return fail(res, 'Formulario no encontrado.', 404);
  const { provider, api_key, api_url, list_or_audience_id, field_mapping_json } = req.body;
  const integration = await EmailIntegration.create({
    form_id: form.id, provider, api_key, api_url, list_or_audience_id, field_mapping_json,
  });
  return created(res, integration, 'Integración creada.');
});

const updateIntegration = asyncHandler(async (req, res) => {
  const form = await assertFormOwnership(req.params.formId, req.organizationId);
  if (!form) return fail(res, 'Formulario no encontrado.', 404);
  const integration = await EmailIntegration.findOne({ where: { id: req.params.id, form_id: form.id } });
  if (!integration) return fail(res, 'Integración no encontrada.', 404);
  await integration.update(req.body);
  return ok(res, integration, 'Integración actualizada.');
});

const deleteIntegration = asyncHandler(async (req, res) => {
  const form = await assertFormOwnership(req.params.formId, req.organizationId);
  if (!form) return fail(res, 'Formulario no encontrado.', 404);
  const deleted = await EmailIntegration.destroy({ where: { id: req.params.id, form_id: form.id } });
  if (!deleted) return fail(res, 'Integración no encontrada.', 404);
  return ok(res, null, 'Integración eliminada.');
});

module.exports = { listIntegrations, createIntegration, updateIntegration, deleteIntegration };
