const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DemandFavorite = sequelize.define('demand_favorite', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  merchant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '商家ID'
  },
  activity_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '需求ID'
  },
  create_time: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'demand_favorite',
  timestamps: false
});

module.exports = DemandFavorite;
