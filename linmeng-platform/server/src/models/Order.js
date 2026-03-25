const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  business_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '商家ID'
  },
  order_type: {
    type: DataTypes.TINYINT,
    allowNull: false,
    comment: '订单类型: 0会员年费 1定制活动服务'
  },
  order_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '订单名称'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '订单金额'
  },
  pay_status: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '支付状态: 0待支付 1支付成功 2支付失败 3已退款'
  },
  pay_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '支付时间'
  },
  order_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '订单编号'
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
  tableName: 'order',
  timestamps: false
});

module.exports = Order;
