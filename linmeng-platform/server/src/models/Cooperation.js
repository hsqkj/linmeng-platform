const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cooperation = sequelize.define('cooperation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  cooperation_code: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true,
    comment: '合作编码'
  },
  activity_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '活动ID'
  },
  merchant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '商家ID'
  },
  community_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '社区ID'
  },
  sponsor_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '赞助类型'
  },
  sponsor_detail: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '赞助详情'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '状态: 0待确认 1已通过 2已拒绝 3已完成'
  },
  reject_reason: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '拒绝原因'
  },
  confirm_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '确认时间'
  },
  create_time: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  update_time: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'cooperation',
  timestamps: false
});

module.exports = Cooperation;
