const sequelize = require('./src/config/database');

async function migrate() {
  try {
    await sequelize.query(`
      ALTER TABLE activity
      ADD COLUMN view_count INT DEFAULT 0 COMMENT '关注量/浏览量'
    `);
    console.log('添加 view_count 字段成功');
  } catch (error) {
    if (error.message.includes('Duplicate column')) {
      console.log('view_count 字段已存在');
    } else {
      console.error('添加 view_count 字段失败:', error.message);
    }
  }

  try {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS demand_favorite (
        id INT AUTO_INCREMENT PRIMARY KEY,
        merchant_id INT NOT NULL COMMENT '商家ID',
        activity_id INT NOT NULL COMMENT '需求ID',
        create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_favorite (merchant_id, activity_id),
        INDEX idx_merchant (merchant_id),
        INDEX idx_activity (activity_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='需求收藏表'
    `);
    console.log('创建 demand_favorite 表成功');
  } catch (error) {
    console.error('创建 demand_favorite 表失败:', error.message);
  }

  process.exit(0);
}

migrate();
