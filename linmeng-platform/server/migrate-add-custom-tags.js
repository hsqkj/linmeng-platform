const sequelize = require('./src/config/database');

async function migrate() {
  try {
    await sequelize.query(`
      ALTER TABLE merchant_user
      ADD COLUMN IF NOT EXISTS custom_tags TEXT COMMENT '自定义标签JSON数组'
    `);
    console.log('merchant_user表添加custom_tags字段成功');

    await sequelize.query(`
      ALTER TABLE activity
      ADD COLUMN IF NOT EXISTS custom_tags TEXT COMMENT '自定义标签JSON数组'
    `);
    console.log('activity表添加custom_tags字段成功');

    console.log('迁移完成');
  } catch (error) {
    console.error('迁移失败:', error.message);
  }

  process.exit(0);
}

migrate();
