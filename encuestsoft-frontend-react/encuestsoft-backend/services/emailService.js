const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
    : undefined,
});

async function sendMail({ to, subject, html, attachments }) {
  if (!to) return null;
  try {
    return await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to,
      subject,
      html,
      attachments,
    });
  } catch (err) {
    logger.error(`Error enviando correo a ${to}: ${err.message}`);
    return null;
  }
}

/** Notifica a los correos del equipo sobre un nuevo envío de formulario. */
async function notifyNewSubmission(form, submission, answersSummaryHtml) {
  if (!form.notify_email_enabled || !form.notify_emails) return;
  const recipients = form.notify_emails.split(',').map((e) => e.trim()).filter(Boolean);
  if (!recipients.length) return;

  await sendMail({
    to: recipients.join(','),
    subject: `Nuevo envío en "${form.title}" — Ref. ${submission.reference_id}`,
    html: `
      <h2>Nuevo envío recibido</h2>
      <p><strong>Formulario:</strong> ${form.title}</p>
      <p><strong>Referencia:</strong> ${submission.reference_id}</p>
      <p><strong>Fecha:</strong> ${new Date(submission.submitted_at).toLocaleString('es-CO')}</p>
      <hr />
      ${answersSummaryHtml}
    `,
  });
}

/** Envía la respuesta automática al remitente si el formulario la tiene habilitada. */
async function sendAutoresponder(form, respondentEmail) {
  if (!form.autoresponder_enabled || !respondentEmail) return;
  await sendMail({
    to: respondentEmail,
    subject: form.autoresponder_subject || 'Hemos recibido tu formulario',
    html: form.autoresponder_body || '<p>Gracias por tu envío. Lo hemos recibido correctamente.</p>',
  });
}

module.exports = { sendMail, notifyNewSubmission, sendAutoresponder };
