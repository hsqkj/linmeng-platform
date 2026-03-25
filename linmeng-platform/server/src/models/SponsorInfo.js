const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SponsorInfo = sequelize.define('SponsorInfo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sponsor_code: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true,
    comment: '赞助编码'
  },
  merchant_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  sponsor_type: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  sponsor_detail: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  images: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '图片JSON数组'
  },
  video: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '视频URL'
  },
  contact_name: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  contact_phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  tags: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '标签ID列表JSON数组'
  },
  custom_tags: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '自定义标签JSON数组'
  },
  view_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '阅读量'
  },
  consult_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '咨询量'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '0-下架 1-上架'
  },
  create_time: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'sponsor_infos',
  timestamps: false
});

module.exports = SponsorInfo;
