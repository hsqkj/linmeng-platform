const sequelize = require('./src/config/database');

async function migrate() {
  try {
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'sponsor_infos' 
      AND TABLE_SCHEMA = 'linmeng' 
      AND COLUMN_NAME = 'tags'
    `);
    
    if (results.length === 0) {
      await sequelize.query(`
        ALTER TABLE sponsor_infos
        ADD COLUMN tags TEXT COMMENT '标签ID列表JSON数组'
      `);
      console.log('sponsor_infos表添加tags字段成功');
    } else {
      console.log('sponsor_infos表tags字段已存在');
    }

    const [results2] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'sponsor_infos' 
      AND TABLE_SCHEMA = 'linmeng' 
      AND COLUMN_NAME = 'custom_tags'
    `);
    
    if (results2.length === 0) {
      await sequelize.query(`
        ALTER TABLE sponsor_infos
        ADD COLUMN custom_tags TEXT COMMENT '自定义标签JSON数组'
      `);
      console.log('sponsor_infos表添加custom_tags字段成功');
    } else {
      console.log('sponsor_infos表custom_tags字段已存在');
    }

    console.log('迁移完成');
  } catch (error) {
    console.error('迁移失败:', error.message);
  }

  process.exit(0);
}

migrate();
