const axios = require('axios');
const crypto = require('crypto');
const logger = require('../utils/logger');

/** Suscribe (o actualiza) un contacto en una lista/audiencia de Mailchimp. */
async function syncToMailchimp(integration, respondentEmail, mergeFields = {}) {
  if (!respondentEmail || !integration.api_key || !integration.list_or_audience_id) return;
  const dc = integration.api_key.split('-').pop();
  const subscriberHash = crypto.createHash('md5').update(respondentEmail.toLowerCase()).digest('hex');
  const url = `https://${dc}.api.mailchimp.com/3.0/lists/${integration.list_or_audience_id}/members/${subscriberHash}`;

  try {
    await axios.put(
      url,
      { email_address: respondentEmail, status_if_new: 'subscribed', merge_fields: mergeFields },
      { auth: { username: 'anystring', password: integration.api_key } }
    );
  } catch (err) {
    logger.error(`Error sincronizando con Mailchimp: ${err.response?.data?.detail || err.message}`);
  }
}

/** Suscribe un contacto en una lista de Acelle Email (self-hosted). */
async function syncToAcelle(integration, respondentEmail, fields = {}) {
  if (!respondentEmail || !integration.api_url || !integration.api_token) return;
  try {
    await axios.post(
      `${integration.api_url}/api/v1/subscribers`,
      {
        list_uid: integration.list_or_audience_id,
        EMAIL: respondentEmail,
        ...fields,
      },
      { params: { api_token: integration.api_token } }
    );
  } catch (err) {
    logger.error(`Error sincronizando con Acelle Email: ${err.response?.data?.message || err.message}`);
  }
}

async function syncIntegrations(integrations, respondentEmail, answersByKey) {
  await Promise.all(
    integrations.filter((i) => i.is_active).map((integration) => {
      const mapping = integration.field_mapping_json || {};
      const mapped = Object.fromEntries(
        Object.entries(mapping).map(([mergeKey, fieldKey]) => [mergeKey, answersByKey[fieldKey]])
      );
      return integration.provider === 'mailchimp'
        ? syncToMailchimp(integration, respondentEmail, mapped)
        : syncToAcelle(integration, respondentEmail, mapped);
    })
  );
}

module.exports = { syncIntegrations, syncToMailchimp, syncToAcelle };
