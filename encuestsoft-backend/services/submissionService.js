const { sequelize, FormSubmission, SubmissionAnswer, SubmissionFile, Webhook, EmailIntegration, Organization } = require('../models');
const { generateReferenceId } = require('../utils/referenceId');
const { validateSubmission } = require('../utils/fieldValidator');
const { isFieldVisible } = require('../utils/conditionalLogic');
const { sanitizeAnswers } = require('./sanitizeService');
const { ApiError } = require('../utils/apiResponse');
const { notifyNewSubmission, sendAutoresponder } = require('./emailService');
const { dispatchWebhooks } = require('./webhookService');
const { syncIntegrations } = require('./integrationService');
const { generateSubmissionPdf } = require('./pdfService');
const logger = require('../utils/logger');

/**
 * Orquesta el registro completo de un envío de formulario público:
 * 1) valida (tipos, requeridos, condicionales, archivos)
 * 2) sanitiza y persiste (JSON crudo + tabla EAV para reportes)
 * 3) dispara efectos secundarios: webhooks, notificación por correo,
 *    auto-respuesta, integraciones de marketing y PDF de respuesta.
 */
async function createSubmission({ form, fields, body, files, req }) {
  const answersByKey = { ...body };
  const filesByFieldKey = {};
  (files || []).forEach((f) => {
    filesByFieldKey[f.fieldname] = [...(filesByFieldKey[f.fieldname] || []), f];
  });

  const { valid, errors } = validateSubmission(fields, answersByKey, filesByFieldKey);
  if (!valid) {
    throw Object.assign(new ApiError('Errores de validación en el formulario.', 422), { errors });
  }

  const cleanAnswers = sanitizeAnswers(answersByKey);

  // Solo se conservan respuestas de campos actualmente visibles según lógica condicional.
  const applicableFields = fields.filter((f) => isFieldVisible(f.conditional_logic_json, cleanAnswers));
  const applicableAnswers = {};
  for (const f of applicableFields) {
    if (cleanAnswers[f.field_key] !== undefined) applicableAnswers[f.field_key] = cleanAnswers[f.field_key];
  }

  const sequenceCount = (await FormSubmission.count({ where: { form_id: form.id } })) + 1;
  const referenceId = generateReferenceId(form, sequenceCount);
  const respondentEmailField = applicableFields.find((f) => f.field_type === 'email');
  const respondentEmail = respondentEmailField ? applicableAnswers[respondentEmailField.field_key] : null;

  const result = await sequelize.transaction(async (t) => {
    const submission = await FormSubmission.create(
      {
        form_id: form.id,
        organization_id: form.organization_id,
        reference_id: referenceId,
        respondent_email: respondentEmail || null,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        source_url: req.headers.referer || null,
        recaptcha_score: req.recaptchaScore || null,
        raw_answers_json: applicableAnswers,
      },
      { transaction: t }
    );

    // Tabla EAV para estadísticas eficientes por campo
    for (const field of applicableFields) {
      const value = applicableAnswers[field.field_key];
      if (value === undefined) continue;
      const isNumeric = ['number', 'rating'].includes(field.field_type);
      await SubmissionAnswer.create(
        {
          submission_id: submission.id,
          field_id: field.id,
          field_key: field.field_key,
          value_text: Array.isArray(value) ? value.join(', ') : String(value),
          value_number: isNumeric ? parseFloat(value) : null,
          value_date: field.field_type === 'date' ? new Date(value) : null,
        },
        { transaction: t }
      );
    }

    // Archivos subidos (multer ya los guardó en disco; aquí solo registramos metadata)
    for (const [fieldKey, fieldFiles] of Object.entries(filesByFieldKey)) {
      const field = fields.find((f) => f.field_key === fieldKey);
      if (!field) continue;
      for (const file of fieldFiles) {
        await SubmissionFile.create(
          {
            submission_id: submission.id,
            field_id: field.id,
            original_name: file.originalname,
            stored_path: file.path,
            mime_type: file.mimetype,
            size_bytes: file.size,
          },
          { transaction: t }
        );
      }
    }

    await form.increment('submissions_count', { by: 1, transaction: t });
    await Organization.increment('submissions_used_this_month', { by: 1, where: { id: form.organization_id }, transaction: t });

    return submission;
  });

  // Efectos secundarios: no deben bloquear ni fallar la respuesta al usuario final.
  setImmediate(async () => {
    try {
      const [webhooks, integrations] = await Promise.all([
        Webhook.findAll({ where: { form_id: form.id } }),
        EmailIntegration.findAll({ where: { form_id: form.id } }),
      ]);

      if (webhooks.length) await dispatchWebhooks(webhooks, { form, submission: result, answers: applicableAnswers });
      if (integrations.length) await syncIntegrations(integrations, respondentEmail, applicableAnswers);

      const summaryHtml = applicableFields
        .map((f) => `<p><strong>${f.label}:</strong> ${applicableAnswers[f.field_key] ?? '—'}</p>`)
        .join('');
      await notifyNewSubmission(form, result, summaryHtml);
      if (respondentEmail) await sendAutoresponder(form, respondentEmail);

      if (form.submission_pdf_enabled) {
        const organization = await Organization.findByPk(form.organization_id);
        const pdfPath = await generateSubmissionPdf({ form, submission: result, fields: applicableFields, organization });
        await result.update({ pdf_path: pdfPath });
      }
    } catch (err) {
      logger.error(`Error en efectos secundarios del envío ${result.id}: ${err.message}`);
    }
  });

  return { submission: result, referenceId };
}

module.exports = { createSubmission };
