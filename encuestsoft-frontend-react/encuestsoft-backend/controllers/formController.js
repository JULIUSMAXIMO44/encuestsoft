const bcrypt = require('bcryptjs');
const { Form, FormField, Organization, Plan, Webhook, EmailIntegration } = require('../models');
const { ok, created, fail } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { checkStyleAccessibility, suggestAutocomplete } = require('../utils/accessibility');

/** Lista los formularios de la organización del usuario autenticado. */
const listForms = asyncHandler(async (req, res) => {
  const forms = await Form.findAll({
    where: { organization_id: req.organizationId, deleted_at: null },
    order: [['updated_at', 'DESC']],
  });
  return ok(res, forms);
});

const getForm = asyncHandler(async (req, res) => {
  const form = await Form.findOne({
    where: { id: req.params.id, organization_id: req.organizationId, deleted_at: null },
    include: [{ model: FormField, as: 'fields' }, { model: Webhook, as: 'webhooks' }, { model: EmailIntegration, as: 'integrations' }],
    order: [[{ model: FormField, as: 'fields' }, 'position', 'ASC']],
  });
  if (!form) return fail(res, 'Formulario no encontrado.', 404);
  return ok(res, form);
});

/** Crea un formulario nuevo en estado "draft" (Modo Borrador), validando el límite del plan SaaS. */
const createForm = asyncHandler(async (req, res) => {
  const org = await Organization.findByPk(req.organizationId, { include: [Plan] });
  const currentCount = await Form.count({ where: { organization_id: req.organizationId, deleted_at: null } });
  if (org.Plan && currentCount >= org.Plan.max_forms) {
    return fail(res, `Alcanzaste el límite de ${org.Plan.max_forms} formularios de tu plan actual.`, 403);
  }

  const { title, description } = req.body;
  const slug = `${(title || 'formulario').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`;

  const form = await Form.create({
    organization_id: req.organizationId,
    created_by: req.user.id,
    title,
    description,
    slug,
    status: 'draft',
  });
  return created(res, form, 'Formulario creado en modo borrador.');
});

/** Actualiza metadatos y configuración general (estilos, mensajes, redirección, reCAPTCHA, PDF, etc.). */
const updateForm = asyncHandler(async (req, res) => {
  const form = await Form.findOne({ where: { id: req.params.id, organization_id: req.organizationId } });
  if (!form) return fail(res, 'Formulario no encontrado.', 404);

  const allowed = [
    'title', 'description', 'style_json', 'success_message', 'error_message', 'redirect_url',
    'redirect_delay_seconds', 'recaptcha_enabled', 'recaptcha_version', 'notify_email_enabled',
    'notify_emails', 'autoresponder_enabled', 'autoresponder_subject', 'autoresponder_body',
    'autoresponder_field_key', 'reference_id_prefix', 'reference_id_format', 'allow_prefill_from_url',
    'custom_attributes_json', 'callback_on_submit', 'submission_pdf_enabled', 'submission_pdf_template',
    'is_multi_step', 'allow_multiple_submissions', 'limit_one_submission_per_user', 'submission_limit',
    'opens_at', 'closes_at',
  ];
  const updates = {};
  for (const key of allowed) if (req.body[key] !== undefined) updates[key] = req.body[key];

  let accessibilityWarnings = [];
  if (updates.style_json) accessibilityWarnings = checkStyleAccessibility(updates.style_json);

  await form.update(updates);
  return ok(res, form, 'Formulario actualizado.', 200, { accessibility_warnings: accessibilityWarnings });
});

/** Publica o despublica el formulario (Modo Borrador <-> Publicado). */
const setFormStatus = asyncHandler(async (req, res) => {
  const { status } = req.body; // 'draft' | 'published' | 'paused' | 'archived'
  const form = await Form.findOne({ where: { id: req.params.id, organization_id: req.organizationId } });
  if (!form) return fail(res, 'Formulario no encontrado.', 404);

  if (status === 'published') {
    const fieldCount = await FormField.count({ where: { form_id: form.id, is_active: true } });
    if (fieldCount === 0) return fail(res, 'No puedes publicar un formulario sin campos.', 422);
  }
  await form.update({ status });
  return ok(res, form, `Formulario ahora en estado "${status}".`);
});

/** Configura o quita la protección por contraseña del formulario. */
const setFormPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const form = await Form.findOne({ where: { id: req.params.id, organization_id: req.organizationId } });
  if (!form) return fail(res, 'Formulario no encontrado.', 404);

  if (!password) {
    await form.update({ is_password_protected: false, password_hash: null });
    return ok(res, form, 'Se eliminó la protección por contraseña.');
  }
  const password_hash = await bcrypt.hash(password, 10);
  await form.update({ is_password_protected: true, password_hash });
  return ok(res, form, 'Formulario protegido con contraseña.');
});

