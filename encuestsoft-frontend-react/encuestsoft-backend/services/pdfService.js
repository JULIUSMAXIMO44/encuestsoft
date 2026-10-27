const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

/**
 * Genera un PDF con las respuestas de un envío ("Submission PDF").
 * Soporta plantilla "simple" (texto) y "branded" (con color primario
 * de la organización y logo si existe).
 */
async function generateSubmissionPdf({ form, submission, fields, organization }) {
  const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads', 'pdfs');
  fs.mkdirSync(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, `${submission.uuid}.pdf`);
  const brandColor = (organization && organization.primary_color) || '#4F46E5';

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Encabezado
    doc.rect(0, 0, doc.page.width, 70).fill(form.submission_pdf_template === 'branded' ? brandColor : '#1f2937');
    doc.fillColor('#ffffff').fontSize(18).text(form.title, 50, 25, { width: doc.page.width - 100 });
    doc.moveDown(3);

    doc.fillColor('#111827').fontSize(11);
    doc.text(`Referencia: ${submission.reference_id}`);
    doc.text(`Fecha de envío: ${new Date(submission.submitted_at).toLocaleString('es-CO')}`);
    if (submission.respondent_email) doc.text(`Correo del remitente: ${submission.respondent_email}`);
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).strokeColor('#e5e7eb').stroke();
    doc.moveDown();

    const answers = submission.raw_answers_json || {};
    for (const field of fields) {
      if (['heading', 'paragraph', 'divider', 'recaptcha'].includes(field.field_type)) continue;
      const value = answers[field.field_key];
      if (value === undefined) continue;

      doc.fontSize(11).fillColor('#374151').font('Helvetica-Bold').text(field.label);
      const printable = Array.isArray(value) ? value.join(', ') : String(value ?? '—');
      doc.font('Helvetica').fillColor('#111827').text(printable || '—');
      doc.moveDown(0.6);
    }

    doc.end();
    stream.on('finish', () => resolve(filePath));
    stream.on('error', (err) => {
      logger.error(`Error generando PDF de envío: ${err.message}`);
      reject(err);
    });
  });
}

module.exports = { generateSubmissionPdf };
