const axios = require('axios');

/**
 * Verifica el token de Google reCAPTCHA (v2 o v3) enviado por el frontend.
 * Solo se ejecuta si el formulario correspondiente tiene recaptcha_enabled = true.
 */
async function verifyRecaptcha(req, res, next) {
  try {
    const form = req.form; // adjuntado previamente por loadPublicForm
    if (!form || !form.recaptcha_enabled) return next();

    const token = req.body.recaptcha_token || req.body['g-recaptcha-response'];
    if (!token) {
      return res.status(400).json({ success: false, message: 'Falta la verificación reCAPTCHA.' });
    }

    const { data } = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
      params: { secret: process.env.RECAPTCHA_SECRET_KEY, response: token },
    });

    if (!data.success) {
      return res.status(400).json({ success: false, message: 'Verificación reCAPTCHA fallida.' });
    }

    if (form.recaptcha_version === 'v3') {
      const minScore = parseFloat(process.env.RECAPTCHA_MIN_SCORE || '0.5');
      if ((data.score ?? 0) < minScore) {
        return res.status(400).json({ success: false, message: 'Puntuación reCAPTCHA insuficiente.' });
      }
      req.recaptchaScore = data.score;
    }

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { verifyRecaptcha };
