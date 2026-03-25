const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MemberPackage = sequelize.define('MemberPackage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  apply_quota: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  features: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  create_time: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'member_package',
  timestamps: false
});

module.exports = MemberPackage;