const deleteForm = asyncHandler(async (req, res) => {
  const form = await Form.findOne({ where: { id: req.params.id, organization_id: req.organizationId } });
  if (!form) return fail(res, 'Formulario no encontrado.', 404);
  await form.update({ deleted_at: new Date(), status: 'archived' });
  return ok(res, null, 'Formulario eliminado.');
});

/** Duplica un formulario completo (útil en un builder drag & drop: "usar como plantilla"). */
const duplicateForm = asyncHandler(async (req, res) => {
  const original = await Form.findOne({
    where: { id: req.params.id, organization_id: req.organizationId },
    include: [{ model: FormField, as: 'fields' }],
  });
  if (!original) return fail(res, 'Formulario no encontrado.', 404);

  const copy = await Form.create({
    ...original.toJSON(),
    id: undefined,
    uuid: undefined,
    fields: undefined,
    title: `${original.title} (copia)`,
    slug: `${original.slug}-copy-${Date.now().toString(36)}`,
    status: 'draft',
    submissions_count: 0,
    views_count: 0,
  });

  for (const field of original.fields) {
    await FormField.create({ ...field.toJSON(), id: undefined, uuid: undefined, form_id: copy.id });
  }
  return created(res, copy, 'Formulario duplicado.');
});

/**
 * Reordena/actualiza en bloque los campos de un formulario (drag & drop del builder).
 * Recibe un arreglo de campos con su posición final; crea, actualiza o elimina según corresponda.
 */
const saveFormFields = asyncHandler(async (req, res) => {
  const form = await Form.findOne({ where: { id: req.params.id, organization_id: req.organizationId } });
  if (!form) return fail(res, 'Formulario no encontrado.', 404);

  const incoming = req.body.fields || [];
  const existing = await FormField.findAll({ where: { form_id: form.id } });
  const existingIds = existing.map((f) => f.id);
  const incomingIds = incoming.filter((f) => f.id).map((f) => f.id);

  const toDelete = existingIds.filter((id) => !incomingIds.includes(id));
  if (toDelete.length) await FormField.destroy({ where: { id: toDelete } });

  const saved = [];
  for (let i = 0; i < incoming.length; i += 1) {
    const f = incoming[i];
    const payload = {
      form_id: form.id,
      field_key: f.field_key,
      field_type: f.field_type,
      label: f.label,
      placeholder: f.placeholder,
      help_text: f.help_text,
      position: i,
      step_number: f.step_number || 1,
      is_required: !!f.is_required,
      min_length: f.min_length,
      max_length: f.max_length,
      min_value: f.min_value,
      max_value: f.max_value,
      regex_pattern: f.regex_pattern,
      validation_message: f.validation_message,
      options_json: f.options_json,
      default_value: f.default_value,
      allowed_file_types: f.allowed_file_types,
      max_file_size_mb: f.max_file_size_mb,
      max_files: f.max_files,
      aria_label: f.aria_label || f.label,
      aria_describedby_text: f.help_text,
      autocomplete_attr: f.autocomplete_attr || suggestAutocomplete(f.field_type, f.field_key),
      conditional_logic_json: f.conditional_logic_json,
      custom_attributes_json: f.custom_attributes_json,
      width: f.width || 'full',
      is_active: f.is_active !== false,
    };
    if (f.id) {
      const [record] = await FormField.upsert({ id: f.id, ...payload }, { returning: true });
      saved.push(record);
    } else {
      saved.push(await FormField.create(payload));
    }
  }

  return ok(res, saved, 'Campos del formulario guardados.');
});

/** Genera el fragmento de código embebible para integrar el formulario en un sitio web externo. */
const getEmbedCode = asyncHandler(async (req, res) => {
  const form = await Form.findOne({ where: { id: req.params.id, organization_id: req.organizationId } });
  if (!form) return fail(res, 'Formulario no encontrado.', 404);

  const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const embed = {
    iframe: `<iframe src="${baseUrl}/f/${form.uuid}" style="width:100%;border:0;min-height:600px;" title="${form.title}" loading="lazy"></iframe>`,
    script: `<div id="encuestsoft-form-${form.uuid}"></div>\n<script src="${baseUrl}/embed.js" data-form-uuid="${form.uuid}" async></script>`,
    direct_link: `${baseUrl}/f/${form.uuid}`,
    api_endpoint: `${process.env.API_PREFIX || '/api/v1'}/public/forms/${form.uuid}`,
  };
  return ok(res, embed);
});

module.exports = {
  listForms, getForm, createForm, updateForm, setFormStatus, setFormPassword,
  deleteForm, duplicateForm, saveFormFields, getEmbedCode,
};
