require('dotenv').config();
const sequelize = require('./src/config/database');

const migrateAdminUser = async () => {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');

    await sequelize.query(`
      ALTER TABLE admin_user 
      MODIFY COLUMN username VARCHAR(50) NULL,
      ADD COLUMN role ENUM('super_admin', 'normal_admin') DEFAULT 'normal_admin' COMMENT '角色：超级管理员/普通管理员',
      ADD COLUMN permissions TEXT NULL COMMENT '权限列表，JSON格式',
      ADD COLUMN last_login_time DATETIME NULL COMMENT '最后登录时间'
    `);
    
    console.log('admin_user表迁移成功！');
    
    process.exit(0);
  } catch (error) {
    console.error('迁移失败:', error.message);
    process.exit(1);
  }
};

migrateAdminUser();
