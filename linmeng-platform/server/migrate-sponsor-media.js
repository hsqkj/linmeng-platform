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
      ALTER TABLE sponsor_infos 
      ADD COLUMN images TEXT NULL COMMENT '图片JSON数组' AFTER sponsor_detail
    `);
    console.log('添加 images 字段成功');
  } catch (error) {
    if (error.code !== 'ER_DUP_FIELDNAME') {
      console.error('添加 images 字段失败:', error.message);
    } else {
      console.log('images 字段已存在');
    }
  }

  try {
    await connection.query(`
      ALTER TABLE sponsor_infos 
      ADD COLUMN video VARCHAR(255) NULL COMMENT '视频URL' AFTER images
    `);
    console.log('添加 video 字段成功');
  } catch (error) {
    if (error.code !== 'ER_DUP_FIELDNAME') {
      console.error('添加 video 字段失败:', error.message);
    } else {
      console.log('video 字段已存在');
    }
  }

  try {
    await connection.query(`
      ALTER TABLE sponsor_infos 
      ADD COLUMN view_count INT DEFAULT 0 COMMENT '阅读量' AFTER contact_phone
    `);
    console.log('添加 view_count 字段成功');
  } catch (error) {
    if (error.code !== 'ER_DUP_FIELDNAME') {
      console.error('添加 view_count 字段失败:', error.message);
    } else {
      console.log('view_count 字段已存在');
    }
  }

  try {
    await connection.query(`
      ALTER TABLE sponsor_infos 
      ADD COLUMN consult_count INT DEFAULT 0 COMMENT '咨询量' AFTER view_count
    `);
    console.log('添加 consult_count 字段成功');
  } catch (error) {
    if (error.code !== 'ER_DUP_FIELDNAME') {
      console.error('添加 consult_count 字段失败:', error.message);
    } else {
      console.log('consult_count 字段已存在');
    }
  }

  await connection.end();
  console.log('数据库迁移完成！');
}

migrate().catch(console.error);
