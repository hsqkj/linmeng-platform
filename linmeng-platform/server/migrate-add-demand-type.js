const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'linmeng'
  });

  console.log('开始数据库迁移...');

  try {
    await connection.query(`
      ALTER TABLE activity 
      ADD COLUMN demand_type VARCHAR(20) DEFAULT 'activity' COMMENT '需求类型: activity活动需求, space场地招商, consult专家顾问' AFTER community_id
    `);
    console.log('添加 demand_type 字段成功');
  } catch (error) {
    if (error.code !== 'ER_DUP_FIELDNAME') {
      console.error('添加 demand_type 字段失败:', error.message);
    } else {
      console.log('demand_type 字段已存在');
    }
  }

  try {
    await connection.query(`
      ALTER TABLE activity 
      MODIFY COLUMN start_time DATE NULL COMMENT '开始时间',
      MODIFY COLUMN end_time DATE NULL COMMENT '结束时间',
      MODIFY COLUMN location VARCHAR(255) NULL COMMENT '活动地点',
      MODIFY COLUMN target_crowd VARCHAR(50) NULL COMMENT '面向人群',
      MODIFY COLUMN sponsor_types VARCHAR(100) NULL COMMENT '需求赞助类型'
    `);
    console.log('修改字段允许NULL成功');
  } catch (error) {
    console.error('修改字段失败:', error.message);
  }

  try {
    await connection.query(`
      ALTER TABLE activity 
      ADD COLUMN space_location VARCHAR(255) NULL COMMENT '场地位置' AFTER returns,
      ADD COLUMN space_area VARCHAR(50) NULL COMMENT '场地面积' AFTER space_location,
      ADD COLUMN space_type VARCHAR(50) NULL COMMENT '场地类型' AFTER space_area,
      ADD COLUMN space_facilities TEXT NULL COMMENT '配套设施' AFTER space_type,
      ADD COLUMN space_requirements TEXT NULL COMMENT '招商要求' AFTER space_facilities,
      ADD COLUMN space_returns TEXT NULL COMMENT '合作回报' AFTER space_requirements
    `);
    console.log('添加场地招商字段成功');
  } catch (error) {
    if (error.code !== 'ER_DUP_FIELDNAME') {
      console.error('添加场地招商字段失败:', error.message);
    } else {
      console.log('场地招商字段已存在');
    }
  }

  try {
    await connection.query(`
      ALTER TABLE activity 
      ADD COLUMN consult_field VARCHAR(100) NULL COMMENT '咨询领域' AFTER space_returns,
      ADD COLUMN consult_expertise VARCHAR(255) NULL COMMENT '专业要求' AFTER consult_field,
      ADD COLUMN consult_duration VARCHAR(50) NULL COMMENT '咨询周期' AFTER consult_expertise,
      ADD COLUMN consult_budget VARCHAR(50) NULL COMMENT '预算范围' AFTER consult_duration
    `);
    console.log('添加专家顾问字段成功');
  } catch (error) {
    if (error.code !== 'ER_DUP_FIELDNAME') {
      console.error('添加专家顾问字段失败:', error.message);
    } else {
      console.log('专家顾问字段已存在');
    }
  }

  await connection.end();
  console.log('数据库迁移完成！');
}

migrate().catch(console.error);
