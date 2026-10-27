const jwt = require('jsonwebtoken');
const { User, Organization } = require('../models');

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token de autenticación no proporcionado.' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(payload.sub, { include: [Organization] });

    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, message: 'Usuario no válido o inactivo.' });
    }

    req.user = user;
    req.organizationId = user.organization_id;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token inválido o expirado.' });
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'No autenticado.' });
    }
    if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'No tienes permisos para esta acción.' });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
