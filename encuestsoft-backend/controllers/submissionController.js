const fs = require('fs');
const { FormSubmission, Form, FormField, SubmissionFile } = require('../models');
const { ok, fail } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { exportToCsv, exportToExcel } = require('../services/exportService');
const { generateSubmissionPdf } = require('../services/pdfService');
const { Organization } = require('../models');

async function assertFormOwnership(formId, organizationId) {
  const form = await Form.findOne({ where: { id: formId, organization_id: organizationId } });
  return form;
}

const listSubmissions = asyncHandler(async (req, res) => {
  const form = await assertFormOwnership(req.params.formId, req.organizationId);
  if (!form) return fail(res, 'Formulario no encontrado.', 404);

  const page = parseInt(req.query.page || '1', 10);
  const pageSize = Math.min(parseInt(req.query.page_size || '25', 10), 100);

  const { rows, count } = await FormSubmission.findAndCountAll({
    where: { form_id: form.id },
    include: [{ model: SubmissionFile, as: 'files' }],
    order: [['submitted_at', 'DESC']],
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  return ok(res, rows, 'OK', 200, { total: count, page, page_size: pageSize, total_pages: Math.ceil(count / pageSize) });
});

const getSubmission = asyncHandler(async (req, res) => {
  const form = await assertFormOwnership(req.params.formId, req.organizationId);
  if (!form) return fail(res, 'Formulario no encontrado.', 404);
  const submission = await FormSubmission.findOne({
    where: { id: req.params.id, form_id: form.id },
    include: [{ model: SubmissionFile, as: 'files' }],
  });
  if (!submission) return fail(res, 'Envío no encontrado.', 404);
  return ok(res, submission);
});

const deleteSubmission = asyncHandler(async (req, res) => {
  const form = await assertFormOwnership(req.params.formId, req.organizationId);
  if (!form) return fail(res, 'Formulario no encontrado.', 404);
  const deleted = await FormSubmission.destroy({ where: { id: req.params.id, form_id: form.id } });
  if (!deleted) return fail(res, 'Envío no encontrado.', 404);
  return ok(res, null, 'Envío eliminado.');
});

/** Exporta todos los envíos de un formulario en CSV o Excel (.xlsx). */
const exportSubmissions = asyncHandler(async (req, res) => {
  const form = await assertFormOwnership(req.params.formId, req.organizationId);
  if (!form) return fail(res, 'Formulario no encontrado.', 404);

  const fields = await FormField.findAll({ where: { form_id: form.id, is_active: true }, order: [['position', 'ASC']] });
  const submissions = await FormSubmission.findAll({ where: { form_id: form.id }, order: [['submitted_at', 'DESC']] });
  const format = (req.query.format || 'csv').toLowerCase();

  if (format === 'xlsx') {
    const buffer = await exportToExcel(submissions, fields, form.title);
    res.setHeader('Content-Disposition', `attachment; filename="${form.slug}-respuestas.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.send(buffer);
  }

  const csv = exportToCsv(submissions, fields);
  res.setHeader('Content-Disposition', `attachment; filename="${form.slug}-respuestas.csv"`);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  return res.send(csv);
});

/** Descarga (o genera bajo demanda) el PDF de una respuesta puntual. */
const downloadSubmissionPdf = asyncHandler(async (req, res) => {
  const form = await assertFormOwnership(req.params.formId, req.organizationId);
  if (!form) return fail(res, 'Formulario no encontrado.', 404);
  const submission = await FormSubmission.findOne({ where: { id: req.params.id, form_id: form.id } });
  if (!submission) return fail(res, 'Envío no encontrado.', 404);

  if (!submission.pdf_path || !fs.existsSync(submission.pdf_path)) {
    const fields = await FormField.findAll({ where: { form_id: form.id }, order: [['position', 'ASC']] });
    const organization = await Organization.findByPk(form.organization_id);
    const pdfPath = await generateSubmissionPdf({ form, submission, fields, organization });
    await submission.update({ pdf_path: pdfPath });
  }
  return res.download(submission.pdf_path, `${submission.reference_id}.pdf`);
});

module.exports = { listSubmissions, getSubmission, deleteSubmission, exportSubmissions, downloadSubmissionPdf };
