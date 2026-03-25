const sequelize = require('./src/config/database');

async function migrate() {
  try {
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'merchant_user' 
      AND TABLE_SCHEMA = 'linmeng' 
      AND COLUMN_NAME = 'custom_tags'
    `);
    
    if (results.length === 0) {
      await sequelize.query(`
        ALTER TABLE merchant_user
        ADD COLUMN custom_tags TEXT COMMENT '自定义标签JSON数组'
      `);
      console.log('merchant_user表添加custom_tags字段成功');
    } else {
      console.log('merchant_user表custom_tags字段已存在');
    }

    const [results2] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'activity' 
      AND TABLE_SCHEMA = 'linmeng' 
      AND COLUMN_NAME = 'custom_tags'
    `);
    
    if (results2.length === 0) {
      await sequelize.query(`
        ALTER TABLE activity
        ADD COLUMN custom_tags TEXT COMMENT '自定义标签JSON数组'
      `);
      console.log('activity表添加custom_tags字段成功');
    } else {
      console.log('activity表custom_tags字段已存在');
    }

    console.log('迁移完成');
  } catch (error) {
    console.error('迁移失败:', error.message);
  }

  process.exit(0);
}

migrate();
