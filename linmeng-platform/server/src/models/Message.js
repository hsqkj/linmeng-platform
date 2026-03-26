const { DataTypes } = require('sequelize');

const sequelize = require('../config/database');

const Message = sequelize.define('message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_type: {
    type: DataTypes.TINYINT,
    allowNull: false,
    comment: '接收用户类型: 0社区 1商家'
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '用户ID'
  },
  sender_type: {
    type: DataTypes.TINYINT,
    allowNull: true,
    comment: '发送者类型: 0系统 1社区 2商家'
  },
  sender_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '发送者ID'
  },
  msg_type: {
    type: DataTypes.TINYINT,
    allowNull: false,
    comment: '消息类型: 0系统通知 1对接聊天'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '消息内容'
  },
  activity_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '关联活动ID'
  },
  read_status: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '读取状态: 0未读 1已读'
  },
  create_time: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'message',
  timestamps: false
});

module.exports = Message;
