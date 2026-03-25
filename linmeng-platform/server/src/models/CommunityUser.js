const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CommunityUser = sequelize.define('community_user', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  community_code: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true,
    comment: '社区编码'
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
  community_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '社区全称'
  },
  contact_name: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '负责人姓名'
  },
  district: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '所在区'
  },
  street: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '所属街道'
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '详细地址'
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
    comment: '社区具体位置'
  },
  total_households: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '居民总户数'
  },
  elderly_ratio: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: '老年人占比'
  },
  youth_family_ratio: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: '青少年家庭占比'
  },
  public_space_area: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: '公共空间面积(㎡)'
  },
  residential_areas: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '所辖小区名称'
  },
  nearby_merchants: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '辖区商户数量'
  },
  license_img: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '资质证明照片'
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
  create_time: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  update_time: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'community_user',
  timestamps: false
});

module.exports = CommunityUser;
