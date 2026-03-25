const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AdminUser = sequelize.define('AdminUser', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  real_name: {
    type: DataTypes.STRING(50)
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  role: {
    type: DataTypes.ENUM('super_admin', 'normal_admin'),
    defaultValue: 'normal_admin',
    comment: '角色：超级管理员/普通管理员'
  },
  permissions: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '权限列表，JSON格式',
    get() {
      const value = this.getDataValue('permissions');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('permissions', JSON.stringify(value || []));
    }
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '状态：1-启用，0-禁用'
  },
  last_login_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '最后登录时间'
  },
  create_time: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'admin_user',
  timestamps: false
});

module.exports = AdminUser;
