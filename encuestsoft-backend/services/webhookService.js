const axios = require('axios');
const { WebhookLog } = require('../models');
const logger = require('../utils/logger');

/**
 * Dispara todos los webhooks activos de un formulario cuando llega un nuevo
 * envío, con reintentos y registro (WebhookLog) para trazabilidad.
 */
async function dispatchWebhooks(webhooks, { form, submission, answers }) {
  const timeout = parseInt(process.env.WEBHOOK_TIMEOUT_MS || '8000', 10);
  const maxRetries = parseInt(process.env.WEBHOOK_MAX_RETRIES || '3', 10);

  const payload = {
    event: 'form.submission.created',
    form: { id: form.id, uuid: form.uuid, title: form.title },
    submission: {
      id: submission.id,
      uuid: submission.uuid,
      reference_id: submission.reference_id,
      submitted_at: submission.submitted_at,
    },
    answers,
  };

  await Promise.all(
    webhooks.filter((w) => w.is_active).map(async (webhook) => {
      let attempt = 0;
      let lastError = null;

      while (attempt < maxRetries) {
        attempt += 1;
        try {
          const response = await axios({
            method: webhook.method || 'POST',
            url: webhook.url,
            data: payload,
            timeout,
            headers: { 'Content-Type': 'application/json', ...(webhook.headers_json || {}) },
          });

          await WebhookLog.create({
            webhook_id: webhook.id,
            submission_id: submission.id,
            attempt,
            status_code: response.status,
            success: true,
            response_body: JSON.stringify(response.data).slice(0, 2000),
          });
          return;
        } catch (err) {
          lastError = err;
          await WebhookLog.create({
            webhook_id: webhook.id,
            submission_id: submission.id,
            attempt,
            status_code: err.response?.status || null,
            success: false,
            response_body: (err.response ? JSON.stringify(err.response.data) : err.message).slice(0, 2000),
          });
        }
      }
      logger.error(`Webhook ${webhook.url} falló tras ${maxRetries} intentos: ${lastError?.message}`);
    })
  );
}

module.exports = { dispatchWebhooks };
