const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

class User extends Model {
  async comparePassword(plain) {
    return bcrypt.compare(plain, this.password_hash);
  }

  toSafeJSON() {
    const { password_hash, ...safe } = this.toJSON();
    return safe;
  }
}

User.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    uuid: { type: DataTypes.CHAR(36), unique: true, defaultValue: () => uuidv4() },
    organization_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    full_name: { type: DataTypes.STRING(150), allowNull: false },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    role: { type: DataTypes.ENUM('owner', 'admin', 'editor', 'viewer'), defaultValue: 'editor' },
    avatar_url: DataTypes.STRING(500),
    // Accesibilidad: preferencias persistentes del usuario, consumidas por el frontend React
    a11y_high_contrast: { type: DataTypes.BOOLEAN, defaultValue: false },
    a11y_font_scale: { type: DataTypes.DECIMAL(3, 2), defaultValue: 1.0 },
    a11y_reduced_motion: { type: DataTypes.BOOLEAN, defaultValue: false },
    locale: { type: DataTypes.STRING(10), defaultValue: 'es' },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    email_verified_at: DataTypes.DATE,
    last_login_at: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password_hash) {
          user.password_hash = await bcrypt.hash(user.password_hash, 12);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password_hash')) {
          user.password_hash = await bcrypt.hash(user.password_hash, 12);
        }
      },
    },
  }
);

module.exports = User;
