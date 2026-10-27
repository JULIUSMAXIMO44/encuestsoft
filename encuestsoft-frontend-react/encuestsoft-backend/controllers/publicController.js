const { Form } = require('../models');
const { ok, fail } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { buildA11yAttributes } = require('../utils/accessibility');
const { createSubmission } = require('../services/submissionService');

/**
 * Devuelve el "schema" público del formulario listo para que el frontend
 * React (con hooks tipo useForm/useFormFields) lo renderice directamente,
 * incluyendo atributos de accesibilidad ya calculados por campo.
 */
const getPublicForm = asyncHandler(async (req, res) => {
  const form = req.form; // adjuntado por el middleware loadPublicForm
  await form.increment('views_count', { by: 1 });

  const fields = (form.fields || []).map((f) => ({
    id: f.id,
    field_key: f.field_key,
    field_type: f.field_type,
    label: f.label,
    placeholder: f.placeholder,
    help_text: f.help_text,
    position: f.position,
    step_number: f.step_number,
    is_required: f.is_required,
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
    conditional_logic_json: f.conditional_logic_json,
    custom_attributes_json: f.custom_attributes_json,
    width: f.width,
    a11y: buildA11yAttributes(f),
  }));

  return ok(res, {
    uuid: form.uuid,
    title: form.title,
    description: form.description,
    style_json: form.style_json,
    is_multi_step: form.is_multi_step,
    recaptcha_enabled: form.recaptcha_enabled,
    recaptcha_site_key: form.recaptcha_enabled ? process.env.RECAPTCHA_SITE_KEY : undefined,
    allow_prefill_from_url: form.allow_prefill_from_url,
    success_message: form.success_message,
    error_message: form.error_message,
    redirect_url: form.redirect_url,
    redirect_delay_seconds: form.redirect_delay_seconds,
    custom_attributes_json: form.custom_attributes_json,
    callback_on_submit: form.callback_on_submit,
    fields,
  });
});

/** Recibe el envío del formulario público (con o sin archivos adjuntos vía multer). */
const submitPublicForm = asyncHandler(async (req, res) => {
  const form = req.form;
  const fields = form.fields || [];

  try {
    const { referenceId } = await createSubmission({ form, fields, body: req.body, files: req.files, req });
    return ok(res, {
      reference_id: referenceId,
      message: form.success_message || 'Formulario enviado correctamente.',
      redirect_url: form.redirect_url || null,
      redirect_delay_seconds: form.redirect_delay_seconds || 0,
    }, 'Envío registrado.', 201);
  } catch (err) {
    if (err.statusCode === 422) {
      return res.status(422).json({
        success: false,
        message: form.error_message || err.message,
        errors: err.errors,
      });
    }
    throw err;
  }
});

module.exports = { getPublicForm, submitPublicForm };
