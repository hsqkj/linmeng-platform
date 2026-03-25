const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Evaluate = sequelize.define('evaluate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  activity_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '活动ID'
  },
  community_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '社区ID'
  },
  business_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '商家ID'
  },
  score_quality: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '赞助质量评分1-5,权重40%'
  },
  score_cooperate: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '配合度评分1-5,权重30%'
  },
  score_service: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '服务态度评分1-5,权重30%'
  },
  total_score: {
    type: DataTypes.FLOAT,
    allowNull: false,
    comment: '综合评分'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '评价内容'
  },
  img: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '评价照片'
  },
  create_time: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'evaluate',
  timestamps: false
});

module.exports = Evaluate;
