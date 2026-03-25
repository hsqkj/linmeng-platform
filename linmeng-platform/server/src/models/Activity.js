const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Activity = sequelize.define('activity', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  demand_code: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true,
    comment: '需求编码'
  },
  community_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '社区用户ID'
  },
  demand_type: {
    type: DataTypes.STRING(20),
    defaultValue: 'activity',
    comment: '需求类型: activity活动需求, space场地招商, consult专家顾问'
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '活动名称'
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '开始时间'
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '结束时间'
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '活动地点'
  },
  expected_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '预计人数'
  },
  target_crowd: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '面向人群: 亲子/少儿,中老年,青年白领,宝妈,全社区居民'
  },
  sponsor_types: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '需求赞助类型: 现金,物资,人力,场地,媒体'
  },
  need_detail: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '具体需求详情JSON'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '活动简介'
  },
  returns: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '商家回报设置'
  },
  space_location: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '场地位置'
  },
  space_area: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '场地面积'
  },
  space_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '场地类型'
  },
  space_facilities: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '配套设施'
  },
  space_requirements: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '招商要求'
  },
  space_returns: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '合作回报'
  },
  consult_field: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '咨询领域'
  },
  consult_expertise: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '专业要求'
  },
  consult_duration: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '咨询周期'
  },
  consult_budget: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '预算范围'
  },
  cover_img: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '活动封面图'
  },
  extra_images: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '活动宣传图JSON数组'
  },
  extra_content: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '平台补充图文内容'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '状态: 0待审核 1招募中 2对接中 3已完成 4已取消'
  },
  reject_reason: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '驳回原因'
  },
  site_photos: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '现场照片JSON数组'
  },
  summary: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '活动小结'
  },
  view_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '关注量/浏览量'
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
  create_time: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  update_time: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'activity',
  timestamps: false
});

module.exports = Activity;
