const { Form } = require('../models');
const { ok, fail } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { getGeneralReport, getFieldReport } = require('../services/reportService');

/** Reporte GENERAL: volumen de envíos, evolución diaria, estados. */
const generalReport = asyncHandler(async (req, res) => {
  const form = await Form.findOne({ where: { id: req.params.formId, organization_id: req.organizationId } });
  if (!form) return fail(res, 'Formulario no encontrado.', 404);
  const report = await getGeneralReport(form.id, { from: req.query.from, to: req.query.to });
  return ok(res, report);
});

/** Reporte ESPECÍFICO por campo: distribuciones y estadísticas según tipo de campo. */
const fieldReport = asyncHandler(async (req, res) => {
  const form = await Form.findOne({ where: { id: req.params.formId, organization_id: req.organizationId } });
  if (!form) return fail(res, 'Formulario no encontrado.', 404);
  const report = await getFieldReport(form.id);
  return ok(res, report);
});

module.exports = { generalReport, fieldReport };
