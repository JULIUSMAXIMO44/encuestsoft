const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const slugify = require('slugify');
const { sequelize, User, Organization, Plan } = require('../models');
const { ok, created, fail } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

function issueTokens(user) {
  const accessToken = jwt.sign({ sub: user.id, org: user.organization_id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
  const refreshToken = jwt.sign({ sub: user.id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });
  return { accessToken, refreshToken };
}

const register = asyncHandler(async (req, res) => {
  const { organization_name, full_name, email, password } = req.body;

  const existing = await User.findOne({ where: { email } });
  if (existing) return fail(res, 'Ya existe una cuenta con este correo.', 409);

  const defaultPlan = await Plan.findOne({ where: { code: process.env.DEFAULT_PLAN_CODE || 'free' } });
  if (!defaultPlan) return fail(res, 'No hay un plan por defecto configurado. Ejecuta la inicialización de base de datos.', 500);

  const result = await sequelize.transaction(async (t) => {
    const org = await Organization.create(
      {
        name: organization_name,
        slug: `${slugify(organization_name, { lower: true, strict: true })}-${uuidv4().slice(0, 6)}`,
        plan_id: defaultPlan.id,
        trial_ends_at: new Date(Date.now() + parseInt(process.env.TRIAL_DAYS || '14', 10) * 86400000),
      },
      { transaction: t }
    );
    const user = await User.create(
      {
        organization_id: org.id,
        full_name,
        email,
        password_hash: password,
        role: 'owner',
      },
      { transaction: t }
    );
    return { org, user };
  });

  const tokens = issueTokens(result.user);
  return created(res, { user: result.user.toSafeJSON(), organization: result.org, ...tokens }, 'Cuenta creada correctamente.');
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email }, include: [Organization] });
  if (!user || !(await user.comparePassword(password))) {
    return fail(res, 'Credenciales inválidas.', 401);
  }
  if (!user.is_active) return fail(res, 'Tu cuenta está inactiva. Contacta al administrador.', 403);

  await user.update({ last_login_at: new Date() });
  const tokens = issueTokens(user);
  return ok(res, { user: user.toSafeJSON(), organization: user.Organization, ...tokens }, 'Sesión iniciada correctamente.');
});

const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return fail(res, 'Falta el refresh token.', 400);
  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findByPk(payload.sub);
    if (!user || !user.is_active) return fail(res, 'Usuario inválido.', 401);
    const tokens = issueTokens(user);
    return ok(res, tokens, 'Token renovado.');
  } catch {
    return fail(res, 'Refresh token inválido o expirado.', 401);
  }
});

const me = asyncHandler(async (req, res) => {
  const org = await Organization.findByPk(req.user.organization_id, { include: [Plan] });
  return ok(res, { user: req.user.toSafeJSON(), organization: org });
});

const updateA11yPreferences = asyncHandler(async (req, res) => {
  const { a11y_high_contrast, a11y_font_scale, a11y_reduced_motion, locale } = req.body;
  await req.user.update({
    ...(a11y_high_contrast !== undefined && { a11y_high_contrast }),
    ...(a11y_font_scale !== undefined && { a11y_font_scale }),
    ...(a11y_reduced_motion !== undefined && { a11y_reduced_motion }),
    ...(locale !== undefined && { locale }),
  });
  return ok(res, req.user.toSafeJSON(), 'Preferencias actualizadas.');
});

module.exports = { register, login, refresh, me, updateA11yPreferences };
