const { Sequelize, Op } = require('sequelize');
const { sequelize, FormSubmission, SubmissionAnswer, FormField } = require('../models');

/**
 * Reporte GENERAL de un formulario: volumen de envíos, tasa de finalización,
 * evolución en el tiempo y últimas respuestas — para el dashboard principal.
 */
async function getGeneralReport(formId, { from, to } = {}) {
  const where = { form_id: formId };
  if (from || to) {
    where.submitted_at = {};
    if (from) where.submitted_at[Op.gte] = new Date(from);
    if (to) where.submitted_at[Op.lte] = new Date(to);
  }

  const totalSubmissions = await FormSubmission.count({ where });

  const byDay = await FormSubmission.findAll({
    where,
    attributes: [
      [Sequelize.fn('DATE', Sequelize.col('submitted_at')), 'day'],
      [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
    ],
    group: [Sequelize.fn('DATE', Sequelize.col('submitted_at'))],
    order: [[Sequelize.fn('DATE', Sequelize.col('submitted_at')), 'ASC']],
    raw: true,
  });

  const byStatus = await FormSubmission.findAll({
    where,
    attributes: ['status', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
    group: ['status'],
    raw: true,
  });

  return {
    total_submissions: totalSubmissions,
    submissions_by_day: byDay,
    submissions_by_status: byStatus,
  };
}

/**
 * Reporte ESPECÍFICO por campo: agrega las respuestas según el tipo de
 * campo (distribución para select/radio/checkbox/rating, estadísticas
 * numéricas para number, conteo de respondidas para texto libre).
 */
async function getFieldReport(formId) {
  const fields = await FormField.findAll({
    where: { form_id: formId, is_active: true },
    order: [['position', 'ASC']],
  });

  const results = [];
  for (const field of fields) {
    if (['heading', 'paragraph', 'divider', 'recaptcha'].includes(field.field_type)) continue;

    const answeredCount = await SubmissionAnswer.count({ where: { field_id: field.id } });

    let stats = { answered_count: answeredCount };

    if (['select', 'multiselect', 'radio', 'checkbox', 'rating'].includes(field.field_type)) {
      const distribution = await SubmissionAnswer.findAll({
        where: { field_id: field.id },
        attributes: ['value_text', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
        group: ['value_text'],
        order: [[Sequelize.fn('COUNT', Sequelize.col('id')), 'DESC']],
        raw: true,
      });
      stats.distribution = distribution;
    }

    if (field.field_type === 'number' || field.field_type === 'rating') {
      const [agg] = await SubmissionAnswer.findAll({
        where: { field_id: field.id },
        attributes: [
          [Sequelize.fn('AVG', Sequelize.col('value_number')), 'average'],
          [Sequelize.fn('MIN', Sequelize.col('value_number')), 'min'],
          [Sequelize.fn('MAX', Sequelize.col('value_number')), 'max'],
        ],
        raw: true,
      });
      stats = { ...stats, ...agg };
    }

    results.push({
      field_id: field.id,
      field_key: field.field_key,
      field_type: field.field_type,
      label: field.label,
      ...stats,
    });
  }

  return results;
}

module.exports = { getGeneralReport, getFieldReport };
