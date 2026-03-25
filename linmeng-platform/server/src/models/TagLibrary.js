const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TagLibrary = sequelize.define('tag_library', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '标签名称'
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '标签分类: demand需求标签, merchant商家标签'
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '标签类型: sponsor赞助类型, crowd人群, industry行业等'
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '排序'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '状态: 0禁用 1启用'
  },
  create_time: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'tag_library',
  timestamps: false
});

module.exports = TagLibrary;
