const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MerchantUser = sequelize.define('merchant_user', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  merchant_code: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true,
    comment: '商家编码'
  },
  openid: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '微信openid'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: '手机号'
  },
  business_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '商家名称'
  },
  contact_name: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '联系人姓名'
  },
  industry: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '所属行业'
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '商家地址'
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: true,
    comment: '纬度'
  },
  longitude: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: true,
    comment: '经度'
  },
  location: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '商家位置坐标'
  },
  license_img: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '营业执照照片'
  },
  logo: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '商家logo'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '商家简介'
  },
  sponsor_types: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '可提供赞助类型: 现金,物资,人力,场地'
  },
  sponsor_detail: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '赞助详情JSON'
  },
  return_expect: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '期望回报'
  },
  target_crowd: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '目标人群标签'
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
  member_level: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '会员等级: 0无 1银卡 2金卡 3钻石'
  },
  member_expire: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '会员到期时间'
  },
  monthly_quota: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '每月报名配额'
  },
  used_quota: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '已使用配额'
  },
  star_rating: {
    type: DataTypes.DECIMAL(2, 1),
    defaultValue: 5.0,
    comment: '综合星级评分'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '审核状态: 0待审核 1已通过 2已驳回'
  },
  reject_reason: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '驳回原因'
  },
  channel_code: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '渠道码'
  },
  salesman_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '业务员ID'
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
  tableName: 'merchant_user',
  timestamps: false
});

module.exports = MerchantUser;
