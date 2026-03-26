const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SponsorComment = sequelize.define('SponsorComment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  comment_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '留言编码'
  },
  sponsor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '赞助信息ID'
  },
  community_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '社区ID'
  },
  merchant_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '商家ID（商家回复时才有）'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '留言内容'
  },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
    comment: '父留言ID（用于回复）'
  },
  reply_to_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
    comment: '回复的留言ID'
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: '是否已读'
  },
  create_time: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  update_time: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'sponsor_comments',
  timestamps: false,
  underscored: true
});

module.exports = SponsorComment;
