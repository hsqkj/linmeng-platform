require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

const createDatabase = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    console.log('MySQL 连接成功');

    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'linmeng'}\` 
       DEFAULT CHARACTER SET utf8mb4 
       COLLATE utf8mb4_unicode_ci`
    );

    console.log(`数据库 "${process.env.DB_NAME || 'linmeng'}" 创建成功`);

    await connection.end();

    console.log('\n========================================');
    console.log('数据库创建完成！');
    console.log('========================================');
    console.log('\n接下来请运行: npm run init-db');
    console.log('来初始化数据表和测试数据\n');

    process.exit(0);
  } catch (error) {
    console.error('创建数据库失败:', error.message);
    console.log('\n请检查以下配置：');
    console.log('1. MySQL 服务是否已启动');
    console.log('2. .env 文件中的数据库连接信息是否正确');
    console.log('   - DB_HOST: ' + (process.env.DB_HOST || 'localhost'));
    console.log('   - DB_PORT: ' + (process.env.DB_PORT || 3306));
    console.log('   - DB_USER: ' + (process.env.DB_USER || 'root'));
    console.log('   - DB_PASSWORD: ' + (process.env.DB_PASSWORD || '(空)'));
    process.exit(1);
  }
};

createDatabase();
