const bcrypt = require('bcryptjs');
const { Form, FormField, Organization, Plan } = require('../models');

/**
 * Carga un formulario público por su slug de organización + formulario,
 * validando estado de publicación, ventana de fechas, contraseña
 * y límites del plan SaaS antes de continuar.
 */
async function loadPublicForm(req, res, next) {
  try {
    const { formUuid } = req.params;
    const form = await Form.findOne({
      where: { uuid: formUuid },
      include: [
        { model: FormField, as: 'fields', where: { is_active: true }, required: false },
        { model: Organization, include: [Plan] },
      ],
      order: [[{ model: FormField, as: 'fields' }, 'position', 'ASC']],
    });

    if (!form || form.status !== 'published' || form.deleted_at) {
      return res.status(404).json({ success: false, message: 'Formulario no disponible.' });
    }

    const now = new Date();
    if (form.opens_at && now < form.opens_at) {
      return res.status(403).json({ success: false, message: 'Este formulario aún no está abierto.' });
    }
    if (form.closes_at && now > form.closes_at) {
      return res.status(403).json({ success: false, message: 'Este formulario ya ha cerrado.' });
    }
    if (form.submission_limit && form.submissions_count >= form.submission_limit) {
      return res.status(403).json({ success: false, message: 'Se alcanzó el límite de envíos de este formulario.' });
    }

    // Formulario protegido con contraseña
    if (form.is_password_protected) {
      const provided = req.headers['x-form-password'] || req.body.form_password;
      if (!provided || !(await bcrypt.compare(provided, form.password_hash))) {
        return res.status(401).json({
          success: false,
          code: 'PASSWORD_REQUIRED',
          message: 'Este formulario requiere contraseña.',
        });
      }
    }

    // Límite mensual de envíos del plan SaaS
    const org = form.Organization;
    if (org && org.Plan && org.submissions_used_this_month >= org.Plan.max_submissions_per_month) {
      return res.status(403).json({
        success: false,
        message: 'La organización alcanzó su límite mensual de envíos del plan actual.',
      });
    }

    req.form = form;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { loadPublicForm };
